"use client";

import { useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEditMode, DASHBOARD_FORM_ID } from "@/lib/edit-mode-context";
import { useToast } from "@/components/ui/ToastProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { deleteIncident } from "@/actions/incidents";
import { checkIsAdmin } from "@/utils";

interface StatusBarProps {
  userRole?: string;
}

function StatusBarContent({ userRole }: StatusBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isEditing, setIsEditing, disableEditButton, disableApproveButton } =
    useEditMode();

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

  const handleApprove = () => {
    if (disableApproveButton) {
      toast.error("Sự cố này đã được duyệt.");
      return;
    }
    const form = document.getElementById(
      DASHBOARD_FORM_ID,
    ) as HTMLFormElement | null;
    if (form) {
      const submitter = document.createElement("button");
      submitter.name = "action_type";
      submitter.value = "approve";
      submitter.type = "submit";
      submitter.style.display = "none";
      form.appendChild(submitter);
      submitter.click();
      form.removeChild(submitter);
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

  const isAdmin = checkIsAdmin(userRole);
  const canSave = isEditing || disableEditButton;

  return (
    <>
      <div className="ql-status-bar">
        <div className="ql-status-actions">
          {/* Thêm mới (nếu ở dashboard) / Duyệt (nếu ở incidents & là admin) */}
          {pathname !== "/incidents" ? (
            <button className="ql-btn-action" onClick={handleNew}>
              <span className="ql-btn-icon-green">&#10010;</span> Thêm mới
            </button>
          ) : (
            isAdmin && (
              <button
                className="ql-btn-action"
                onClick={handleApprove}
                disabled={disableApproveButton}
                title={
                  disableApproveButton
                    ? "Sự cố này đã được duyệt"
                    : "Duyệt thông tin sự cố"
                }
              >
                <span className="ql-btn-icon-green">&#10003;</span> Duyệt
              </button>
            )
          )}

          {/* Sửa — disabled khi đang editing HOẶC khi sự cố chưa phân tích (đã mở sẵn ô nhập) */}
          <button
            className="ql-btn-action"
            onClick={handleEdit}
            disabled={isEditing || disableEditButton}
          >
            <span className="ql-btn-icon-yellow">&#9999;</span> Sửa
          </button>

          {/* Lưu — chỉ active khi đang ở chế độ sửa, sự cố chưa phân tích, hoặc trang khai báo mới */}
          <button
            className="ql-btn-action"
            onClick={handleSave}
            disabled={!canSave}
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

export function StatusBar({ userRole }: StatusBarProps) {
  return (
    <Suspense fallback={<div className="ql-status-bar" />}>
      <StatusBarContent userRole={userRole} />
    </Suspense>
  );
}

