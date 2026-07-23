import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { toDate, generateRandomIncidentCodeParts } from "@/utils";
import type { FilterParams } from "@/types";

export async function getCandidateDepartmentIds(selectedId: number): Promise<{
  maphongIds: number[];
  maphongnoiIds: number[];
}> {
  const subRooms = await prisma.dmphongnoi_scyk.findMany({
    where: { maphong: selectedId },
    select: { maphongnoi: true },
  });

  return {
    maphongIds: [selectedId],
    maphongnoiIds: subRooms.map((room) => room.maphongnoi),
  };
}

function isFilterParams(arg: any): arg is FilterParams {
  return (
    arg && typeof arg === "object" && ("trangThai" in arg || "tuNgay" in arg)
  );
}

export async function getIncidentList(
  params?: FilterParams | Prisma.dangky_sucoykhoaWhereInput,
) {
  if (!params) {
    return prisma.dangky_sucoykhoa.findMany({
      orderBy: { ngaysuco: "desc" },
    });
  }

  if (!isFilterParams(params)) {
    return prisma.dangky_sucoykhoa.findMany({
      where: params,
      orderBy: { ngaysuco: "desc" },
    });
  }

  const { trangThai, tuNgay, tuNgayTime, denNgay, denNgayTime, maphong } =
    params;

  const startDate = tuNgay ? toDate(tuNgay, tuNgayTime || "00:00") : null;
  const endDate = denNgay ? toDate(denNgay, denNgayTime || "23:59") : null;

  const conditions: Prisma.dangky_sucoykhoaWhereInput[] = [];

  if (startDate || endDate) {
    conditions.push({
      ngaysuco: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    });
  }

  if (trangThai === "DA_PHAN_TICH") {
    conditions.push({ daphantich: true });
  } else if (trangThai === "CHUA_PHAN_TICH") {
    conditions.push({ daphantich: false });
  }

  if (maphong) {
    const { maphongIds, maphongnoiIds } =
      await getCandidateDepartmentIds(maphong);
    const orConditions: Prisma.dangky_sucoykhoaWhereInput[] = [
      { maphong: { in: maphongIds } },
      { makkbaocao: { in: maphongIds } },
    ];
    if (maphongnoiIds.length > 0) {
      orConditions.push({ maphongnoi: { in: maphongnoiIds } });
    }
    conditions.push({ OR: orConditions });
  }

  const where: Prisma.dangky_sucoykhoaWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  return prisma.dangky_sucoykhoa.findMany({
    where,
    orderBy: { ngaysuco: "desc" },
  });
}

export async function getIncidentDetail(masuco: number) {
  const sucoykhoa = await prisma.dangky_sucoykhoa.findUnique({
    where: { masuco },
  });

  if (!sucoykhoa) return null;

  const phantichsuco = await prisma.dangky_phantichsuco.findUnique({
    where: { masuco },
  });

  return { ...sucoykhoa, phantichsuco: phantichsuco ?? null };
}

