"use client";

import { Suspense } from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function TabBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const querySuffix = queryString ? `?${queryString}` : "";

  return (
    <div className="ql-tab-bar">
      <Link
        href={`/dashboard${querySuffix}`}
        className={`ql-tab ${pathname === "/dashboard" ? "active" : ""}`}
      >
        Thông báo sự cố Y khoa
        <span className="ql-tab-close">×</span>
      </Link>
      <Link
        href={`/incidents${querySuffix}`}
        className={`ql-tab ${pathname === "/incidents" ? "active" : ""}`}
      >
        Duyệt thông tin sự cố Y khoa
        <span className="ql-tab-close">×</span>
      </Link>
    </div>
  );
}

export function TabBar() {
  return (
    <Suspense fallback={<div className="ql-tab-bar" />}>
      <TabBarContent />
    </Suspense>
  );
}

