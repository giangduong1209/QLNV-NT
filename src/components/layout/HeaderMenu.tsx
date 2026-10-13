"use client";

import { useTransition } from "react";
import Image from "next/image";
import { logout } from "@/actions/auth";
import { useEditMode } from "@/store/use-edit-mode-store";

interface HeaderMenuProps {
  userName?: string;
}

export function HeaderMenu({ userName }: HeaderMenuProps) {
  const [isPending, startTransition] = useTransition();
  const { resetState } = useEditMode();

  const handleLogout = () => {
    // Xóa bộ nhớ Client Storage (sessionStorage, localStorage)
    if (typeof window !== "undefined") {
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch (error) {
        console.error("Lỗi khi dọn dẹp Client Storage:", error);
      }
    }

    // Reset Zustand Store
    resetState();

    startTransition(async () => {
      await logout();
    });
  };

  return (
    <header className="ql-app-header">
      <div className="ql-app-header-brand">
        <Image
          src="/nhat_tan_logo.png"
          alt="Logo Nhật Tân"
          width={28}
          height={28}
          className="object-contain"
        />
        <div className="ql-app-header-title">
          <span className="ql-app-header-hospital">BỆNH VIỆN ĐA KHOA NHẬT TÂN</span>
          <span className="ql-app-header-sep">•</span>
          <span className="ql-app-header-sub">Hệ thống Quản lý Sự cố Y khoa</span>
        </div>
      </div>

      <div className="ql-app-header-user">
        {userName && (
          <div className="ql-app-user-info">
            <span className="ql-app-user-icon" aria-hidden="true">👤</span>
            <span className="ql-app-user-name">{userName}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="ql-app-header-logout"
          title="Đăng xuất khỏi hệ thống"
        >
          {isPending ? (
            <svg
              className="w-3.5 h-3.5 animate-spin text-red-600 inline-block"
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
          ) : (
            <span aria-hidden="true">🚪</span>
          )}
          <span>{isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
        </button>
      </div>
    </header>
  );
}
