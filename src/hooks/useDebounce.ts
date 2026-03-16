import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounces a value - returns a value that only updates after the specified delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Returns a debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { ctrlKey = false, metaKey = false, shiftKey = false, altKey = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the target is an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only block for Escape key
        if (key.toLowerCase() !== 'escape') {
          return;
        }
      }

      const isCtrlOrMeta = (ctrlKey && event.ctrlKey) || (metaKey && event.metaKey) || 
                          ((ctrlKey || metaKey) && (event.ctrlKey || event.metaKey));
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesShift = shiftKey === event.shiftKey;
      const matchesAlt = altKey === event.altKey;

      if (matchesKey && ((!ctrlKey && !metaKey) || isCtrlOrMeta) && matchesShift && matchesAlt) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlKey, metaKey, shiftKey, altKey, enabled]);
}

export default useDebounce;

