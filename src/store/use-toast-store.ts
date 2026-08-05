"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}

export interface ToastState {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  showToast: (type: ToastType, message: string, options?: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = {
      id,
      type,
      message,
      title: options?.title,
      duration: options?.duration ?? 4000,
    };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  success: (message: string, options?: ToastOptions) => {
    get().showToast("success", message, options);
  },

  error: (message: string, options?: ToastOptions) => {
    get().showToast("error", message, options);
  },

  warning: (message: string, options?: ToastOptions) => {
    get().showToast("warning", message, options);
  },

  info: (message: string, options?: ToastOptions) => {
    get().showToast("info", message, options);
  },
}));

/**
 * Custom hook useToast() tương thích 100% với các component hiện tại
 */
export function useToast() {
  const toasts = useToastStore((state) => state.toasts);
  const showToast = useToastStore((state) => state.showToast);
  const success = useToastStore((state) => state.success);
  const error = useToastStore((state) => state.error);
  const warning = useToastStore((state) => state.warning);
  const info = useToastStore((state) => state.info);
  const removeToast = useToastStore((state) => state.removeToast);

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}
