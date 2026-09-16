import type { SearchStatus, WeatherServiceError } from '../types/weather';
import { getWeatherIcon } from './icons';

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

  const liveRegion = status === 'error' ? 'assertive' : content.isDynamic ? 'polite' : undefined;
  const FeedbackIcon = getWeatherIcon(content.icon);

  return (
    <section
      aria-live={liveRegion}
      className={`${content.className} rounded-lg border p-5 text-white shadow-glass backdrop-blur-md transition duration-200 motion-reduce:transition-none`}
      role={status === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80">
          <FeedbackIcon
            aria-hidden="true"
            className={content.isLoading ? 'size-5 motion-safe:animate-spin' : 'size-5'}
          />
        </span>
        <div>
          <h2 className="text-base font-semibold">{content.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">{content.message}</p>
        </div>
      </div>
      {status === 'error' && onRetry !== undefined ? (
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 motion-reduce:transition-none"
          onClick={() => void onRetry()}
          type="button"
        >
          {(() => {
            const RefreshIcon = getWeatherIcon('refresh');
            return <RefreshIcon aria-hidden="true" className="size-4" />;
          })()}
          Tentar novamente
        </button>
      ) : null}
    </section>
  );
}

function getFeedbackContent(
  status: SearchStatus,
  error: WeatherServiceError | null,
): {
  title: string;
  message: string;
  isDynamic: boolean;
  isLoading: boolean;
  icon: 'alert' | 'cloud' | 'loader' | 'search';
  className: string;
} | null {
  switch (status) {
    case 'idle':
      return {
        title: 'Busque uma cidade',
        message:
          'Informe uma cidade para ver as localidades encontradas antes de consultar a previsão.',
        isDynamic: false,
        isLoading: false,
        icon: 'search',
        className: 'border-white/10 bg-white/5',
      };
    case 'searchingLocations':
      return {
        title: 'Buscando localidades',
        message: 'Estamos procurando cidades compatíveis com o termo informado.',
        isDynamic: true,
        isLoading: true,
        icon: 'loader',
        className: 'border-cyan-300/20 bg-cyan-300/10',
      };
    case 'loadingForecast':
      return {
        title: 'Carregando previsão',
        message: 'Estamos carregando o clima atual e a previsão dos próximos dias.',
        isDynamic: true,
        isLoading: true,
        icon: 'loader',
        className: 'border-cyan-300/20 bg-cyan-300/10',
      };
    case 'empty':
      return {
        title: 'Nenhuma localidade encontrada',
        message: 'Revise o nome da cidade e tente buscar novamente.',
        isDynamic: true,
        isLoading: false,
        icon: 'cloud',
        className: 'border-teal-200/20 bg-teal-300/10',
      };
    case 'error':
      return {
        title: 'Não foi possível carregar os dados',
        message: error?.message ?? 'Tente novamente em alguns instantes.',
        isDynamic: true,
        isLoading: false,
        icon: 'alert',
        className: 'border-red-300/30 bg-red-400/10',
      };
    case 'selectingLocation':
    case 'success':
      return null;
  }
}
