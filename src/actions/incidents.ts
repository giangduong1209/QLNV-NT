"use server";

import { Prisma } from "@prisma/client";
import {
  getIncidentDetail,
  getIncidentList,
} from "@/services/incident.service";
import type { FilterParams, SuCoListItem, SuCoDetail } from "@/lib/definitions";

// ============================================================
// Lấy danh sách sự cố theo bộ lọc
// ============================================================
export async function getSuCoList(
  params: FilterParams,
): Promise<{ data: SuCoListItem[]; error?: string }> {
  const { trangThai, tuNgay, tuNgayTime, denNgay, denNgayTime, maphong } =
    params;

  try {
    const [startYear, startMonth, startDay] = tuNgay.split("-").map(Number);
    const [startHour, startMinute] = tuNgayTime.split(":").map(Number);
    const startDate = new Date(
      startYear,
      startMonth - 1,
      startDay,
      startHour,
      startMinute,
    );

    const [endYear, endMonth, endDay] = denNgay.split("-").map(Number);
    const [endHour, endMinute] = denNgayTime.split(":").map(Number);

    const endDate = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

    // Điều kiện cơ bản: lọc theo ngày sự cố

    const baseWhere: Prisma.dangky_sucoykhoaWhereInput = {
      ngaysuco: {
        gte: startDate,
        lte: endDate,
      },
      ...(maphong ? { maphong } : {}),
    };

    // Điều kiện lọc theo trạng thái phân tích
    let whereCondition: typeof baseWhere;

    if (trangThai === "DA_PHAN_TICH") {
      whereCondition = {
        ...baseWhere,
        daphantich: true,
      };
    } else if (trangThai === "CHUA_PHAN_TICH") {
      whereCondition = {
        ...baseWhere,
        daphantich: false,
      };
    } else {
      whereCondition = baseWhere;
    }

    const rows = await getIncidentList(whereCondition);

    const data: SuCoListItem[] = rows.map((row) => ({
      ...row,
    }));

    return { data };
  } catch (error) {
    console.error("getSuCoList error:", error);
    return { data: [], error: "Không thể tải danh sách sự cố" };
  }
}

// ============================================================
// Lấy chi tiết 1 sự cố (cả 2 bảng)
// ============================================================
export async function getSuCoDetail(
  masuco: number,
): Promise<{ data: SuCoDetail | null; error?: string }> {
  try {
    const row = await getIncidentDetail(masuco);

    if (!row) {
      return { data: null, error: "Không tìm thấy sự cố" };
    }

    console.log({ row });

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

    return { data };
  } catch (error) {
    console.error("getSuCoDetail error:", error);
    return { data: null, error: "Không thể tải chi tiết sự cố" };
  }
}
