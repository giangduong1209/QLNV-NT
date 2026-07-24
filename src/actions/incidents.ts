"use server";

import { revalidatePath } from "next/cache";
import {
  getIncidentDetail,
  getIncidentList,
  saveIncidentToDB,
  deleteIncidentFromDB,
  saveAnalysisToDB,
  getPreviewIncidentCode,
} from "@/app/services/incident/incident.service";
import type {
  FilterParams,
  SuCoListItem,
  SuCoDetail,
  IncidentSavePayload,
  ActionResult,
} from "@/types";

// ============================================================
// Lấy Mã sự cố ngẫu nhiên dự kiến (Preview cho màn hình Thêm mới)
// ============================================================
export async function getPreviewSoSuCo(): Promise<
  ActionResult<{ sosuco: string }>
> {
  try {
    const res = await getPreviewIncidentCode();
    return { success: true, data: { sosuco: res.sosuco } };
  } catch (error) {
    console.error("[getPreviewSoSuCo] Exception:", error);
    return {
      success: false,
      error: "Không thể lấy mã sự cố dự kiến.",
    };
  }
}


// ============================================================
// Lấy danh sách sự cố theo bộ lọc
// ============================================================
export async function getSuCoList(
  params: FilterParams,
): Promise<ActionResult<SuCoListItem[]>> {
  try {
    const rows = await getIncidentList(params);
    return { success: true, data: rows };
  } catch (error) {
    console.error("[getSuCoList] Exception:", error);
    return {
      success: false,
      error: "Không thể tải danh sách sự cố. Vui lòng thử lại sau.",
    };
  }
}

// ============================================================
// Lấy chi tiết 1 sự cố (cả 2 bảng)
// ============================================================
export async function getSuCoDetail(
  masuco: number,
): Promise<ActionResult<SuCoDetail>> {
  try {
    const row = await getIncidentDetail(masuco);

    if (!row) {
      return { success: false, error: "Không tìm thấy sự cố yêu cầu" };
    }

    const { phantichsuco, ...sucoykhoa } = row;

    return {
      success: true,
      data: {
        sucoykhoa,
        phantichsuco: phantichsuco ?? null,
      },
    };
  } catch (error) {
    console.error("[getSuCoDetail] Exception:", error);
    return { success: false, error: "Không thể tải chi tiết sự cố." };
  }
}

// ============================================================
// Lưu sự cố (tạo mới hoặc cập nhật dangky_sucoykhoa)
// ============================================================
export async function saveIncident(
  masuco: number | null,
  payload: IncidentSavePayload,
): Promise<ActionResult<{ masuco?: number }>> {
  try {
    const res = await saveIncidentToDB(masuco, payload);
    if (!res.success) {
      return { success: false, error: res.error || "Lưu sự cố không thành công." };
    }
    revalidatePath("/dashboard");
    revalidatePath("/incidents");
    return { success: true, data: { masuco: res.masuco } };
  } catch (error) {
    console.error("[saveIncident] Exception:", error);
    return { success: false, error: "Không thể lưu sự cố. Vui lòng thử lại." };
  }
}

// ============================================================
// Xóa sự cố theo mã sự cố
// ============================================================
export async function deleteIncident(
  masuco: number,
): Promise<ActionResult<{ masuco: number }>> {
  try {
    const res = await deleteIncidentFromDB(masuco);
    if (!res.success) {
      return { success: false, error: res.error || "Xóa sự cố không thành công." };
    }
    revalidatePath("/dashboard");
    revalidatePath("/incidents");
    return { success: true, data: { masuco } };
  } catch (error) {
    console.error("[deleteIncident] Exception:", error);
    return { success: false, error: "Không thể xóa sự cố. Vui lòng thử lại." };
  }
}

// ============================================================
// Lưu / Duyệt kết quả phân tích sự cố (dangky_phantichsuco)
// ============================================================
export async function saveAnalysisIncident(
  masuco: number,
  payload: any,
  isApprove?: boolean,
): Promise<ActionResult<{ masuco: number }>> {
  try {
    const res = await saveAnalysisToDB(masuco, payload, isApprove);
    if (!res.success) {
      return {
        success: false,
        error: res.error || "Lưu kết quả phân tích không thành công.",
      };
    }
    revalidatePath("/dashboard");
    revalidatePath("/incidents");
    return { success: true, data: { masuco } };
  } catch (error) {
    console.error("[saveAnalysisIncident] Exception:", error);
    return {
      success: false,
      error: "Không thể lưu kết quả phân tích. Vui lòng thử lại.",
    };
  }
}
