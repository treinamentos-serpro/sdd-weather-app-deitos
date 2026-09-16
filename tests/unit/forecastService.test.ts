import { fetchForecast } from '../../src/services/forecastService';
import {
  completeForecastResponse,
  forecastResponseWithoutRequiredData,
  incompleteForecastResponse,
} from '../fixtures/api';
import { completeWeatherData, incompleteWeatherData, saoPauloLocation } from '../fixtures/weather';

describe('forecast service', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls Open-Meteo forecast with coordinates, fields and GET method', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(completeForecastResponse));

    await fetchForecast(saoPauloLocation);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    const requestUrl = new URL(String(url));

    expect(requestUrl.origin).toBe('https://api.open-meteo.com');
    expect(requestUrl.pathname).toBe('/v1/forecast');
    expect(requestUrl.searchParams.get('latitude')).toBe(String(saoPauloLocation.latitude));
    expect(requestUrl.searchParams.get('longitude')).toBe(String(saoPauloLocation.longitude));
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('current')).toBe(
      'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation',
    );
    expect(requestUrl.searchParams.get('daily')).toBe(
      'weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum,wind_speed_10m_max',
    );
    expect(requestUrl.searchParams.has('temperature_unit')).toBe(false);
    expect(init).toMatchObject({ method: 'GET' });
  });

  it('normalizes forecast data using Celsius as the canonical model', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(completeForecastResponse));

    await expect(fetchForecast(saoPauloLocation)).resolves.toEqual(completeWeatherData);
  });

  it('combines daily arrays by index and limits the forecast to five days', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        ...completeForecastResponse,
        daily: {
          time: [
            '2026-09-16',
            '2026-09-17',
            '2026-09-18',
            '2026-09-19',
            '2026-09-20',
            '2026-09-21',
          ],
          weather_code: [0, 1, 2, 3, 45, 61],
          temperature_2m_min: [10, 11, 12, 13, 14, 15],
          temperature_2m_max: [20, 21, 22, 23, 24, 25],
          precipitation_sum: [0, 1, 2, 3, 4, 5],
          wind_speed_10m_max: [10, 20, 30, 40, 50, 60],
        },
      }),
    );

    const forecast = await fetchForecast(saoPauloLocation);

    expect(forecast.daily).toHaveLength(5);
    expect(forecast.daily.at(-1)).toMatchObject({
      date: '2026-09-20',
      weatherCode: 45,
      maximumTemperatureCelsius: 24,
    });
  });

  it('turns missing or null weather fields into null without shifting days', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(incompleteForecastResponse));

    await expect(fetchForecast(saoPauloLocation)).resolves.toEqual(incompleteWeatherData);
  });

  it('throws a typed error for HTTP failures', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({}, { ok: false, status: 500 }));

    await expect(fetchForecast(saoPauloLocation)).rejects.toMatchObject({
      code: 'http',
      statusCode: 500,
    });
  });

  it('throws a typed error for network failures', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(fetchForecast(saoPauloLocation)).rejects.toMatchObject({ code: 'network' });
  });

  it('throws a typed error for invalid JSON', async () => {
    fetchMock.mockResolvedValueOnce(createInvalidJsonResponse());

    await expect(fetchForecast(saoPauloLocation)).rejects.toMatchObject({ code: 'invalidJson' });
  });

  it('throws a typed error when forecast data is missing required sections', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(forecastResponseWithoutRequiredData));

    await expect(fetchForecast(saoPauloLocation)).rejects.toMatchObject({
      code: 'invalidPayload',
    });
  });
});

function createJsonResponse(body: unknown, init: Partial<Response> = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function createInvalidJsonResponse(): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input')),
  } as unknown as Response;
}