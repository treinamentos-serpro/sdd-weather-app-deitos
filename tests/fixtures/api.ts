import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
} from '../../src/types/weather';

export const completeGeocodingResponse: OpenMeteoGeocodingResponse = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.6361,
      country: 'Brasil',
      admin1: 'São Paulo',
      timezone: 'America/Sao_Paulo',
    },
    {
      id: 6322752,
      name: 'São Paulo',
      latitude: -23.5333,
      longitude: -46.6167,
      country: 'Brasil',
      admin1: null,
      timezone: 'America/Sao_Paulo',
    },
  ],
};

export const emptyGeocodingResponse: OpenMeteoGeocodingResponse = {};

export const incompleteGeocodingResponse = {
  results: [
    {
      id: 1,
      name: 'Cidade sem coordenadas',
      country: 'Brasil',
      admin1: null,
    },
  ],
};

export const invalidGeocodingJson = '{ "results": [';

export const completeForecastResponse: OpenMeteoForecastResponse = {
  current: {
    temperature_2m: 24.4,
    apparent_temperature: 26.1,
    weather_code: 2,
    relative_humidity_2m: 68,
    wind_speed_10m: 12.5,
    precipitation: 0.2,
  },
  daily: {
    time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
    weather_code: [2, 61, 0, 3, 95],
    temperature_2m_min: [18.2, 17, 16.4, 19.1, 20],
    temperature_2m_max: [27.8, 23.5, 26, 28.3, 29.7],
    precipitation_sum: [1.4, 8.1, 0, 0.6, 12.9],
    wind_speed_10m_max: [24, 31.2, 18.7, 22.5, 36],
  },
};

export const incompleteForecastResponse: OpenMeteoForecastResponse = {
  current: {
    temperature_2m: null,
    apparent_temperature: null,
    weather_code: null,
    relative_humidity_2m: null,
    wind_speed_10m: null,
    precipitation: null,
  },
  daily: {
    time: ['2026-09-16'],
    weather_code: [null],
    temperature_2m_min: [null],
    temperature_2m_max: [null],
    precipitation_sum: [null],
    wind_speed_10m_max: [null],
  },
};

export const forecastResponseWithoutRequiredData: OpenMeteoForecastResponse = {};

export const invalidForecastJson = '{ "current": {';
