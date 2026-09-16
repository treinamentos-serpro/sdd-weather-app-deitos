import { useEffect, useRef, useState } from 'react';
import { fetchForecast } from '../services/forecastService';
import { fetchLocations } from '../services/geocodingService';
import { WeatherServiceException } from '../services/serviceError';
import type { Location, WeatherSearchState, WeatherServiceError } from '../types/weather';

const MINIMUM_QUERY_LENGTH = 2;

const idleState: WeatherSearchState = {
  status: 'idle',
  locations: [],
  selectedLocation: null,
  weather: null,
  error: null,
};

type RetryAction =
  | {
      type: 'search';
      query: string;
    }
  | {
      type: 'forecast';
      location: Location;
    };

export interface UseWeatherSearchResult {
  state: WeatherSearchState;
  searchLocations: (query: string) => Promise<void>;
  selectLocation: (location: Location) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

export function useWeatherSearch(): UseWeatherSearchResult {
  const [state, setState] = useState<WeatherSearchState>(idleState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const retryActionRef = useRef<RetryAction | null>(null);
  const locationsRef = useRef<Location[]>([]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function searchLocations(query: string): Promise<void> {
    const trimmedQuery = query.trim();

    abortCurrentRequest();
    locationsRef.current = [];

    if (trimmedQuery.length < MINIMUM_QUERY_LENGTH) {
      setState(idleState);
      return;
    }

    retryActionRef.current = { type: 'search', query: trimmedQuery };

    const request = createRequest();
    setState({
      status: 'searchingLocations',
      locations: [],
      selectedLocation: null,
      weather: null,
      error: null,
    });

    try {
      const locations = await fetchLocations(trimmedQuery, { signal: request.controller.signal });

      if (shouldIgnoreResponse(request)) {
        return;
      }

      locationsRef.current = locations;

      if (locations.length === 0) {
        setState({
          status: 'empty',
          locations: [],
          selectedLocation: null,
          weather: null,
          error: null,
        });
        return;
      }

      setState({
        status: 'selectingLocation',
        locations,
        selectedLocation: null,
        weather: null,
        error: null,
      });
    } catch (error) {
      if (shouldIgnoreResponse(request)) {
        return;
      }

      setState({
        status: 'error',
        locations: [],
        selectedLocation: null,
        weather: null,
        error: normalizeError(error),
      });
    }
  }

  async function selectLocation(location: Location): Promise<void> {
    abortCurrentRequest();
    retryActionRef.current = { type: 'forecast', location };

    const request = createRequest();
    const currentLocations = locationsRef.current;

    setState({
      status: 'loadingForecast',
      locations: currentLocations,
      selectedLocation: location,
      weather: null,
      error: null,
    });

    try {
      const weather = await fetchForecast(location, { signal: request.controller.signal });

      if (shouldIgnoreResponse(request)) {
        return;
      }

      setState({
        status: 'success',
        locations: currentLocations,
        selectedLocation: location,
        weather,
        error: null,
      });
    } catch (error) {
      if (shouldIgnoreResponse(request)) {
        return;
      }

      setState({
        status: 'error',
        locations: currentLocations,
        selectedLocation: location,
        weather: null,
        error: normalizeError(error),
      });
    }
  }

  async function retry(): Promise<void> {
    const retryAction = retryActionRef.current;

    if (retryAction === null) {
      return;
    }

    if (retryAction.type === 'search') {
      await searchLocations(retryAction.query);
      return;
    }

    await selectLocation(retryAction.location);
  }

  function reset(): void {
    abortCurrentRequest();
    retryActionRef.current = null;
    locationsRef.current = [];
    setState(idleState);
  }

  function abortCurrentRequest(): void {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }

  function createRequest(): { id: number; controller: AbortController } {
    const controller = new AbortController();
    const id = requestIdRef.current + 1;

    requestIdRef.current = id;
    abortControllerRef.current = controller;

    return { id, controller };
  }

  function shouldIgnoreResponse(request: { id: number; controller: AbortController }): boolean {
    return request.controller.signal.aborted || request.id !== requestIdRef.current;
  }

  return {
    state,
    searchLocations,
    selectLocation,
    retry,
    reset,
  };
}

function normalizeError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceException) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  return {
    code: 'network',
    message: 'Não foi possível concluir a operação. Tente novamente.',
  };
}
