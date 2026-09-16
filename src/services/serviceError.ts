import type { WeatherServiceErrorCode } from '../types/weather';

export class WeatherServiceException extends Error {
  readonly code: WeatherServiceErrorCode;
  readonly statusCode?: number;

  constructor(code: WeatherServiceErrorCode, message: string, statusCode?: number) {
    super(message);
    this.name = 'WeatherServiceException';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function createHttpError(statusCode: number): WeatherServiceException {
  return new WeatherServiceException(
    'http',
    'Não foi possível carregar os dados meteorológicos.',
    statusCode,
  );
}

export function createInvalidJsonError(): WeatherServiceException {
  return new WeatherServiceException('invalidJson', 'A resposta recebida não está em JSON válido.');
}

export function createInvalidPayloadError(message: string): WeatherServiceException {
  return new WeatherServiceException('invalidPayload', message);
}

export function createNetworkError(): WeatherServiceException {
  return new WeatherServiceException('network', 'Não foi possível conectar ao serviço meteorológico.');
}