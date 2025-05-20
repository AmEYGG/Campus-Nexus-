import React from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ToastContext = React.createContext({});

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

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
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastViewport = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 w-full max-w-sm p-4 sm:bottom-0 sm:right-0 sm:top-auto">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
};

const Toast = ({ title, description, variant = 'default', onClose }) => {
  return (
    <div
      className={`pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
        variant === 'destructive'
          ? 'border-red-500 bg-red-500 text-white'
          : 'border-gray-200 bg-white text-gray-950'
      }`}
    >
      <div className="flex flex-col gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={onClose}
        className={`absolute right-2 top-2 rounded-md p-1 ${
          variant === 'destructive'
            ? 'text-white hover:text-red-50'
            : 'text-gray-950/50 hover:text-gray-950'
        }`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export function toast(props) {
  const { addToast } = React.useContext(ToastContext);
  if (addToast) {
    addToast(props);
  }
}

export { ToastProvider }; 