"use client";

import { login } from "@/actions/auth";
import { useActionState } from "react";
import Image from "next/image";
import "./styles.css";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="login-container" suppressHydrationWarning>
      <div className="login-card">
        {/* Logo / Header */}
        <div className="login-header">
          <div className="login-icon">
            <Image
              src="/nhat_tan_logo.png"
              alt="Logo"
              width={500}
              height={500}
            />
          </div>
          <h1 className="login-title">
            Bệnh viện đa khoa <br /> NHẬT TÂN
          </h1>
          <p className="login-subtitle">Hệ thống Quản lý Sự cố Y khoa</p>
        </div>

        {/* Error message */}
        {state?.message && (
          <div className="login-error" role="alert">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{state.message}</span>
          </div>
        )}

        {/* Login Form */}
        <form action={action} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Tên đăng nhập
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                className="form-input"
                autoFocus
              />
            </div>
            {state?.errors?.username && (
              <p className="form-error">{state.errors.username[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                className="form-input"
              />
            </div>
            {state?.errors?.password && (
              <p className="form-error">{state.errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="login-button"
            id="login-submit"
          >
            {pending ? (
              <span className="button-loading">
                <svg
                  className="spinner"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer" suppressHydrationWarning>
          © {new Date().getFullYear()} Bệnh viện đa khoa NHẬT TÂN <br /> Quản lý
          Sự cố Y khoa
        </p>
      </div>
    </div>
  );
}
