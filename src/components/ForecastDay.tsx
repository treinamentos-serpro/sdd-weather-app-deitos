import { getWeatherCodeDescription } from '../services/weatherCode';
import type {
  ForecastDay as ForecastDayData,
  TemperatureUnit,
  WeatherIconKey,
  WeatherVisualTone,
} from '../types/weather';
import { formatIsoDatePtBr } from '../utils/date';
import { formatTemperature } from '../utils/temperature';
import { getWeatherIcon } from './icons';

interface ForecastDayProps {
  day: ForecastDayData;
  unit: TemperatureUnit;
}

export default function ForecastDay({ day, unit }: ForecastDayProps) {
  const weatherCondition = getWeatherCodeDescription(day.weatherCode);
  const WeatherConditionIcon = getWeatherIcon(weatherCondition.icon);

  return (
    <article
      className={`${getToneClassName(weatherCondition.tone)} min-h-56 rounded-lg border p-4 text-white backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 motion-reduce:transform-none motion-reduce:transition-none`}
    >
      <h3 className="text-sm font-semibold capitalize text-white">{formatIsoDatePtBr(day.date)}</h3>
      <span
        aria-label={weatherCondition.altText}
        className="mt-3 flex min-h-14 items-center gap-2 text-sm font-medium text-white/80"
        role="img"
      >
        <WeatherConditionIcon aria-hidden="true" className="size-7 shrink-0 text-sun" />
        {weatherCondition.label}
      </span>
      <dl className="mt-4 space-y-2 text-sm">
        <ForecastMetric
          icon="thermometer"
          label="Máxima"
          value={formatTemperature(day.maximumTemperatureCelsius, unit)}
        />
        <ForecastMetric
          icon="thermometer"
          label="Mínima"
          value={formatTemperature(day.minimumTemperatureCelsius, unit)}
        />
        <ForecastMetric
          icon="cloudRain"
          label="Precipitação"
          value={formatNumber(day.precipitationMm, ' mm')}
        />
        <ForecastMetric
          icon="wind"
          label="Vento"
          value={formatNumber(day.maximumWindSpeedKmh, ' km/h')}
        />
      </dl>
    </article>
  );
}

interface ForecastMetricProps {
  icon: WeatherIconKey;
  label: string;
  value: string;
}

function ForecastMetric({ icon, label, value }: ForecastMetricProps) {
  const Icon = getWeatherIcon(icon);

  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-1.5 text-white/55">
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
      </dt>
      <dd className="font-semibold text-white tabular-nums">{value}</dd>
    </div>
  );
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
