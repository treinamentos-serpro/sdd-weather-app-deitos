import { getWeatherCodeDescription } from '../services/weatherCode';
import type {
  CurrentWeather as CurrentWeatherData,
  TemperatureUnit,
  WeatherIconKey,
  WeatherVisualTone,
} from '../types/weather';
import { formatTemperature } from '../utils/temperature';
import { getWeatherIcon } from './icons';

interface CurrentWeatherProps {
  current: CurrentWeatherData;
  unit: TemperatureUnit;
}

export default function CurrentWeather({ current, unit }: CurrentWeatherProps) {
  const weatherCondition = getWeatherCodeDescription(current.weatherCode);
  const WeatherConditionIcon = getWeatherIcon(weatherCondition.icon);

  return (
    <section
      aria-labelledby="current-weather-title"
      className={`${getToneClassName(weatherCondition.tone)} rounded-lg border p-5 text-white shadow-glass backdrop-blur-md transition duration-200 motion-reduce:transition-none sm:p-6`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            className="text-sm font-semibold uppercase tracking-wide text-white/60"
            id="current-weather-title"
          >
            Clima atual
          </h2>
          <p className="mt-3 text-6xl font-bold leading-none text-white">
            {formatTemperature(current.temperatureCelsius, unit)}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/75">
            <MetricInlineIcon icon="gauge" />
            Sensação {formatTemperature(current.apparentTemperatureCelsius, unit)}
          </p>
        </div>
        <span
          aria-label={weatherCondition.altText}
          className="inline-flex w-fit items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold shadow-inner shadow-white/5"
          role="img"
        >
          <WeatherConditionIcon aria-hidden="true" className="size-9 text-sun" />
          {weatherCondition.label}
        </span>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <WeatherMetric
          icon="droplets"
          label="Umidade"
          value={formatNumber(current.relativeHumidity, '%')}
        />
        <WeatherMetric
          icon="wind"
          label="Vento"
          value={formatNumber(current.windSpeedKmh, ' km/h')}
        />
        <WeatherMetric
          icon="cloudRain"
          label="Precipitação"
          value={formatNumber(current.precipitationMm, ' mm')}
        />
      </dl>
    </section>
  );
}

interface WeatherMetricProps {
  icon: WeatherIconKey;
  label: string;
  value: string;
}

function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  const Icon = getWeatherIcon(icon);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition duration-200 hover:bg-white/10 motion-reduce:transition-none">
      <Icon aria-hidden="true" className="mt-0.5 size-5 text-cyan-200" />
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-white/55">{label}</dt>
        <dd className="mt-1 text-lg font-semibold text-white tabular-nums">{value}</dd>
      </div>
    </div>
  );
}

function MetricInlineIcon({ icon }: { icon: WeatherIconKey }) {
  const Icon = getWeatherIcon(icon);

  return <Icon aria-hidden="true" className="size-4 text-sun" />;
}

function getToneClassName(tone: WeatherVisualTone): string {
  switch (tone) {
    case 'clear':
      return 'border-amber-200/20 bg-amber-300/10';
    case 'rain':
      return 'border-cyan-200/20 bg-cyan-300/10';
    case 'storm':
      return 'border-violet-200/20 bg-violet-300/10';
    case 'fog':
    case 'cloudy':
      return 'border-white/10 bg-white/5';
    case 'snow':
      return 'border-sky-100/25 bg-sky-100/10';
    case 'wind':
      return 'border-teal-200/20 bg-teal-300/10';
    case 'neutral':
      return 'border-white/10 bg-white/5';
  }
}

function formatNumber(value: number | null, suffix: string): string {
  if (value === null) {
    return '—';
  }

  return `${Math.round(value)}${suffix}`;
}
