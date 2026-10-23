import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * Persist a value to localStorage keyed like the original site.
 * Returns [value, setValue]. Changes are written on every update.
 */
export function usePersistence<T extends string>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (stored as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // storage unavailable — ignore
    }
  }, [key, value]);

  return [value, setValue];
}
