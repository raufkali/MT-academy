"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} className="text-success me-2 flex-shrink-0" />;
      case "danger":
      case "error":
        return <AlertCircle size={18} className="text-danger me-2 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle size={18} className="text-warning me-2 flex-shrink-0" />;
      default:
        return <Info size={18} className="text-primary me-2 flex-shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container in top-right corner */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1090, maxWidth: "380px" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show border-0 shadow-sm mb-2 rounded bg-white border-start border-4 border-${
              toast.type === "error" ? "danger" : toast.type
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex align-items-center p-3">
              {getIcon(toast.type)}
              <div className="toast-body p-0 flex-grow-1 text-dark small" style={{ lineHeight: 1.4 }}>
                {toast.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-sm ms-2"
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
