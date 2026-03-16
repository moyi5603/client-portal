import { useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
  duration?: number;
}

type ToastInput = Omit<Toast, 'id'>;

// Global state for toasts
let toastListeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener([...toasts]));
};

const addToast = (toast: ToastInput) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { ...toast, id };
  toasts = [...toasts, newToast];
  notifyListeners();

  // Auto dismiss
  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
};

const dismissToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
};

export function useToast() {
  const [localToasts, setLocalToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setLocalToasts(newToasts);
    };
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const toast = useCallback((input: ToastInput) => {
    return addToast(input);
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return {
    toasts: localToasts,
    toast,
    dismiss,
  };
}

// Shorthand for simple toasts
export const toast = (input: ToastInput) => addToast(input);

