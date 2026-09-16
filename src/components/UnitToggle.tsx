import type { TemperatureUnit } from '../types/weather';
import { getWeatherIcon } from './icons';

const ThermometerIcon = getWeatherIcon('thermometer');

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

const options: Array<{ label: string; value: TemperatureUnit }> = [
  { label: '°C', value: 'celsius' },
  { label: '°F', value: 'fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      <ThermometerIcon aria-hidden="true" className="ml-2 size-4 text-sun" />
      {options.map((option) => {
        const isSelected = option.value === unit;

        return (
          <button
            aria-pressed={isSelected}
            className={
              isSelected
                ? 'min-w-12 rounded-md bg-accent-500 px-3 py-2 text-sm font-semibold text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 motion-reduce:transition-none'
                : 'min-w-12 rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 motion-reduce:transition-none'
            }
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
