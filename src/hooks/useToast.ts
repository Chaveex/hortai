import { useState, useCallback } from 'react';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      const id = Math.random();
      setToasts((prev) => [...prev, { id, type, message }]);

      // Auto-dismiss
      const delay =
        type === 'success' ? 2000 : type === 'error' ? 4000 : 3000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, delay);
    },
    []
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}
