import { useCallback, useEffect, useState } from 'react';
import { httpApi } from './http';
import { mockApi } from './mock';
import type { Api } from './types';

export * from './types';

/** VITE_API_MODE=mock builds a self-contained demo (no backend); anything else talks to /api/v1. */
export const api: Api = import.meta.env.VITE_API_MODE === 'mock' ? mockApi : httpApi;

export interface Carga<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  reload: () => void;
}

/** Load something from the API and re-load when `deps` change. */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[]): Carga<T> {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true });
  const [n, setN] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  useEffect(() => {
    let vivo = true;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    run().then(
      (data) => vivo && setState({ data, loading: false }),
      (error: Error) => vivo && setState({ error, loading: false }),
    );
    return () => {
      vivo = false;
    };
  }, [run, n]);
  return { ...state, reload: () => setN((x) => x + 1) };
}
