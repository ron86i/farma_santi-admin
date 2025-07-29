import { useState, useCallback } from "react";

type QueryResult<TData , TParams extends any[]> = {
  fetch: (...params: TParams) => Promise<TData | void>;
  data: TData | null;
  loading: boolean;
  error: string | null;
};

export function useQuery<TData, TParams extends any[]>(
  requestFn: (...params: TParams) => Promise<TData>
): QueryResult<TData, TParams> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const fetch = useCallback(async (...params: TParams) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await requestFn(...params);
      setData(response);
      return response;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requestFn, loading]);

  return { fetch, data, loading, error };
}

type MutationResult<TData, TParams extends any[]> = {
  mutate: (...params: TParams) => Promise<TData | void>;
  data: TData | null;
  loading: boolean;
  error: string | null;
};


export function useMutation<TData, TParams extends any[]>(
  mutationFn: (...params: TParams) => Promise<TData>
): MutationResult<TData, TParams> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (...params: TParams) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    setData(null);

    try {
      const response = await mutationFn(...params);
      setData(response);
      return response;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);


      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, loading]);

  return { mutate, data, loading, error };
}