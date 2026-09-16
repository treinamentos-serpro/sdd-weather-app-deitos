import type { TemperatureUnit } from '../types/weather';

const EMPTY_VALUE = '—';

export function celsiusToFahrenheit(valueCelsius: number): number {
  return (valueCelsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(valueFahrenheit: number): number {
  return ((valueFahrenheit - 32) * 5) / 9;
}

export function convertTemperature(
  valueCelsius: number | null,
  unit: TemperatureUnit,
): number | null {
  if (valueCelsius === null) {
    return null;
  }

  if (unit === 'fahrenheit') {
    return celsiusToFahrenheit(valueCelsius);
  }

  return valueCelsius;
}

export function formatTemperature(valueCelsius: number | null, unit: TemperatureUnit): string {
  const convertedValue = convertTemperature(valueCelsius, unit);

  if (convertedValue === null) {
    return EMPTY_VALUE;
  }

  const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';

  return `${Math.round(convertedValue)}${unitLabel}`;
}
