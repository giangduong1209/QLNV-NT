"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="ql-tab-bar">
      <Link
        href="/dashboard"
        className={`ql-tab ${pathname === "/dashboard" ? "active" : ""}`}
      >
        Thông báo sự cố Y khoa
        <span className="ql-tab-close">×</span>
      </Link>
      <Link
        href="/incidents"
        className={`ql-tab ${pathname === "/incidents" ? "active" : ""}`}
      >
        Duyệt thông tin sự cố Y khoa
        <span className="ql-tab-close">×</span>
      </Link>
    </div>
  );
}
