export interface WeatherCodeDescription {
  code: number;
  label: string;
  altText: string;
}

const weatherCodeDescriptions = new Map<number, Omit<WeatherCodeDescription, 'code'>>([
  [0, { label: 'Céu limpo', altText: 'Céu limpo sem nuvens relevantes' }],
  [1, { label: 'Principalmente limpo', altText: 'Céu principalmente limpo' }],
  [2, { label: 'Parcialmente nublado', altText: 'Céu parcialmente nublado' }],
  [3, { label: 'Nublado', altText: 'Céu nublado' }],
  [45, { label: 'Neblina', altText: 'Neblina reduzindo a visibilidade' }],
  [48, { label: 'Neblina com geada', altText: 'Neblina com formação de geada' }],
  [51, { label: 'Garoa fraca', altText: 'Garoa fraca' }],
  [53, { label: 'Garoa moderada', altText: 'Garoa moderada' }],
  [55, { label: 'Garoa forte', altText: 'Garoa forte' }],
  [56, { label: 'Garoa congelante fraca', altText: 'Garoa congelante fraca' }],
  [57, { label: 'Garoa congelante forte', altText: 'Garoa congelante forte' }],
  [61, { label: 'Chuva fraca', altText: 'Chuva fraca' }],
  [63, { label: 'Chuva moderada', altText: 'Chuva moderada' }],
  [65, { label: 'Chuva forte', altText: 'Chuva forte' }],
  [66, { label: 'Chuva congelante fraca', altText: 'Chuva congelante fraca' }],
  [67, { label: 'Chuva congelante forte', altText: 'Chuva congelante forte' }],
  [71, { label: 'Neve fraca', altText: 'Queda de neve fraca' }],
  [73, { label: 'Neve moderada', altText: 'Queda de neve moderada' }],
  [75, { label: 'Neve forte', altText: 'Queda de neve forte' }],
  [77, { label: 'Grãos de neve', altText: 'Grãos de neve' }],
  [80, { label: 'Pancadas de chuva fracas', altText: 'Pancadas de chuva fracas' }],
  [81, { label: 'Pancadas de chuva moderadas', altText: 'Pancadas de chuva moderadas' }],
  [82, { label: 'Pancadas de chuva fortes', altText: 'Pancadas de chuva fortes' }],
  [85, { label: 'Pancadas de neve fracas', altText: 'Pancadas de neve fracas' }],
  [86, { label: 'Pancadas de neve fortes', altText: 'Pancadas de neve fortes' }],
  [95, { label: 'Trovoadas', altText: 'Trovoadas' }],
  [96, { label: 'Trovoadas com granizo fraco', altText: 'Trovoadas com granizo fraco' }],
  [99, { label: 'Trovoadas com granizo forte', altText: 'Trovoadas com granizo forte' }],
]);

export function getWeatherCodeDescription(code: number | null): WeatherCodeDescription {
  if (code === null) {
    return {
      code: -1,
      label: 'Condição indisponível',
      altText: 'Condição climática indisponível',
    };
  }

  const description = weatherCodeDescriptions.get(code);

  if (description === undefined) {
    return {
      code,
      label: 'Condição desconhecida',
      altText: `Condição climática desconhecida, código ${code}`,
    };
  }

  return {
    code,
    ...description,
  };
}
