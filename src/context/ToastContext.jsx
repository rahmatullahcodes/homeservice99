import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const t = { id, message, type };
    setToasts(prev => [...prev, t]);

    if (timeout > 0) {
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), timeout);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export default ToastContext;
