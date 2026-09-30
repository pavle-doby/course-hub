import { useEffect, useState } from "react";
import type React from "react";

type UseDebounceResult<T> = {
  /** Immediate query, use for input */
  query: T;
  /** Debounced query, use for search fn */
  debouncedQuery: T;
  /** Setter, use to set new values */
  setQuery: React.Dispatch<React.SetStateAction<T>>;
};

export function useDebounce<T>(initialValue: T, delay = 300): UseDebounceResult<T> {
  const [debounced, setDebounced] = useState(initialValue);
  const [immediate, setImmediate] = useState(initialValue);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(immediate), delay);
    return () => clearTimeout(id);
  }, [immediate, delay]);

  return { query: immediate, debouncedQuery: debounced, setQuery: setImmediate };
}
