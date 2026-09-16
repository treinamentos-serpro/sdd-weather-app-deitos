import { act, renderHook, waitFor } from '@testing-library/react';
import { useWeatherSearch } from '../../src/hooks/useWeatherSearch';
import { fetchForecast } from '../../src/services/forecastService';
import { fetchLocations } from '../../src/services/geocodingService';
import { WeatherServiceException } from '../../src/services/serviceError';
import {
  completeWeatherData,
  lisbonLocation,
  locationsFixture,
  saoPauloLocation,
} from '../fixtures/weather';

vi.mock('../../src/services/geocodingService', () => ({
  fetchLocations: vi.fn(),
}));

vi.mock('../../src/services/forecastService', () => ({
  fetchForecast: vi.fn(),
}));

const fetchLocationsMock = vi.mocked(fetchLocations);
const fetchForecastMock = vi.mocked(fetchForecast);

describe('useWeatherSearch', () => {
  beforeEach(() => {
    fetchLocationsMock.mockReset();
    fetchForecastMock.mockReset();
  });

  it('does not call geocoding for queries shorter than two characters', async () => {
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => {
      await result.current.searchLocations(' a ');
    });

    expect(fetchLocationsMock).not.toHaveBeenCalled();
    expect(result.current.state).toMatchObject({
      status: 'idle',
      locations: [],
      selectedLocation: null,
      weather: null,
      error: null,
    });
  });

  it('moves from searching to selecting locations without selecting automatically', async () => {
    const geocoding = createDeferred<typeof locationsFixture>();
    fetchLocationsMock.mockReturnValueOnce(geocoding.promise);
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      void result.current.searchLocations(' São Paulo ');
    });

    await waitFor(() => expect(result.current.state.status).toBe('searchingLocations'));
    expect(result.current.state).toMatchObject({
      locations: [],
      selectedLocation: null,
      weather: null,
      error: null,
    });
    expect(fetchLocationsMock).toHaveBeenCalledWith('São Paulo', {
      signal: expect.any(AbortSignal),
    });

    await act(async () => {
      geocoding.resolve(locationsFixture);
      await geocoding.promise;
    });

    expect(result.current.state).toMatchObject({
      status: 'selectingLocation',
      locations: locationsFixture,
      selectedLocation: null,
      weather: null,
      error: null,
    });
  });

  it('sets empty and clears previous city and weather when a new search returns no locations', async () => {
    fetchLocationsMock.mockResolvedValueOnce(locationsFixture).mockResolvedValueOnce([]);
    fetchForecastMock.mockResolvedValueOnce(completeWeatherData);
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => {
      await result.current.searchLocations('São Paulo');
    });
    await act(async () => {
      await result.current.selectLocation(saoPauloLocation);
    });

    expect(result.current.state).toMatchObject({
      status: 'success',
      selectedLocation: saoPauloLocation,
      weather: completeWeatherData,
    });

    await act(async () => {
      await result.current.searchLocations('Cidade inexistente');
    });

    expect(result.current.state).toMatchObject({
      status: 'empty',
      locations: [],
      selectedLocation: null,
      weather: null,
      error: null,
    });
  });

  it('loads the forecast after an explicit location selection and publishes success', async () => {
    const forecast = createDeferred<typeof completeWeatherData>();
    fetchForecastMock.mockReturnValueOnce(forecast.promise);
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      void result.current.selectLocation(saoPauloLocation);
    });

    await waitFor(() => expect(result.current.state.status).toBe('loadingForecast'));
    expect(result.current.state).toMatchObject({
      locations: [],
      selectedLocation: saoPauloLocation,
      weather: null,
      error: null,
    });
    expect(fetchForecastMock).toHaveBeenCalledWith(saoPauloLocation, {
      signal: expect.any(AbortSignal),
    });

    await act(async () => {
      forecast.resolve(completeWeatherData);
      await forecast.promise;
    });

    expect(result.current.state).toMatchObject({
      status: 'success',
      selectedLocation: saoPauloLocation,
      weather: completeWeatherData,
      error: null,
    });
  });

  it('stores a geocoding error and retries the same search successfully', async () => {
    fetchLocationsMock
      .mockRejectedValueOnce(new WeatherServiceException('network', 'Falha de rede'))
      .mockResolvedValueOnce(locationsFixture);
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => {
      await result.current.searchLocations('São Paulo');
    });

    expect(result.current.state).toMatchObject({
      status: 'error',
      locations: [],
      selectedLocation: null,
      weather: null,
      error: { code: 'network', message: 'Falha de rede' },
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(fetchLocationsMock).toHaveBeenNthCalledWith(2, 'São Paulo', {
      signal: expect.any(AbortSignal),
    });
    expect(result.current.state).toMatchObject({
      status: 'selectingLocation',
      locations: locationsFixture,
      error: null,
    });
  });

  it('stores a forecast error and retries the same selected location successfully', async () => {
    fetchForecastMock
      .mockRejectedValueOnce(new WeatherServiceException('http', 'Serviço indisponível', 503))
      .mockResolvedValueOnce(completeWeatherData);
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => {
      await result.current.selectLocation(saoPauloLocation);
    });

    expect(result.current.state).toMatchObject({
      status: 'error',
      selectedLocation: saoPauloLocation,
      weather: null,
      error: { code: 'http', statusCode: 503 },
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(fetchForecastMock).toHaveBeenNthCalledWith(2, saoPauloLocation, {
      signal: expect.any(AbortSignal),
    });
    expect(result.current.state).toMatchObject({
      status: 'success',
      selectedLocation: saoPauloLocation,
      weather: completeWeatherData,
      error: null,
    });
  });

  it('ignores a delayed response from an obsolete search', async () => {
    const firstSearch = createDeferred<typeof locationsFixture>();
    const secondSearch = createDeferred<typeof locationsFixture>();
    fetchLocationsMock
      .mockReturnValueOnce(firstSearch.promise)
      .mockReturnValueOnce(secondSearch.promise);
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      void result.current.searchLocations('São Paulo');
    });
    await waitFor(() => expect(result.current.state.status).toBe('searchingLocations'));

    act(() => {
      void result.current.searchLocations('Lisboa');
    });

    await act(async () => {
      secondSearch.resolve([lisbonLocation]);
      await secondSearch.promise;
    });

    expect(result.current.state).toMatchObject({
      status: 'selectingLocation',
      locations: [lisbonLocation],
    });

    await act(async () => {
      firstSearch.resolve([saoPauloLocation]);
      await firstSearch.promise;
    });

    expect(result.current.state).toMatchObject({
      status: 'selectingLocation',
      locations: [lisbonLocation],
    });
  });

  it('does not surface expected aborts as user-visible errors', async () => {
    const firstSearch = createDeferred<typeof locationsFixture>();
    fetchLocationsMock
      .mockImplementationOnce((_query, options) => {
        options?.signal?.addEventListener('abort', () => {
          firstSearch.reject(new WeatherServiceException('network', 'Abortado'));
        });

        return firstSearch.promise;
      })
      .mockResolvedValueOnce([lisbonLocation]);
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      void result.current.searchLocations('São Paulo');
    });
    await waitFor(() => expect(result.current.state.status).toBe('searchingLocations'));

    await act(async () => {
      await result.current.searchLocations('Lisboa');
    });

    expect(result.current.state).toMatchObject({
      status: 'selectingLocation',
      locations: [lisbonLocation],
      error: null,
    });
  });
});

interface Deferred<TValue> {
  promise: Promise<TValue>;
  resolve: (value: TValue) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<TValue>(): Deferred<TValue> {
  let resolve: Deferred<TValue>['resolve'];
  let reject: Deferred<TValue>['reject'];
  const promise = new Promise<TValue>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}
