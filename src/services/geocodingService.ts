import type { Location, OpenMeteoGeocodingResponse, OpenMeteoGeocodingResult } from '../types/weather';
import {
  createHttpError,
  createInvalidJsonError,
  createInvalidPayloadError,
  createNetworkError,
} from './serviceError';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const MAX_LOCATIONS = 10;

interface FetchLocationsOptions {
  signal?: AbortSignal;
}

export async function fetchLocations(
  query: string,
  options: FetchLocationsOptions = {},
): Promise<Location[]> {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set('name', query);
  url.searchParams.set('count', String(MAX_LOCATIONS));
  url.searchParams.set('language', 'pt');
  url.searchParams.set('format', 'json');

  const response = await request(url, options.signal);
  const payload = await readJson<OpenMeteoGeocodingResponse>(response);

  if (payload.results === undefined) {
    return [];
  }

  if (!Array.isArray(payload.results)) {
    throw createInvalidPayloadError('A resposta de localidades está em formato inválido.');
  }

  return payload.results.slice(0, MAX_LOCATIONS).map(normalizeLocation);
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

function normalizeLocation(result: OpenMeteoGeocodingResult): Location {
  if (!isValidLocationResult(result)) {
    throw createInvalidPayloadError('A localidade retornada não possui coordenadas válidas.');
  }

  return {
    id: result.id,
    name: result.name,
    country: result.country ?? null,
    admin1: result.admin1 ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? null,
  };
}

function isValidLocationResult(result: OpenMeteoGeocodingResult): boolean {
  return (
    typeof result.id === 'number' &&
    typeof result.name === 'string' &&
    typeof result.latitude === 'number' &&
    typeof result.longitude === 'number'
  );
}