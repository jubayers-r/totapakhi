import { useEffect, useState } from 'react';

/**
 * Persist a value to localStorage keyed like the original site.
 * Returns [value, setValue]. Changes are written on every update.
 */
export function usePersistence(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? stored : initialValue;
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