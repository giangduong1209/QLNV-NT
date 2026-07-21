"use server";

import { Prisma } from "@prisma/client";
import {
  getIncidentDetail,
  getIncidentList,
  saveIncidentToDB,
} from "@/app/services/incident/incident.service";
import type {
  FilterParams,
  SuCoListItem,
  SuCoDetail,
  IncidentSavePayload,
  ActionResult,
} from "@/types";

/**
 * Parse chuỗi ngày "YYYY-MM-DD" và giờ "HH:mm" thành đối tượng Date.
 */
function parseDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0);
}

// ============================================================
// Lấy danh sách sự cố theo bộ lọc
// ============================================================
export async function getSuCoList(
  params: FilterParams,
): Promise<ActionResult<SuCoListItem[]>> {
  const { trangThai, tuNgay, tuNgayTime, denNgay, denNgayTime, maphong } = params;

  try {
    const startDate = parseDateTime(tuNgay, tuNgayTime);
    const endDate = parseDateTime(denNgay, denNgayTime);

    const baseWhere: Prisma.dangky_sucoykhoaWhereInput = {
      ngaysuco: {
        gte: startDate,
        lte: endDate,
      },
      ...(maphong ? { maphong } : {}),
    };

    let whereCondition = baseWhere;
    if (trangThai === "DA_PHAN_TICH") {
      whereCondition = { ...baseWhere, daphantich: true };
    } else if (trangThai === "CHUA_PHAN_TICH") {
      whereCondition = { ...baseWhere, daphantich: false };
    }

    const rows = await getIncidentList(whereCondition);
    return { success: true, data: rows };
  } catch (error) {
    console.error("[getSuCoList] Exception:", error);
    return { success: false, error: "Không thể tải danh sách sự cố. Vui lòng thử lại sau." };
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

    const data: SuCoDetail = {
      sucoykhoa: {
        masuco: row.masuco,
        sosuco: row.sosuco,
        ngay: row.ngay,
        mahinhthuc: row.mahinhthuc,
        makcb: row.makcb,
        hoten: row.hoten,
        maphong: row.maphong,
        ngaysinh: row.ngaysinh,
        sobenhan: row.sobenhan,
        maphai: row.maphai,
        madoituongsc: row.madoituongsc,
        tensuco: row.tensuco,
        ngaysuco: row.ngaysuco,
        maphongnoi: row.maphongnoi,
        vitricuthe: row.vitricuthe,
        mota: row.mota,
        giaiphapdexuat: row.giaiphapdexuat,
        xulybandau: row.xulybandau,
        thongbaobacsy: row.thongbaobacsy,
        thongbaonguoinha: row.thongbaonguoinha,
        ghinhan: row.ghinhan,
        thongbaonguoibenh: row.thongbaonguoibenh,
        phanloaibandau: row.phanloaibandau,
        danhgiabandau: row.danhgiabandau,
        manguoibaocao: row.manguoibaocao,
        hotennguoibaocao: row.hotennguoibaocao,
        dienthoainguoibaocao: row.dienthoainguoibaocao,
        emailnguoibaocao: row.emailnguoibaocao,
        chungkien1: row.chungkien1,
        chungkien2: row.chungkien2,
        nguyennhangoc: row.nguyennhangoc,
        giaiphaptranhlaplai: row.giaiphaptranhlaplai,
        maloaiscyk: row.maloaiscyk,
      },
      phantichsuco: row.phantichsuco
        ? {
            masuco: row.phantichsuco.masuco,
            ngay: row.phantichsuco.ngay,
            mota: row.phantichsuco.mota,
            kythuat: row.phantichsuco.kythuat,
            nhiemkhuan: row.phantichsuco.nhiemkhuan,
            thuoc: row.phantichsuco.thuoc,
            mau: row.phantichsuco.mau,
            thietbiyte: row.phantichsuco.thietbiyte,
            hanhvi: row.phantichsuco.hanhvi,
            tainan: row.phantichsuco.tainan,
            hatang: row.phantichsuco.hatang,
            nguonluc: row.phantichsuco.nguonluc,
            tailieu: row.phantichsuco.tailieu,
            ptkhac: row.phantichsuco.ptkhac,
            ylenh: row.phantichsuco.ylenh,
            nnnnhanvien: row.phantichsuco.nnnnhanvien,
            nnnnguoibenh: row.phantichsuco.nnnnguoibenh,
            nnnmoitruong: row.phantichsuco.nnnmoitruong,
            nnntochuc: row.phantichsuco.nnntochuc,
            nnnbenngoai: row.phantichsuco.nnnbenngoai,
            nnnkhac: row.phantichsuco.nnnkhac,
            khacphucsuco: row.phantichsuco.khacphucsuco,
            dexuat: row.phantichsuco.dexuat,
            chuyengiadanhgia: row.phantichsuco.chuyengiadanhgia,
            cgthaoluan: row.phantichsuco.cgthaoluan,
            phuhop: row.phantichsuco.phuhop,
            khuyencao: row.phantichsuco.khuyencao,
            tt_NC0: row.phantichsuco.tt_NC0,
            tt_NC1: row.phantichsuco.tt_NC1,
            tt_NC2: row.phantichsuco.tt_NC2,
            tt_NC3: row.phantichsuco.tt_NC3,
            tttochuc: row.phantichsuco.tttochuc,
            malanhdao: row.phantichsuco.malanhdao,
            duyet: row.phantichsuco.duyet,
          }
        : null,
    };

    return { success: true, data };
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
    return { success: true, data: { masuco: res.masuco } };
  } catch (error) {
    console.error("[saveIncident] Exception:", error);
    return { success: false, error: "Không thể lưu sự cố. Vui lòng thử lại." };
  }
}

