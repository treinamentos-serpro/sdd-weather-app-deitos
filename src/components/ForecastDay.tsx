import { getWeatherCodeDescription } from '../services/weatherCode';
import type { ForecastDay as ForecastDayData, TemperatureUnit } from '../types/weather';
import { formatIsoDatePtBr } from '../utils/date';
import { formatTemperature } from '../utils/temperature';

interface ForecastDayProps {
  day: ForecastDayData;
  unit: TemperatureUnit;
}

export default function ForecastDay({ day, unit }: ForecastDayProps) {
  const weatherCondition = getWeatherCodeDescription(day.weatherCode);

  return (
    <article className="min-h-52 rounded-lg border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md">
      <h3 className="text-sm font-semibold capitalize text-white">{formatIsoDatePtBr(day.date)}</h3>
      <span
        aria-label={weatherCondition.altText}
        className="mt-3 block min-h-10 text-sm font-medium text-white/80"
        role="img"
      >
        {weatherCondition.label}
      </span>
      <dl className="mt-4 space-y-2 text-sm">
        <ForecastMetric label="Máxima" value={formatTemperature(day.maximumTemperatureCelsius, unit)} />
        <ForecastMetric label="Mínima" value={formatTemperature(day.minimumTemperatureCelsius, unit)} />
        <ForecastMetric label="Precipitação" value={formatNumber(day.precipitationMm, ' mm')} />
        <ForecastMetric label="Vento" value={formatNumber(day.maximumWindSpeedKmh, ' km/h')} />
      </dl>
    </article>
  );
}

interface ForecastMetricProps {
  label: string;
  value: string;
}

function ForecastMetric({ label, value }: ForecastMetricProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-white/55">{label}</dt>
      <dd className="font-semibold text-white">{value}</dd>
    </div>
  );
}

function formatNumber(value: number | null, suffix: string): string {
  if (value === null) {
    return '—';
  }

  return `${Math.round(value)}${suffix}`;
}