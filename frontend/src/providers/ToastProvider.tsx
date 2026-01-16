import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ToastContainer, ToastMessage, ToastType } from '../components/ui/Toast';

export interface ToastContextType {
    toast: (type: ToastType, message: string, title?: string, duration?: number) => void;
    showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const toast = (type: ToastType, message: string, title?: string, duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message, title, duration }]);
    };

    const showToast = (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
        toast(type, message, title, duration);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
