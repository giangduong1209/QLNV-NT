"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDanger = false,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={isLoading ? undefined : onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (top-right) */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
          title="Đóng"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal Header & Content */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Icon Ring Badge */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isDanger
                  ? "bg-red-100 text-red-600 ring-4 ring-red-50/60"
                  : "bg-blue-100 text-blue-600 ring-4 ring-blue-50/60"
              }`}
            >
              {isDanger ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 pr-6">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                {title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Warning Banner Callout Box for Danger mode */}
          {isDanger && (
            <div className="mt-4 p-3 bg-red-50/80 border border-red-100 rounded-xl flex items-center gap-2.5 text-xs text-red-800 font-medium">
              <svg
                className="w-4 h-4 shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Lưu ý: Dữ liệu bị xóa sẽ không thể phục hồi lại sau thao tác này.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 flex items-center justify-end gap-3 border-t border-slate-100/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-2 cursor-pointer ${
              isDanger
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 disabled:from-red-400 disabled:to-red-400"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 disabled:from-blue-400 disabled:to-blue-400"
            }`}
          >
            {isLoading && (
              <svg
                className="w-3.5 h-3.5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v1m0 14v1m8-8h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                />
              </svg>
            )}
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
