import type { Location } from '../types/weather';
import { getWeatherIcon } from './icons';

const MapPinIcon = getWeatherIcon('mapPin');

interface LocationResultsProps {
  locations: Location[];
  onSelect: (location: Location) => void | Promise<void>;
  selectedLocationId?: number | null;
}

export default function LocationResults({
  locations,
  onSelect,
  selectedLocationId = null,
}: LocationResultsProps) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="location-results-title" className="space-y-3">
      <h2 className="text-base font-semibold text-white" id="location-results-title">
        Escolha a localidade
      </h2>
      <ul className="grid gap-2">
        {locations.map((location) => {
          const context = formatLocationContext(location);
          const isSelected = location.id === selectedLocationId;

          return (
            <li key={location.id}>
              <button
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? 'group flex w-full items-start gap-3 rounded-lg border border-accent-400 bg-accent-500/20 p-4 text-left text-white shadow-glass backdrop-blur-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 motion-reduce:transition-none'
                    : 'group flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left text-white backdrop-blur-md transition duration-200 hover:border-accent-400/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 motion-reduce:transition-none'
                }
                onClick={() => void onSelect(location)}
                type="button"
              >
                <MapPinIcon
                  aria-hidden="true"
                  className={
                    isSelected
                      ? 'mt-0.5 size-5 text-accent-400'
                      : 'mt-0.5 size-5 text-white/45 group-hover:text-accent-400'
                  }
                />
                <span>
                  <span className="block text-sm font-semibold">{location.name}</span>
                  {context !== null ? (
                    <span className="mt-1 block text-sm text-white/70">{context}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function formatLocationContext(location: Location): string | null {
  const contextParts = [location.admin1, location.country].filter(
    (part): part is string => part !== null && part.trim().length > 0,
  );

  if (contextParts.length === 0) {
    return null;
  }

  return contextParts.join(', ');
}
