import type {
  ForecastDay,
  Location,
  OpenMeteoDailyForecastPayload,
  OpenMeteoForecastResponse,
  WeatherData,
} from '../types/weather';
import {
  createHttpError,
  createInvalidJsonError,
  createInvalidPayloadError,
  createNetworkError,
} from './serviceError';

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;
const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'weather_code',
  'relative_humidity_2m',
  'wind_speed_10m',
  'precipitation',
].join(',');
const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_min',
  'temperature_2m_max',
  'precipitation_sum',
  'wind_speed_10m_max',
].join(',');

interface FetchForecastOptions {
  signal?: AbortSignal;
}

export async function fetchForecast(
  location: Location,
  options: FetchForecastOptions = {},
): Promise<WeatherData> {
  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', String(FORECAST_DAYS));
  url.searchParams.set('current', CURRENT_FIELDS);
  url.searchParams.set('daily', DAILY_FIELDS);

  const response = await request(url, options.signal);
  const payload = await readJson<OpenMeteoForecastResponse>(response);

  return normalizeForecast(payload);
}

async function request(url: URL, signal?: AbortSignal): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(url.toString(), { method: 'GET', signal });
  } catch {
    throw createNetworkError();
  }

  if (!response.ok) {
    throw createHttpError(response.status);
  }

  return response;
}

async function readJson<TPayload>(response: Response): Promise<TPayload> {
  try {
    return (await response.json()) as TPayload;
  } catch {
    throw createInvalidJsonError();
  }
}

function normalizeForecast(payload: OpenMeteoForecastResponse): WeatherData {
  if (payload.current === undefined || payload.daily === undefined) {
    throw createInvalidPayloadError('A resposta de previsão não possui dados meteorológicos.');
  }

  if (!Array.isArray(payload.daily.time)) {
    throw createInvalidPayloadError('A resposta de previsão diária não possui datas válidas.');
  }

  return {
    current: {
      temperatureCelsius: toNullableNumber(payload.current.temperature_2m),
      apparentTemperatureCelsius: toNullableNumber(payload.current.apparent_temperature),
      weatherCode: toNullableNumber(payload.current.weather_code),
      relativeHumidity: toNullableNumber(payload.current.relative_humidity_2m),
      windSpeedKmh: toNullableNumber(payload.current.wind_speed_10m),
      precipitationMm: toNullableNumber(payload.current.precipitation),
    },
    daily: normalizeDailyForecast(payload.daily),
  };
}

function normalizeDailyForecast(daily: OpenMeteoDailyForecastPayload): ForecastDay[] {
  if (daily.time === undefined) {
    return [];
  }

  return daily.time.slice(0, FORECAST_DAYS).map((date, index) => ({
    date,
    weatherCode: toNullableNumber(daily.weather_code?.[index]),
    minimumTemperatureCelsius: toNullableNumber(daily.temperature_2m_min?.[index]),
    maximumTemperatureCelsius: toNullableNumber(daily.temperature_2m_max?.[index]),
    precipitationMm: toNullableNumber(daily.precipitation_sum?.[index]),
    maximumWindSpeedKmh: toNullableNumber(daily.wind_speed_10m_max?.[index]),
  }));
}

function toNullableNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' ? value : null;
}
