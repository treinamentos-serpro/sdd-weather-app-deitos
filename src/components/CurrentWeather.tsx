import { getWeatherCodeDescription } from '../services/weatherCode';
import type { CurrentWeather as CurrentWeatherData, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/temperature';

interface CurrentWeatherProps {
  current: CurrentWeatherData;
  unit: TemperatureUnit;
}

export default function CurrentWeather({ current, unit }: CurrentWeatherProps) {
  const weatherCondition = getWeatherCodeDescription(current.weatherCode);

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60" id="current-weather-title">
            Clima atual
          </h2>
          <p className="mt-3 text-6xl font-bold leading-none text-white">
            {formatTemperature(current.temperatureCelsius, unit)}
          </p>
          <p className="mt-2 text-sm text-white/70">
            Sensação {formatTemperature(current.apparentTemperatureCelsius, unit)}
          </p>
        </div>
        <span
          aria-label={weatherCondition.altText}
          className="rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold"
          role="img"
        >
          {weatherCondition.label}
        </span>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <WeatherMetric label="Umidade" value={formatNumber(current.relativeHumidity, '%')} />
        <WeatherMetric label="Vento" value={formatNumber(current.windSpeedKmh, ' km/h')} />
        <WeatherMetric label="Precipitação" value={formatNumber(current.precipitationMm, ' mm')} />
      </dl>
    </section>
  );
}

interface WeatherMetricProps {
  label: string;
  value: string;
}

function WeatherMetric({ label, value }: WeatherMetricProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-white/55">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-white">{value}</dd>
    </div>
  );
}

function formatNumber(value: number | null, suffix: string): string {
  if (value === null) {
    return '—';
  }

  return `${Math.round(value)}${suffix}`;
}