export async function getPreviewIncidentCode(): Promise<{
  sosuco: string;
  masuco: number;
}> {
  const maxRetries = 20;
  for (let i = 0; i < maxRetries; i++) {
    const candidate = generateRandomIncidentCodeParts();
    const existing = await prisma.dangky_sucoykhoa.findUnique({
      where: { masuco: candidate.masuco },
      select: { masuco: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  const fallbackMasuco = parseInt(String(Date.now()).slice(-9), 10);
  return { sosuco: `SC${fallbackMasuco}`, masuco: fallbackMasuco };
}

export async function saveIncidentToDB(
  masuco: number | null,
  payload: any,
): Promise<{ success: boolean; masuco?: number; error?: string }> {
  try {
    // 1. Kiểm tra không trùng Mã KCB nếu có nhập
    const trimmedKcb = String(payload.makcb).trim();
    if (payload.makcb && trimmedKcb !== "") {
      const existingKcb = await prisma.dangky_sucoykhoa.findFirst({
        where: {
          makcb: trimmedKcb,
          ...(masuco ? { masuco: { not: masuco } } : {}),
        },
        select: { masuco: true, sosuco: true },
      });

      if (existingKcb) {
        return {
          success: false,
          error: `Mã KCB "${trimmedKcb}" đã được sử dụng ở sự cố ${existingKcb.sosuco ?? existingKcb.masuco}.`,
        };
      }
    }

    // 2. Kiểm tra không trùng Số bệnh án nếu có nhập
    const trimmedBenhAn = String(payload.sobenhan).trim();
    if (payload.sobenhan && trimmedBenhAn !== "") {
      const existingBenhAn = await prisma.dangky_sucoykhoa.findFirst({
        where: {
          sobenhan: trimmedBenhAn,
          ...(masuco ? { masuco: { not: masuco } } : {}),
        },
        select: { masuco: true, sosuco: true },
      });

      if (existingBenhAn) {
        return {
          success: false,
          error: `Số bệnh án "${trimmedBenhAn}" đã được sử dụng ở sự cố ${existingBenhAn.sosuco ?? existingBenhAn.masuco}.`,
        };
      }
    }

    if (masuco) {
      await prisma.dangky_sucoykhoa.update({
        where: { masuco },
        data: payload,
      });
      return { success: true, masuco };
    } else {
      const maximumRetryAttempts = 10;
      for (let attempt = 0; attempt < maximumRetryAttempts; attempt++) {
        const candidateIncidentCode = generateRandomIncidentCodeParts();

        // Kiểm tra xem mã sự cố đã tồn tại trong CSDL chưa
        const existingIncidentRecord = await prisma.dangky_sucoykhoa.findUnique({
          where: { masuco: candidateIncidentCode.masuco },
          select: { masuco: true },
        });

        if (existingIncidentRecord) {
          continue;
        }

        try {
          await prisma.dangky_sucoykhoa.create({
            data: {
              masuco: candidateIncidentCode.masuco,
              sosuco: candidateIncidentCode.sosuco,
              daphantich: false,
              ...payload,
            },
          });
          return { success: true, masuco: candidateIncidentCode.masuco };
        } catch (databaseInsertError: any) {
          console.warn(
            `[saveIncidentToDB] Xung đột DB/Race Condition tại lượt ${attempt + 1}:`,
            databaseInsertError?.message,
          );
          if (attempt === maximumRetryAttempts - 1) {
            throw databaseInsertError;
          }
        }
      }
      return { success: false, error: "Không thể tạo mã sự cố tự động." };
    }
  } catch (error) {
    console.error("saveIncidentToDB error:", error);
    throw error;
  }
}

export async function getLookupDataFromDB() {
  const [
    loaiSuCo,
    tenSuCo,
    hinhThuc,
    phai,
    doiTuong,
    phong,
    phongNoi,
    phanLoaiBanDau,
    danhGiaBanDau,
    kyThuatMaxCount,
    nhiemKhuanMaxCount,
    thuocMaxCount,
    mauMaxCount,
    thietBiYTeMaxCount,
    hanhViMaxCount,
    taiNanMaxCount,
    haTangMaxCount,
    nguonLucMaxCount,
    taiLieuMaxCount,
    nhanVienMaxCount,
    nguoiBenhMaxCount,
    moiTruongMaxCount,
    toChucMaxCount,
    yeuToBenNgoaiMaxCount,
  ] = await Promise.all([
    prisma.dmloaisuco.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maloaiscyk: true, tenloaiscyk: true },
    }),
    prisma.dmtensucoyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { idscyk: true, maloaiscyk: true, tensucoyk: true },
    }),
    prisma.dmhinhthuc_scyk.findMany({
      select: { mahinhthuc: true, tenhinhthuc: true },
    }),
    prisma.dmphai_scyk.findMany({
      select: { maphai: true, phai: true },
    }),
    prisma.dmdoituongsc_scyk.findMany({
      select: { madoituongsc: true, doituongsc: true },
    }),
    prisma.dmphong_scyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maphong: true, tenphong: true, loai: true, sapxep: true },
    }),
    prisma.dmphongnoi_scyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: {
        maphongnoi: true,
        maphong: true,
        tenphongnoi: true,
        sapxep: true,
      },
    }),
    prisma.dmphanloaibandau.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maphanloai: true, tenphanloai: true },
    }),
    prisma.dmdanhgiabandau.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { madanhgia: true, mamucdo: true, tendanhgia: true },
    }),
    prisma.dmkythuat_scyk.count(),
    prisma.dmnhiemkhuan_scyk.count(),
    prisma.dmthuoc_scyk.count(),
    prisma.dmmau_scyk.count(),
    prisma.dmthietbiyte_scyk.count(),
    prisma.dmhanhvi_scyk.count(),
    prisma.dmtainan_scyk.count(),
    prisma.dmhatang_scyk.count(),
    prisma.dmnguonluc_scyk.count(),
    prisma.dmtailieu_scyk.count(),
    prisma.dmnhanvien_scyk.count(),
    prisma.dmnguoibenh_scyk.count(),
    prisma.dmmoitruong_scyk.count(),
    prisma.dmtochuc_scyk.count(),
    prisma.dmyeutobenngoai_scyk.count(),
  ]);

  return {
    loaiSuCo,
    tenSuCo,
    hinhThuc,
    phai,
    doiTuong,
    phong,
    phongNoi,
    phanLoaiBanDau,
    danhGiaBanDau,
    causeMaxOptionsMap: {
      kythuat: kyThuatMaxCount,
      nhiemkhuan: nhiemKhuanMaxCount,
      thuoc: thuocMaxCount,
      mau: mauMaxCount,
      thietbiyte: thietBiYTeMaxCount,
      hanhvi: hanhViMaxCount,
      tainan: taiNanMaxCount,
      hatang: haTangMaxCount,
      nguonluc: nguonLucMaxCount,
      tailieu: taiLieuMaxCount,
      nnnnhanvien: nhanVienMaxCount,
      nnnnguoibenh: nguoiBenhMaxCount,
      nnnmoitruong: moiTruongMaxCount,
      nnntochuc: toChucMaxCount,
      nnnbenngoai: yeuToBenNgoaiMaxCount,
    },
  };
}

export async function deleteIncidentFromDB(
  masuco: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.dangky_phantichsuco.deleteMany({
      where: { masuco },
    });

    await prisma.dangky_sucoykhoa.delete({
      where: { masuco },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteIncidentFromDB error:", error);
    return {
      success: false,
      error: "Không thể xóa sự cố khỏi CSDL. Vui lòng thử lại sau.",
    };
  }
}
