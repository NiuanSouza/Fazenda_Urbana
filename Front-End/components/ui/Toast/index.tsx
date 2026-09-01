"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";
import styles from "./Toast.module.css";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  const contextValue = React.useMemo(() => ({
    toast: addToast,
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
    warning: (msg: string) => addToast("warning", msg),
  }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <div className={styles.icon}>
              {t.type === "success" && <FiCheckCircle size={18} />}
              {t.type === "error" && <FiAlertCircle size={18} />}
              {t.type === "warning" && <FiAlertCircle size={18} />}
              {t.type === "info" && <FiInfo size={18} />}
            </div>
            <div className={styles.message}>{t.message}</div>
            <button onClick={() => removeToast(t.id)} className={styles.close}>
              <FiX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
