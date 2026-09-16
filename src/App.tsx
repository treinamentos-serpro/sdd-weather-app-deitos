import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import DailyForecast from './components/DailyForecast';
import FeedbackState from './components/FeedbackState';
import LocationResults from './components/LocationResults';
import SearchForm from './components/SearchForm';
import UnitToggle from './components/UnitToggle';
import { useWeatherSearch } from './hooks/useWeatherSearch';
import type { Location, TemperatureUnit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const { state, searchLocations, selectLocation, retry } = useWeatherSearch();
  const isLoading = state.status === 'searchingLocations' || state.status === 'loadingForecast';

  return (
    <main className="min-h-screen bg-night-900 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-400">
              Weather App
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-white sm:text-5xl">
              Previsão do tempo
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
              Busque uma cidade, escolha a localidade correta e consulte o clima atual com a
              previsão diária.
            </p>
          </div>
          <UnitToggle onChange={setUnit} unit={unit} />
        </header>

        <section
          className="rounded-lg border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-5"
          aria-label="Busca de cidade"
        >
          <SearchForm isLoading={isLoading} onSearch={searchLocations} />
        </section>

        <FeedbackState error={state.error} onRetry={retry} status={state.status} />

        {state.status === 'selectingLocation' ? (
          <LocationResults locations={state.locations} onSelect={selectLocation} />
        ) : null}

        {state.status === 'success' ? (
          <section aria-labelledby="selected-location-title" className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/55">
                Localidade selecionada
              </p>
              <h2 className="mt-2 text-2xl font-bold" id="selected-location-title">
                {state.selectedLocation.name}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                {formatLocationContext(state.selectedLocation)}
              </p>
            </div>
            <CurrentWeather current={state.weather.current} unit={unit} />
            <DailyForecast days={state.weather.daily} unit={unit} />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function formatLocationContext(location: Location): string {
  const contextParts = [location.admin1, location.country].filter(
    (part): part is string => part !== null && part.trim().length > 0,
  );

  if (contextParts.length === 0) {
    return 'Contexto regional indisponível';
  }

  return contextParts.join(', ');
}
