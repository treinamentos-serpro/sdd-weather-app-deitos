import App from '../../src/App';
import { type UseWeatherSearchResult, useWeatherSearch } from '../../src/hooks/useWeatherSearch';
import type { WeatherSearchState } from '../../src/types/weather';
import { completeWeatherData, locationsFixture, saoPauloLocation } from '../fixtures/weather';
import { renderWithUser, screen, within } from '../test-utils';

vi.mock('../../src/hooks/useWeatherSearch', () => ({
  useWeatherSearch: vi.fn(),
}));

const useWeatherSearchMock = vi.mocked(useWeatherSearch);
const searchLocations = vi.fn();
const selectLocation = vi.fn();
const retry = vi.fn();
const reset = vi.fn();

describe('App', () => {
  beforeEach(() => {
    searchLocations.mockReset();
    selectLocation.mockReset();
    retry.mockReset();
    reset.mockReset();
  });

  it('starts in Celsius and renders the idle search experience', () => {
    mockWeatherSearchState({
      status: 'idle',
      locations: [],
      selectedLocation: null,
      weather: null,
      error: null,
    });

    renderWithUser(<App />);

    expect(screen.getByRole('heading', { name: 'Previsão do tempo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Busque uma cidade');
  });

  it('renders location choices and delegates explicit selection', async () => {
    mockWeatherSearchState({
      status: 'selectingLocation',
      locations: locationsFixture,
      selectedLocation: null,
      weather: null,
      error: null,
    });
    const { user } = renderWithUser(<App />);

    await user.click(screen.getByRole('button', { name: /São Paulo/ }));

    expect(selectLocation).toHaveBeenCalledWith(saoPauloLocation);
  });

  it('keeps the selected location highlighted while the forecast loads', () => {
    mockWeatherSearchState({
      status: 'loadingForecast',
      locations: locationsFixture,
      selectedLocation: saoPauloLocation,
      weather: null,
      error: null,
    });

    renderWithUser(<App />);

    expect(screen.getByRole('button', { name: /São Paulo/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renders selected location, current weather and five forecast days on success', () => {
    mockWeatherSearchState({
      status: 'success',
      locations: locationsFixture,
      selectedLocation: saoPauloLocation,
      weather: completeWeatherData,
      error: null,
    });

    renderWithUser(<App />);

    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('São Paulo, Brasil')).toBeInTheDocument();
    expect(screen.getAllByText('24°C').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('converts displayed temperatures without calling search or forecast actions again', async () => {
    mockWeatherSearchState({
      status: 'success',
      locations: locationsFixture,
      selectedLocation: saoPauloLocation,
      weather: completeWeatherData,
      error: null,
    });
    const { user } = renderWithUser(<App />);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('76°F')).toBeInTheDocument();
    expect(screen.getByText('Sensação 79°F')).toBeInTheDocument();
    expect(searchLocations).not.toHaveBeenCalled();
    expect(selectLocation).not.toHaveBeenCalled();
  });

  it('renders loading, empty and error states through shared feedback', async () => {
    mockWeatherSearchState({
      status: 'error',
      locations: [],
      selectedLocation: null,
      weather: null,
      error: { code: 'network', message: 'Falha de rede' },
    });
    const { user } = renderWithUser(<App />);
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('Falha de rede');
    await user.click(within(alert).getByRole('button', { name: 'Tentar novamente' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});

function mockWeatherSearchState(state: WeatherSearchState): void {
  useWeatherSearchMock.mockReturnValue({
    state,
    searchLocations,
    selectLocation,
    retry,
    reset,
  } satisfies UseWeatherSearchResult);
}
