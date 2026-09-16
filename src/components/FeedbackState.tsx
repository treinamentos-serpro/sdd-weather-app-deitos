import type { SearchStatus, WeatherServiceError } from '../types/weather';

interface FeedbackStateProps {
  status: SearchStatus;
  error: WeatherServiceError | null;
  onRetry?: () => void | Promise<void>;
}

export default function FeedbackState({ status, error, onRetry }: FeedbackStateProps) {
  const content = getFeedbackContent(status, error);

  if (content === null) {
    return null;
  }

  return (
    <section
      aria-live={content.isDynamic ? 'polite' : undefined}
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md"
      role={status === 'error' ? 'alert' : 'status'}
    >
      <h2 className="text-base font-semibold">{content.title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/75">{content.message}</p>
      {status === 'error' && onRetry !== undefined ? (
        <button
          className="mt-4 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
          onClick={() => void onRetry()}
          type="button"
        >
          Tentar novamente
        </button>
      ) : null}
    </section>
  );
}

function getFeedbackContent(
  status: SearchStatus,
  error: WeatherServiceError | null,
): { title: string; message: string; isDynamic: boolean } | null {
  switch (status) {
    case 'idle':
      return {
        title: 'Busque uma cidade',
        message:
          'Informe uma cidade para ver as localidades encontradas antes de consultar a previsão.',
        isDynamic: false,
      };
    case 'searchingLocations':
      return {
        title: 'Buscando localidades',
        message: 'Estamos procurando cidades compatíveis com o termo informado.',
        isDynamic: true,
      };
    case 'loadingForecast':
      return {
        title: 'Carregando previsão',
        message: 'Estamos carregando o clima atual e a previsão dos próximos dias.',
        isDynamic: true,
      };
    case 'empty':
      return {
        title: 'Nenhuma localidade encontrada',
        message: 'Revise o nome da cidade e tente buscar novamente.',
        isDynamic: true,
      };
    case 'error':
      return {
        title: 'Não foi possível carregar os dados',
        message: error?.message ?? 'Tente novamente em alguns instantes.',
        isDynamic: true,
      };
    case 'selectingLocation':
    case 'success':
      return null;
  }
}
