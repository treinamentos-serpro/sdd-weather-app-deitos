import type { Location, WeatherData } from '../../src/types/weather';

export const saoPauloLocation: Location = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.6361,
  timezone: 'America/Sao_Paulo',
};

export const lisbonLocation: Location = {
  id: 2267057,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.7167,
  longitude: -9.1333,
  timezone: 'Europe/Lisbon',
};

export const locationsFixture: Location[] = [saoPauloLocation, lisbonLocation];

export const completeWeatherData: WeatherData = {
  current: {
    temperatureCelsius: 24.4,
    apparentTemperatureCelsius: 26.1,
    weatherCode: 2,
    relativeHumidity: 68,
    windSpeedKmh: 12.5,
    precipitationMm: 0.2,
  },
  daily: [
    {
      date: '2026-09-16',
      weatherCode: 2,
      minimumTemperatureCelsius: 18.2,
      maximumTemperatureCelsius: 27.8,
      precipitationMm: 1.4,
      maximumWindSpeedKmh: 24,
    },
    {
      date: '2026-09-17',
      weatherCode: 61,
      minimumTemperatureCelsius: 17,
      maximumTemperatureCelsius: 23.5,
      precipitationMm: 8.1,
      maximumWindSpeedKmh: 31.2,
    },
    {
      date: '2026-09-18',
      weatherCode: 0,
      minimumTemperatureCelsius: 16.4,
      maximumTemperatureCelsius: 26,
      precipitationMm: 0,
      maximumWindSpeedKmh: 18.7,
    },
    {
      date: '2026-09-19',
      weatherCode: 3,
      minimumTemperatureCelsius: 19.1,
      maximumTemperatureCelsius: 28.3,
      precipitationMm: 0.6,
      maximumWindSpeedKmh: 22.5,
    },
    {
      date: '2026-09-20',
      weatherCode: 95,
      minimumTemperatureCelsius: 20,
      maximumTemperatureCelsius: 29.7,
      precipitationMm: 12.9,
      maximumWindSpeedKmh: 36,
    },
  ],
};

export const incompleteWeatherData: WeatherData = {
  current: {
    temperatureCelsius: null,
    apparentTemperatureCelsius: null,
    weatherCode: null,
    relativeHumidity: null,
    windSpeedKmh: null,
    precipitationMm: null,
  },
  daily: [
    {
      date: '2026-09-16',
      weatherCode: null,
      minimumTemperatureCelsius: null,
      maximumTemperatureCelsius: null,
      precipitationMm: null,
      maximumWindSpeedKmh: null,
    },
  ],
};

export const emptyWeatherData: WeatherData = {
  current: incompleteWeatherData.current,
  daily: [],
};
