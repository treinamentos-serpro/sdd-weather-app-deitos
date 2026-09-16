export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface Location {
  id: number;
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
}

export interface CurrentWeather {
  temperatureCelsius: number | null;
  apparentTemperatureCelsius: number | null;
  weatherCode: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minimumTemperatureCelsius: number | null;
  maximumTemperatureCelsius: number | null;
  precipitationMm: number | null;
  maximumWindSpeedKmh: number | null;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: ForecastDay[];
}

export type SearchStatus =
  | 'idle'
  | 'searchingLocations'
  | 'selectingLocation'
  | 'loadingForecast'
  | 'success'
  | 'empty'
  | 'error';

export type WeatherSearchState =
  | {
      status: 'idle';
      locations: [];
      selectedLocation: null;
      weather: null;
      error: null;
    }
  | {
      status: 'searchingLocations';
      locations: [];
      selectedLocation: null;
      weather: null;
      error: null;
    }
  | {
      status: 'selectingLocation';
      locations: Location[];
      selectedLocation: null;
      weather: null;
      error: null;
    }
  | {
      status: 'loadingForecast';
      locations: Location[];
      selectedLocation: Location;
      weather: null;
      error: null;
    }
  | {
      status: 'success';
      locations: Location[];
      selectedLocation: Location;
      weather: WeatherData;
      error: null;
    }
  | {
      status: 'empty';
      locations: [];
      selectedLocation: null;
      weather: null;
      error: null;
    }
  | {
      status: 'error';
      locations: Location[];
      selectedLocation: Location | null;
      weather: null;
      error: WeatherServiceError;
    };

export type WeatherServiceErrorCode = 'network' | 'http' | 'invalidJson' | 'invalidPayload';

export interface WeatherServiceError {
  code: WeatherServiceErrorCode;
  message: string;
  statusCode?: number;
}

export interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  admin1?: string | null;
  timezone?: string | null;
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

export interface OpenMeteoCurrentWeatherPayload {
  temperature_2m?: number | null;
  apparent_temperature?: number | null;
  weather_code?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
}

export interface OpenMeteoDailyForecastPayload {
  time?: string[];
  weather_code?: Array<number | null>;
  temperature_2m_min?: Array<number | null>;
  temperature_2m_max?: Array<number | null>;
  precipitation_sum?: Array<number | null>;
  wind_speed_10m_max?: Array<number | null>;
}

export interface OpenMeteoForecastResponse {
  current?: OpenMeteoCurrentWeatherPayload;
  daily?: OpenMeteoDailyForecastPayload;
}
