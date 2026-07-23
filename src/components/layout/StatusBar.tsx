"use client";

import { useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEditMode, DASHBOARD_FORM_ID } from "@/lib/edit-mode-context";
import { useToast } from "@/components/ui/ToastProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { deleteIncident } from "@/actions/incidents";

function StatusBarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isEditing, setIsEditing } = useEditMode();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const masucoParam = searchParams.get("masuco");
  const activeMasuco = masucoParam ? parseInt(masucoParam, 10) : null;

  // Trigger form submit programmatically
  const handleSave = () => {
    const form = document.getElementById(
      DASHBOARD_FORM_ID,
    ) as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleExit = () => setIsEditing(false);

  const handleNew = () => {
    setIsEditing(false);
    router.push("/dashboard");
  };

  const handleOpenDeleteModal = () => {
    if (activeMasuco) {
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeMasuco) return;

    setIsDeleting(true);
    const result = await deleteIncident(activeMasuco);
    setIsDeleting(false);
    setShowDeleteModal(false);

    if (result.success) {
      toast.success("Xóa sự cố thành công!");
      setIsEditing(false);
      window.location.href = "/dashboard";
    } else {
      toast.error(result.error ?? "Không thể xóa sự cố. Vui lòng thử lại.");
    }
  };

  return (
    <>
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

          {/* Xóa */}
          <button
            className="ql-btn-action"
            onClick={handleOpenDeleteModal}
            disabled={!activeMasuco || isEditing}
            title={activeMasuco ? "Xóa sự cố đang chọn" : "Chọn sự cố để xóa"}
          >
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

      {/* Confirm Delete Popup Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Xác nhận xóa sự cố"
        message={`Bạn có chắc chắn muốn xóa sự cố này không?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}

export function StatusBar() {
  return (
    <Suspense fallback={<div className="ql-status-bar" />}>
      <StatusBarContent />
    </Suspense>
  );
}

