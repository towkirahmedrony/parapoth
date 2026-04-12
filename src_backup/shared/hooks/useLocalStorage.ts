import { useState, useEffect, useCallback } from 'react';
import { StorageKey, LOCAL_STORAGE_SYNC_EVENT } from '../constants/storageKeys';

export function useLocalStorage<T>(key: StorageKey, initialValue: T) {
  
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Stale-closure safe functional setter
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') return;
    
    setStoredValue(prev => {
      try {
        const newValue = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        window.dispatchEvent(new Event(LOCAL_STORAGE_SYNC_EVENT));
        return newValue;
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
        return prev;
      }
    });
  }, [key]);

  // Safer remove using readValue to reset
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      setStoredValue(readValue());
      window.dispatchEvent(new Event(LOCAL_STORAGE_SYNC_EVENT));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, readValue]);

  useEffect(() => {
    setStoredValue(readValue());

    const handleStorageChange = (event: StorageEvent | Event) => {
      if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
        return;
      }
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange); // Across tabs
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, handleStorageChange); // Same tab

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue] as const;
}
