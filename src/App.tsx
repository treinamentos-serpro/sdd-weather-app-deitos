import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import DailyForecast from './components/DailyForecast';
import FeedbackState from './components/FeedbackState';
import { getWeatherIcon } from './components/icons';
import LocationResults from './components/LocationResults';
import SearchForm from './components/SearchForm';
import UnitToggle from './components/UnitToggle';
import { useWeatherSearch } from './hooks/useWeatherSearch';
import type { Location, TemperatureUnit } from './types/weather';

const MapPinIcon = getWeatherIcon('mapPin');

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const { state, searchLocations, selectLocation, retry } = useWeatherSearch();
  const isLoading = state.status === 'searchingLocations' || state.status === 'loadingForecast';
  const showLocationResults =
    state.status === 'selectingLocation' || state.status === 'loadingForecast';
  const selectedLocationId =
    state.status === 'loadingForecast' ? (state.selectedLocation?.id ?? null) : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-night-900 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(139,155,255,0.18),transparent_28%),radial-gradient(circle_at_78%_0%,rgba(45,212,191,0.14),transparent_30%),linear-gradient(180deg,rgba(11,16,32,0)_0%,rgba(11,16,32,1)_78%)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
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
          className="rounded-lg border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md transition duration-200 motion-reduce:transition-none sm:p-5"
          aria-label="Busca de cidade"
        >
          <SearchForm isLoading={isLoading} onSearch={searchLocations} />
        </section>

        <FeedbackState error={state.error} onRetry={retry} status={state.status} />

        {showLocationResults ? (
          <LocationResults
            locations={state.locations}
            onSelect={selectLocation}
            selectedLocationId={selectedLocationId}
          />
        ) : null}

        {state.status === 'success' ? (
          <section aria-labelledby="selected-location-title" className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-teal-200/20 bg-teal-300/10 p-5 text-white shadow-glass backdrop-blur-md">
              <MapPinIcon aria-hidden="true" className="mt-1 size-5 text-teal-100" />
              <div>
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
