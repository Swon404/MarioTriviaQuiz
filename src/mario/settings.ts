import { useEffect, useState } from 'react';

const PREFIX = 'mariotrivia_setting_';
export function useSavedSetting<T>(key: string, fallback: T, valid: (value: unknown) => boolean): [T, (value: T | ((previous: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(PREFIX + key) ?? 'null');
      return valid(saved) ? saved as T : fallback;
    } catch { return fallback; }
  });
  useEffect(() => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* Storage may be disabled. */ }
  }, [key, value]);
  return [value, setValue];
}
export const oneOf = (values: readonly unknown[]) => (value: unknown) => values.includes(value);
export const isBoolean = (value: unknown) => typeof value === 'boolean';
export const isName = (value: unknown) => typeof value === 'string' && value.length <= 24;
