import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from './Components';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure animation plays
    const enterTimeout = setTimeout(() => setIsVisible(true), 10);
    
    const leaveTimeout = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    
    const removeTimeout = setTimeout(() => {
      onClose(id);
    }, duration + 300); // Wait for exit animation

    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(leaveTimeout);
      clearTimeout(removeTimeout);
    };
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
  };

  const typeStyles = {
    success: 'border-emerald-500 dark:border-emerald-500',
    error: 'border-red-500 dark:border-red-500',
    info: 'border-blue-500 dark:border-blue-500',
    warning: 'border-amber-500 dark:border-amber-500'
  };

  return (
    <div 
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-navy-800 shadow-lg border-l-4 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 ease-in-out transform",
        typeStyles[type],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {icons[type]}
          </div>
          <div className="flex-1 w-0">
            {title && <p className="text-sm font-semibold text-navy-900 dark:text-white mb-1">{title}</p>}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
          <div className="shrink-0 ml-4 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-hidden rounded-md hover:bg-slate-100 dark:hover:bg-navy-700 p-1 transition-colors"
            >
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div 
        aria-live="assertive" 
        className="fixed inset-0 z-100 flex flex-col gap-3 items-end justify-start px-4 py-20 pointer-events-none sm:p-6 sm:justify-end"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};