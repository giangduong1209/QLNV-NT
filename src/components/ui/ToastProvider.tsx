"use client";

import React, { useState, useEffect } from "react";
import {
  useToastStore,
  useToast,
  type ToastType,
  type ToastItem,
  type ToastOptions,
} from "@/store/use-toast-store";

export { useToast, type ToastType, type ToastItem, type ToastOptions };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-9999 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-3"
    >
      {toasts.map((t) => (
        <ToastSingle key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastSingle({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const startTime = Date.now();
    const endTime = startTime + toast.duration;

    const timer = setTimeout(() => {
      onClose();
    }, toast.duration);

    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      const pct = Math.max(0, (remaining / toast.duration!) * 100);
      setProgress(pct);
    }, 40);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [toast, onClose]);

  const styleConfig = {
    success: {
      bg: "bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-900/10",
      progress: "bg-emerald-500",
      iconColor: "text-emerald-600",
      defaultTitle: "Thành công",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    error: {
      bg: "bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-900/10",
      progress: "bg-rose-500",
      iconColor: "text-rose-600",
      defaultTitle: "Thất bại",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    warning: {
      bg: "bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-900/10",
      progress: "bg-amber-500",
      iconColor: "text-amber-600",
      defaultTitle: "Cảnh báo",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bg: "bg-sky-50/95 border-sky-200 text-sky-900 shadow-sky-900/10",
      progress: "bg-sky-500",
      iconColor: "text-sky-600",
      defaultTitle: "Thông báo",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-3 ${styleConfig.bg}`}
    >
      <div className={`mt-0.5 shrink-0 ${styleConfig.iconColor}`}>
        {styleConfig.icon}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold leading-tight mb-0.5">
          {toast.title || styleConfig.defaultTitle}
        </h4>
        <p className="text-xs font-normal opacity-90 leading-normal break-words">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onClose}
        type="button"
        className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 transition-opacity"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
          <div
            className={`h-full transition-all duration-75 ease-linear ${styleConfig.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
