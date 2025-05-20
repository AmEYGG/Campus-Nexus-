import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function ToastViewport() {
  const { toasts, removeToast } = useContext(ToastContext);

  return createPortal(
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 w-full max-w-sm p-4 sm:bottom-0 sm:right-0 sm:top-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
            toast.variant === 'destructive'
              ? 'border-red-500 bg-red-500 text-white'
              : 'border-gray-200 bg-white text-gray-950'
          }`}
        >
          <div className="flex flex-col gap-1">
            {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`absolute right-2 top-2 rounded-md p-1 ${
              toast.variant === 'destructive'
                ? 'text-white hover:text-red-50'
                : 'text-gray-950/50 hover:text-gray-950'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

export function useToast() {
  const { addToast } = useContext(ToastContext);
  return addToast;
}

export function toast(props) {
  const addToast = useToast();
  addToast(props);
} 