"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEditMode } from "@/store/use-edit-mode-store";
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
  const {
    isEditing,
    setIsEditing,
    disableEditButton,
    disableApproveButton,
    daPhanTich,
    daDuyet,
    isSubmitting,
    submitAction,
    triggerSubmit,
  } = useEditMode();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const masucoParam = searchParams.get("masuco");
  const activeMasuco = masucoParam ? parseInt(masucoParam, 10) : null;

  // Trigger form submit via React context
  const handleSave = () => {
    triggerSubmit("save");
  };

  const handleApprove = () => {
    if (disableApproveButton) {
      toast.error("Sự cố này đã được duyệt.");
      return;
    }
    triggerSubmit("approve");
  };

  const handleEdit = () => {
    if (!activeMasuco) {
      toast.error("Vui lòng chọn sự cố để phân tích hoặc duyệt");
      return;
    }
    setIsEditing(true);
  };

  const handleExit = useCallback(() => {
    // 1. Nếu đang ở chế độ sửa -> tắt chế độ sửa
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    // 2. Nếu đang chọn một sự cố -> bỏ chọn sự cố (xóa query ?masuco=)
    if (activeMasuco) {
      router.push(pathname);
      return;
    }

    // 3. Nếu ở tab Duyệt thông tin sự cố (/incidents) và chưa chọn sự cố -> quay về tab Khai báo (/dashboard)
    if (pathname === "/incidents") {
      router.push("/dashboard");
      return;
    }

    if (pathname === "/dashboard") {
      router.push("/dashboard");
    }
  }, [isEditing, setIsEditing, activeMasuco, router, pathname]);

  // Lắng nghe sự kiện phím Esc trên bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleExit]);

  const handleNew = () => {
    setIsEditing(true);
    router.push("/dashboard");
  };

  const isAdmin = checkIsAdmin(userRole);

  // Tính toán điều kiện xóa và tooltip
  let canDelete = false;
  let deleteTooltip = "";

  if (!activeMasuco) {
    canDelete = false;
    deleteTooltip = "Chọn sự cố để xóa";
  } else if (isEditing) {
    canDelete = false;
    deleteTooltip = "Hoàn tất hoặc hủy chỉnh sửa trước khi xóa";
  } else if (daDuyet) {
    canDelete = false;
    deleteTooltip = "Sự cố đã được duyệt và không được phép xóa";
  } else if (daPhanTich && !isAdmin) {
    canDelete = false;
    deleteTooltip = "Sự cố đã được phân tích, không được phép xóa";
  } else {
    canDelete = true;
    deleteTooltip = "Xóa sự cố đang chọn";
  }

  const handleOpenDeleteModal = () => {
    if (canDelete && activeMasuco) {
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

  const isIncidentsPageNoSelection = pathname === "/incidents" && !activeMasuco;
  const canSave =
    !isIncidentsPageNoSelection && (isEditing || disableEditButton) && !isSubmitting;
  const isSavingNow = isSubmitting && submitAction === "save";
  const isApprovingNow = isSubmitting && submitAction === "approve";

  return (
    <>
      <div className="ql-status-bar">
        <div className="ql-status-actions">
          {/* Thêm mới (nếu ở dashboard) / Duyệt (nếu ở incidents & là admin) */}
          {pathname !== "/incidents" ? (
            <button
              className="ql-btn-action"
              onClick={handleNew}
              disabled={isSubmitting || isDeleting}
            >
              <span className="ql-btn-icon-green">&#10010;</span> Thêm mới
            </button>
          ) : (
            isAdmin && (
              <button
                className="ql-btn-action"
                onClick={handleApprove}
                disabled={disableApproveButton || isSubmitting || isDeleting}
                title={
                  disableApproveButton
                    ? "Sự cố này đã được duyệt"
                    : "Duyệt thông tin sự cố"
                }
              >
                {isApprovingNow ? (
                  <svg
                    className="w-3.5 h-3.5 animate-spin text-green-600 inline-block"
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
                  <span className="ql-btn-icon-green">&#10003;</span>
                )}
                {isApprovingNow ? "Đang duyệt..." : "Duyệt"}
              </button>
            )
          )}

          <button
            className="ql-btn-action"
            onClick={handleEdit}
            disabled={
              !activeMasuco || isEditing || disableEditButton || isSubmitting || isDeleting
            }
          >
            <span className="ql-btn-icon-yellow">&#9999;</span> Sửa
          </button>

          {/* Lưu — chỉ active khi đang ở chế độ sửa, sự cố chưa phân tích, hoặc trang khai báo mới */}
          <button
            className="ql-btn-action"
            onClick={handleSave}
            disabled={!canSave}
          >
            {isSavingNow ? (
              <svg
                className="w-3.5 h-3.5 animate-spin text-blue-600 inline-block"
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
              <span className="ql-btn-icon-blue">&#128190;</span>
            )}
            {isSavingNow ? "Đang lưu..." : "Lưu"}
          </button>

          {/* Xóa */}
          <button
            className="ql-btn-action"
            onClick={handleOpenDeleteModal}
            disabled={!canDelete || isSubmitting || isDeleting}
            title={deleteTooltip}
          >
            {isDeleting ? (
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
              <span className="ql-btn-icon-red">&#10008;</span>
            )}
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </button>

          {/* In phiếu — chưa implement */}
          <button className="ql-btn-action" disabled={!activeMasuco || isSubmitting || isDeleting}>
            <span className="ql-btn-icon-blue">&#128427;</span> In phiếu{" "}
            <small>▼</small>
          </button>

          {/* Thoát: tắt edit mode */}
          <button className="ql-btn-action" onClick={handleExit} disabled={isSubmitting || isDeleting}>
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
