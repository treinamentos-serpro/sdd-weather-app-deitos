import { fetchLocations } from '../../src/services/geocodingService';
import {
  completeGeocodingResponse,
  emptyGeocodingResponse,
  incompleteGeocodingResponse,
} from '../fixtures/api';
import { saoPauloLocation } from '../fixtures/weather';

describe('geocoding service', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls Open-Meteo with encoded query, fixed params and GET method', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(completeGeocodingResponse));

    await fetchLocations('São Paulo');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    const requestUrl = new URL(String(url));

    expect(requestUrl.origin).toBe('https://geocoding-api.open-meteo.com');
    expect(requestUrl.pathname).toBe('/v1/search');
    expect(requestUrl.search).toContain('S%C3%A3o+Paulo');
    expect(requestUrl.searchParams.get('name')).toBe('São Paulo');
    expect(requestUrl.searchParams.get('count')).toBe('10');
    expect(requestUrl.searchParams.get('language')).toBe('pt');
    expect(requestUrl.searchParams.get('format')).toBe('json');
    expect(init).toMatchObject({ method: 'GET' });
  });

  it('normalizes geocoding results and preserves returned order', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(completeGeocodingResponse));

    await expect(fetchLocations('São Paulo')).resolves.toEqual([
      saoPauloLocation,
      {
        id: 6322752,
        name: 'São Paulo',
        country: 'Brasil',
        admin1: null,
        latitude: -23.5333,
        longitude: -46.6167,
        timezone: 'America/Sao_Paulo',
      },
    ]);
  });

  it('limits geocoding results to ten locations', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        results: Array.from({ length: 11 }, (_, index) => ({
          id: index,
          name: `Cidade ${index}`,
          latitude: index,
          longitude: index,
          country: 'Brasil',
          admin1: null,
          timezone: null,
        })),
      }),
    );

    await expect(fetchLocations('Cidade')).resolves.toHaveLength(10);
  });

  it('returns an empty list when results are absent', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(emptyGeocodingResponse));

    await expect(fetchLocations('Lugar nenhum')).resolves.toEqual([]);
  });

  it('throws a typed error for HTTP failures', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({}, { ok: false, status: 503 }));

    await expect(fetchLocations('São Paulo')).rejects.toMatchObject({
      code: 'http',
      statusCode: 503,
    });
  });

  it('throws a typed error for network failures', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(fetchLocations('São Paulo')).rejects.toMatchObject({ code: 'network' });
  });

  it('throws a typed error for invalid JSON', async () => {
    fetchMock.mockResolvedValueOnce(createInvalidJsonResponse());

    await expect(fetchLocations('São Paulo')).rejects.toMatchObject({ code: 'invalidJson' });
  });

  it('throws a typed error when a location has no valid coordinates', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(incompleteGeocodingResponse));

    await expect(fetchLocations('Cidade')).rejects.toMatchObject({ code: 'invalidPayload' });
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
