import type { ForecastDay as ForecastDayData, TemperatureUnit } from '../types/weather';
import ForecastDay from './ForecastDay';

interface DailyForecastProps {
  days: ForecastDayData[];
  unit: TemperatureUnit;
}

export default function DailyForecast({ days, unit }: DailyForecastProps) {
  const forecastDays = days.slice(0, 5);

  return (
    <section aria-labelledby="daily-forecast-title" className="space-y-4">
      <h2 className="text-base font-semibold text-white" id="daily-forecast-title">
        Próximos 5 dias
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecastDays.map((day) => (
          <ForecastDay day={day} key={day.date} unit={unit} />
        ))}
      </div>
    </section>
  );
}