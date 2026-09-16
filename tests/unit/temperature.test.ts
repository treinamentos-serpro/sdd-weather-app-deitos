import {
  celsiusToFahrenheit,
  convertTemperature,
  fahrenheitToCelsius,
  formatTemperature,
} from '../../src/utils/temperature';

describe('temperature utils', () => {
  it('converts Celsius to Fahrenheit and back to Celsius', () => {
    const fahrenheit = celsiusToFahrenheit(21);

    expect(fahrenheit).toBeCloseTo(69.8);
    expect(fahrenheitToCelsius(fahrenheit)).toBeCloseTo(21);
  });

  it('keeps canonical Celsius values unchanged when Celsius is selected', () => {
    expect(convertTemperature(21.4, 'celsius')).toBe(21.4);
  });

  it('preserves null values during conversion and formats them with fallback', () => {
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
    expect(formatTemperature(null, 'celsius')).toBe('—');
  });

  it('rounds only when formatting the presentation value', () => {
    expect(convertTemperature(21.4, 'fahrenheit')).toBeCloseTo(70.52);
    expect(formatTemperature(21.4, 'fahrenheit')).toBe('71°F');
    expect(formatTemperature(21.4, 'celsius')).toBe('21°C');
  });
});
