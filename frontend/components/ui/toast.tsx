"use client";

import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (msg) => addToast(msg, "success"),
        error: (msg) => addToast(msg, "error"),
        warning: (msg) => addToast(msg, "warning"),
      }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
                t.type === "success"
                  ? "bg-[#2F7D5B] text-white border-[#2F7D5B]"
                  : t.type === "error"
                  ? "bg-[#B54747] text-white border-[#B54747]"
                  : t.type === "warning"
                  ? "bg-[#B7791F] text-white border-[#B7791F]"
                  : "bg-[#191716] text-white border-[#191716]"
              }`}
            >
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
              {t.type === "warning" && <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-auto opacity-70 hover:opacity-100 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};
