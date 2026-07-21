"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEditMode, DASHBOARD_FORM_ID } from "@/lib/edit-mode-context";

export function StatusBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isEditing, setIsEditing } = useEditMode();

  // Trigger form submit programmatically
  const handleSave = () => {
    const form = document.getElementById(
      DASHBOARD_FORM_ID,
    ) as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
      console.log(form);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleExit = () => setIsEditing(false);

  const handleNew = () => {
    setIsEditing(false);
    router.push("/incidents");
  };

  return (
    <div className="ql-status-bar">
      <div className="ql-status-actions">
        {/* Thêm mới / Duyệt */}
        <button className="ql-btn-action" onClick={handleNew}>
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

        {/* Sửa — disabled khi đang editing */}
        <button
          className="ql-btn-action"
          onClick={handleEdit}
          disabled={isEditing}
        >
          <span className="ql-btn-icon-yellow">&#9999;</span> Sửa
        </button>

        {/* Lưu — chỉ active khi đang editing */}
        <button
          className="ql-btn-action"
          onClick={handleSave}
          disabled={!isEditing}
        >
          <span className="ql-btn-icon-blue">&#128190;</span> Lưu
        </button>

        {/* Xóa — chưa implement */}
        <button className="ql-btn-action" disabled>
          <span className="ql-btn-icon-red">&#10008;</span> Xóa
        </button>

        {/* In phiếu — chưa implement */}
        <button className="ql-btn-action" disabled>
          <span className="ql-btn-icon-blue">&#128427;</span> In phiếu{" "}
          <small>▼</small>
        </button>

        {/* Thoát: tắt edit mode */}
        <button className="ql-btn-action" onClick={handleExit}>
          <span className="ql-btn-icon-red">&#128682;</span> Thoát (Esc)
        </button>
      </div>
    </div>
  );
}
