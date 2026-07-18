"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
    const tuNgayDate = new Date(tuNgay);
    tuNgayDate.setHours(0, 0, 0, 0);

    const denNgayDate = new Date(denNgay);
    denNgayDate.setHours(23, 59, 59, 999);

    // Điều kiện cơ bản: lọc theo ngày sự cố

    const baseWhere: Prisma.dangky_sucoykhoaWhereInput = {
      ngaysuco: {
        gte: tuNgayDate,
        lte: denNgayDate,
      },
      ...(maphong ? { maphong } : {}),
    };

    // Điều kiện lọc theo trạng thái phân tích
    let whereCondition: typeof baseWhere;

    if (trangThai === "DA_PHAN_TICH") {
      // Đã phân tích: có bản ghi trong dangky_phantichsuco VÀ duyet = true
      whereCondition = {
        ...baseWhere,
        phantichsuco: {
          duyet: true,
        },
      };
    } else if (trangThai === "CHUA_PHAN_TICH") {
      // Chưa phân tích: KHÔNG có bản ghi hoặc duyet != true
      whereCondition = {
        ...baseWhere,
        OR: [
          { phantichsuco: null },
          {
            phantichsuco: {
              duyet: { not: true },
            },
          },
        ],
      };
    } else {
      // Tất cả
      whereCondition = baseWhere;
    }

    console.log(whereCondition);

    const rows = await prisma.dangky_sucoykhoa.findMany({
      where: whereCondition,
      select: {
        masuco: true,
        sosuco: true,
        hoten: true,
        ngaysuco: true,
        maphong: true,
        phantichsuco: {
          select: { duyet: true },
        },
      },
      orderBy: { ngaysuco: "desc" },
    });

    console.log(rows);

    const data: SuCoListItem[] = rows.map((row) => ({
      masuco: row.masuco,
      sosuco: row.sosuco,
      hoten: row.hoten,
      ngaysuco: row.ngaysuco,
      maphong: row.maphong,
      daPhanTich: row.phantichsuco?.duyet === true,
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
    const row = await prisma.dangky_sucoykhoa.findUnique({
      where: { masuco },
      include: {
        phantichsuco: true,
      },
    });

    if (!row) {
      return { data: null, error: "Không tìm thấy sự cố" };
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
