import type { WeatherIconKey, WeatherVisualTone } from '../types/weather';

export interface WeatherCodeDescription {
  code: number;
  label: string;
  altText: string;
  icon: WeatherIconKey;
  tone: WeatherVisualTone;
}

const weatherCodeDescriptions = new Map<number, Omit<WeatherCodeDescription, 'code'>>([
  [
    0,
    { label: 'Céu limpo', altText: 'Céu limpo sem nuvens relevantes', icon: 'sun', tone: 'clear' },
  ],
  [
    1,
    {
      label: 'Principalmente limpo',
      altText: 'Céu principalmente limpo',
      icon: 'cloudSun',
      tone: 'clear',
    },
  ],
  [
    2,
    {
      label: 'Parcialmente nublado',
      altText: 'Céu parcialmente nublado',
      icon: 'cloudSun',
      tone: 'cloudy',
    },
  ],
  [3, { label: 'Nublado', altText: 'Céu nublado', icon: 'cloud', tone: 'cloudy' }],
  [
    45,
    {
      label: 'Neblina',
      altText: 'Neblina reduzindo a visibilidade',
      icon: 'cloudFog',
      tone: 'fog',
    },
  ],
  [
    48,
    {
      label: 'Neblina com geada',
      altText: 'Neblina com formação de geada',
      icon: 'cloudFog',
      tone: 'fog',
    },
  ],
  [51, { label: 'Garoa fraca', altText: 'Garoa fraca', icon: 'cloudRain', tone: 'rain' }],
  [53, { label: 'Garoa moderada', altText: 'Garoa moderada', icon: 'cloudRain', tone: 'rain' }],
  [55, { label: 'Garoa forte', altText: 'Garoa forte', icon: 'cloudRain', tone: 'rain' }],
  [
    56,
    {
      label: 'Garoa congelante fraca',
      altText: 'Garoa congelante fraca',
      icon: 'cloudRain',
      tone: 'rain',
    },
  ],
  [
    57,
    {
      label: 'Garoa congelante forte',
      altText: 'Garoa congelante forte',
      icon: 'cloudRain',
      tone: 'rain',
    },
  ],
  [61, { label: 'Chuva fraca', altText: 'Chuva fraca', icon: 'cloudRain', tone: 'rain' }],
  [63, { label: 'Chuva moderada', altText: 'Chuva moderada', icon: 'cloudRain', tone: 'rain' }],
  [65, { label: 'Chuva forte', altText: 'Chuva forte', icon: 'cloudRain', tone: 'rain' }],
  [
    66,
    {
      label: 'Chuva congelante fraca',
      altText: 'Chuva congelante fraca',
      icon: 'cloudRain',
      tone: 'rain',
    },
  ],
  [
    67,
    {
      label: 'Chuva congelante forte',
      altText: 'Chuva congelante forte',
      icon: 'cloudRain',
      tone: 'rain',
    },
  ],
  [71, { label: 'Neve fraca', altText: 'Queda de neve fraca', icon: 'cloudSnow', tone: 'snow' }],
  [
    73,
    { label: 'Neve moderada', altText: 'Queda de neve moderada', icon: 'cloudSnow', tone: 'snow' },
  ],
  [75, { label: 'Neve forte', altText: 'Queda de neve forte', icon: 'cloudSnow', tone: 'snow' }],
  [77, { label: 'Grãos de neve', altText: 'Grãos de neve', icon: 'cloudSnow', tone: 'snow' }],
  [
    80,
    {
      label: 'Pancadas de chuva fracas',
      altText: 'Pancadas de chuva fracas',
      icon: 'cloudRain',
      tone: 'rain',
    },
  ],
  [
    81,
    {
      label: 'Pancadas de chuva moderadas',
      altText: 'Pancadas de chuva moderadas',
      icon: 'cloudRain',
      tone: 'rain',
    },
  ],
  [
    82,
    {
      label: 'Pancadas de chuva fortes',
      altText: 'Pancadas de chuva fortes',
      icon: 'cloudRain',
      tone: 'rain',
    },
  ],
  [
    85,
    {
      label: 'Pancadas de neve fracas',
      altText: 'Pancadas de neve fracas',
      icon: 'cloudSnow',
      tone: 'snow',
    },
  ],
  [
    86,
    {
      label: 'Pancadas de neve fortes',
      altText: 'Pancadas de neve fortes',
      icon: 'cloudSnow',
      tone: 'snow',
    },
  ],
  [95, { label: 'Trovoadas', altText: 'Trovoadas', icon: 'cloudLightning', tone: 'storm' }],
  [
    96,
    {
      label: 'Trovoadas com granizo fraco',
      altText: 'Trovoadas com granizo fraco',
      icon: 'cloudLightning',
      tone: 'storm',
    },
  ],
  [
    99,
    {
      label: 'Trovoadas com granizo forte',
      altText: 'Trovoadas com granizo forte',
      icon: 'cloudLightning',
      tone: 'storm',
    },
  ],
]);

export function getWeatherCodeDescription(code: number | null): WeatherCodeDescription {
  if (code === null) {
    return {
      code: -1,
      label: 'Condição indisponível',
      altText: 'Condição climática indisponível',
      icon: 'cloud',
      tone: 'neutral',
    };
  }

  const description = weatherCodeDescriptions.get(code);

  if (description === undefined) {
    return {
      code,
      label: 'Condição desconhecida',
      altText: `Condição climática desconhecida, código ${code}`,
      icon: 'cloud',
      tone: 'neutral',
    };
  }

  return {
    code,
    ...description,
  };
}
