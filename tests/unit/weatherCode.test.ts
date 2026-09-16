import { getWeatherCodeDescription } from '../../src/services/weatherCode';

describe('weather code service', () => {
  it('returns label and alt text for known WMO codes', () => {
    expect(getWeatherCodeDescription(61)).toEqual({
      code: 61,
      label: 'Chuva fraca',
      altText: 'Chuva fraca',
    });
  });

  it('returns a readable fallback for unknown codes', () => {
    expect(getWeatherCodeDescription(999)).toEqual({
      code: 999,
      label: 'Condição desconhecida',
      altText: 'Condição climática desconhecida, código 999',
    });
  });

  it('returns a neutral fallback for null weather codes', () => {
    expect(getWeatherCodeDescription(null)).toEqual({
      code: -1,
      label: 'Condição indisponível',
      altText: 'Condição climática indisponível',
    });
  });
});
