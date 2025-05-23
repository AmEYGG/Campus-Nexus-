import React from 'react';
import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, type = 'info', duration = 3000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setToasts(prev => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  return { toast, toasts };
};

export const Toast = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg max-w-md transform transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}
        >
          <h4 className="font-semibold">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm mt-1 text-white/90">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}; 