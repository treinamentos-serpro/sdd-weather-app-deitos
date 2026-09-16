import { type FormEvent, useId, useState } from 'react';
import { getWeatherIcon } from './icons';

const MINIMUM_QUERY_LENGTH = 2;
const VALIDATION_MESSAGE = 'Informe pelo menos 2 caracteres para buscar uma cidade.';
const SearchIcon = getWeatherIcon('search');
const LoaderIcon = getWeatherIcon('loader');

interface SearchFormProps {
  onSearch: (query: string) => void | Promise<void>;
  isLoading?: boolean;
}

export default function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const inputId = useId();
  const messageId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MINIMUM_QUERY_LENGTH) {
      setValidationMessage(VALIDATION_MESSAGE);
      return;
    }

    setValidationMessage(null);
    void onSearch(trimmedQuery);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/85" htmlFor={inputId}>
          Cidade
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            aria-describedby={validationMessage === null ? undefined : messageId}
            aria-invalid={validationMessage === null ? undefined : true}
            className="min-h-12 flex-1 rounded-lg border border-white/10 bg-white/10 px-4 text-base text-white shadow-inner shadow-black/10 outline-none transition duration-200 placeholder:text-white/45 hover:border-white/20 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
            disabled={isLoading}
            id={inputId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: São Paulo"
            type="search"
            value={query}
          />
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent-500 px-5 text-sm font-semibold text-white shadow-lg shadow-accent-600/20 transition duration-200 hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/60 disabled:shadow-none motion-reduce:transition-none"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <LoaderIcon aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            ) : (
              <SearchIcon aria-hidden="true" className="size-4" />
            )}
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>
      {validationMessage !== null ? (
        <p className="text-sm text-sun" id={messageId} role="alert">
          {validationMessage}
        </p>
      ) : null}
    </form>
  );
}
