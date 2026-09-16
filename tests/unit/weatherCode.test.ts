import { getWeatherCodeDescription } from '../../src/services/weatherCode';

describe('weather code service', () => {
  it('returns label and alt text for known WMO codes', () => {
    expect(getWeatherCodeDescription(61)).toEqual({
      code: 61,
      label: 'Chuva fraca',
      altText: 'Chuva fraca',
      icon: 'cloudRain',
      tone: 'rain',
    });
  });

  it('returns a readable fallback for unknown codes', () => {
    expect(getWeatherCodeDescription(999)).toEqual({
      code: 999,
      label: 'Condição desconhecida',
      altText: 'Condição climática desconhecida, código 999',
      icon: 'cloud',
      tone: 'neutral',
    });
  });

  it('returns a neutral fallback for null weather codes', () => {
    expect(getWeatherCodeDescription(null)).toEqual({
      code: -1,
      label: 'Condição indisponível',
      altText: 'Condição climática indisponível',
      icon: 'cloud',
      tone: 'neutral',
    });
  });

  it('returns semantic icon keys and visual tones for main weather groups', () => {
    expect(getWeatherCodeDescription(0)).toMatchObject({ icon: 'sun', tone: 'clear' });
    expect(getWeatherCodeDescription(2)).toMatchObject({ icon: 'cloudSun', tone: 'cloudy' });
    expect(getWeatherCodeDescription(45)).toMatchObject({ icon: 'cloudFog', tone: 'fog' });
    expect(getWeatherCodeDescription(71)).toMatchObject({ icon: 'cloudSnow', tone: 'snow' });
    expect(getWeatherCodeDescription(95)).toMatchObject({
      icon: 'cloudLightning',
      tone: 'storm',
    });
  });
});
