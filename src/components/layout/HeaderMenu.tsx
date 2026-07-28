"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { logout } from "@/actions/auth";

export function HeaderMenu() {
  const [activeTab, setActiveTab] = useState("Hệ thống");
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const navTabs = [
    "Hệ thống",
    "Cấp cứu",
    "Đăng ký",
    "Khám bệnh",
    "Cận lâm sàng",
    "Điều trị",
    "Bệnh án",
    "Ký số",
    "PT - TT",
    "Dược",
    "Thanh toán",
    "Nhà thuốc",
    "KH-TH",
    "Báo cáo",
    "Nhân sự",
    "Khác",
    "ToolCode",
    "BHYT",
    "Trợ giúp",
  ];

  return (
    <header className="ql-his-header">
      {/* ── 1. Top Window Title Bar ────────────────────────────────────────── */}
      <div className="ql-his-titlebar">
        <div className="flex items-center gap-2">
          <Image
            src="/nhat_tan_logo.png"
            alt="Logo Nhật Tân"
            width={20}
            height={20}
            className="object-contain"
          />
          <span>
            Phần mềm quản lý tổng thể bệnh viện - Bệnh viện đa khoa Nhật Tân -
            [Quản lý sự cố y khoa]
          </span>
        </div>
      </div>

      {/* ── 2. Main Menu Navigation Bar ─────────────────────────────────────── */}
      <div className="ql-his-menubar">
        <div className="flex items-center w-full">
          {/* MENU Button */}
          <button
            className="ql-his-menu-btn"
            disabled
            title="Chức năng đang được phát triển"
          >
            MENU
          </button>

          {/* Nav Tabs */}
          <div className="flex items-center overflow-x-auto no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab;
              const isFunctional = tab === "Hệ thống";
              return (
                <button
                  key={tab}
                  onClick={() => isFunctional && setActiveTab(tab)}
                  disabled={!isFunctional}
                  title={
                    !isFunctional ? "Chức năng đang được phát triển" : undefined
                  }
                  className={`ql-his-tab ${isActive ? "active" : ""}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. 2-Row Stacked Sub-menu Ribbon Toolbar (Hệ thống) ─────────────── */}
      {activeTab === "Hệ thống" && (
        <div className="ql-his-ribbon-bar no-scrollbar">
          {/* Group 1: Khóa & Mật khẩu */}
          <div className="ql-his-ribbon-group">
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-slate-400">&#128274;</span> Khóa chương
                trình
              </button>
            </div>
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-amber-500">&#128737;</span> Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Group 2: Danh mục & Cấu hình */}
          <div className="ql-his-ribbon-group">
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-blue-600">&#128203;</span> Danh mục{" "}
                <span className="text-[20px] text-slate-400">&#9662;</span>
              </button>
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-slate-600">&#9881;</span> Thiết lập hệ
                thống{" "}
                <span className="text-[20px] text-slate-400">&#9662;</span>
              </button>
            </div>
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-teal-600">&#128187;</span> Danh sách máy
                con
              </button>
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-amber-600">&#128196;</span> Danh sách
                phiếu ký số
              </button>
            </div>
          </div>

          {/* Group 3: Phân quyền & Giám sát */}
          <div className="ql-his-ribbon-group">
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-emerald-600">&#128101;</span> Phân quyền
                người dùng{" "}
                <span className="text-[20px] text-slate-400">&#9662;</span>
              </button>
            </div>
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-sky-600">&#128269;</span> Lưu vết người
                dùng
              </button>
            </div>
          </div>

          {/* Group 4: Gõ tắt, Báo động & Nghiệp vụ */}
          <div className="ql-his-ribbon-group">
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-indigo-600">&#9997;</span> Định nghĩa gõ
                tắt
              </button>
              <button
                className="ql-his-ribbon-btn text-red-600 font-bold"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span>&#128680;</span> BÁO ĐỘNG
              </button>
            </div>
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-slate-500">&#128172;</span> Nghiệp vụ khác{" "}
                <span className="text-[20px] text-slate-400">&#9662;</span>
              </button>
            </div>
          </div>

          {/* Group 5: Tiện ích & Ảnh nền */}
          <div className="ql-his-ribbon-group">
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-purple-600">&#128444;</span> Đối ảnh nền
              </button>
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-amber-600">&#128272;</span> Đổi mật khẩu
                ký số
              </button>
            </div>
            <div className="ql-his-ribbon-row">
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-blue-600">&#127760;</span> Dịch thuật
              </button>
              <button
                className="ql-his-ribbon-btn"
                disabled
                title="Chức năng đang được phát triển"
              >
                <span className="text-green-600">&#11015;</span> Cập nhật bản
                mới
              </button>
            </div>
          </div>

          {/* Group 6: Đăng xuất (thay cho Thoát phần mềm) */}
          <div className="ql-his-ribbon-group">
            <div className="ql-his-ribbon-row">
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="ql-his-ribbon-btn cursor-pointer  hover:bg-red-100 text-red-700 font-bold border-red-300"
                title="Đăng xuất khỏi hệ thống"
              >
                <span>&#128682;</span>
                {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
