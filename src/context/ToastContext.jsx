import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
const TOAST_TONES = {
  info: 'bg-ink',
  success: 'bg-brand-dark',
  error: 'bg-coral',
};

// Small pop-up messages: toast('Saved', 'success') or toast('Oops', 'error').
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems((list) => [...list, { id, message, type }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex max-w-[min(380px,calc(100%-2rem))] flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-3 text-[0.95rem] text-white shadow-[0_6px_20px_rgba(0,0,0,0.2)] ${TOAST_TONES[t.type] || TOAST_TONES.info}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
