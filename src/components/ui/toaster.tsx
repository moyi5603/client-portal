import React from 'react';
import { useToast } from './use-toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './toaster.css';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="toast-icon toast-icon-success" />;
      case 'destructive':
        return <AlertCircle className="toast-icon toast-icon-destructive" />;
      case 'warning':
        return <AlertTriangle className="toast-icon toast-icon-warning" />;
      default:
        return <Info className="toast-icon toast-icon-default" />;
    }
  };

  return (
    <div className="toaster-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.variant || 'default'}`}
          role="alert"
        >
          {getIcon(toast.variant)}
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            {toast.description && (
              <div className="toast-description">{toast.description}</div>
            )}
          </div>
          <button
            className="toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

