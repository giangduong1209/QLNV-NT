"use client";

import { usePathname } from "next/navigation";

export function StatusBar() {
  const pathname = usePathname();

  console.log(pathname);

  return (
    <div className="ql-status-bar">
      <div className="ql-status-actions">
        <button className="ql-btn-action">
          {pathname !== "/incidents" ? (
            <>
              <span className="ql-btn-icon-green">&#10010;</span> Thêm mới
            </>
          ) : (
            <>
              <span className="ql-btn-icon-green">&#10003;</span> Duyệt
            </>
          )}
        </button>
        <button className="ql-btn-action">
          <span className="ql-btn-icon-yellow">&#9999;</span> Sửa
        </button>
        <button className="ql-btn-action">
          <span className="ql-btn-icon-blue">&#128190;</span> Lưu
        </button>
        <button className="ql-btn-action">
          <span className="ql-btn-icon-red">&#10008;</span> Xóa
        </button>
        <button className="ql-btn-action">
          <span className="ql-btn-icon-blue">&#128427;</span> In phiếu{" "}
          <small>▼</small>
        </button>
        <button className="ql-btn-action">
          <span className="ql-btn-icon-red">&#128682;</span> Thoát (Esc)
        </button>
      </div>
    </div>
  );
}
