import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { toDate, generateRandomIncidentCodeParts } from "@/utils";
import type {
  FilterParams,
  IncidentSavePayload,
  AnalysisSavePayload,
  PhaiItem,
} from "@/types";

export const DANH_MUC_PHAI: PhaiItem[] = [
  { maphai: 0, phai: "Nam" },
  { maphai: 1, phai: "Nữ" },
];

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
    const list = await prisma.dangky_sucoykhoa.findMany({
      include: {
        phantichsuco: { select: { masuco: true } },
      },
      orderBy: { ngaysuco: "desc" },
    });
    return list.map(({ phantichsuco, ...item }) => ({
      ...item,
      daPhanTich: !!phantichsuco,
    }));
  }

  if (!isFilterParams(params)) {
    const list = await prisma.dangky_sucoykhoa.findMany({
      where: params,
      include: {
        phantichsuco: { select: { masuco: true } },
      },
      orderBy: { ngaysuco: "desc" },
    });
    return list.map(({ phantichsuco, ...item }) => ({
      ...item,
      daPhanTich: !!phantichsuco,
    }));
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

  // Kết hợp lọc dữ liệu giữa hai bảng dangky_sucoykhoa và dangky_phantichsuco theo masuco
  if (trangThai === "DA_PHAN_TICH") {
    conditions.push({ phantichsuco: { isNot: null } });
  } else if (trangThai === "CHUA_PHAN_TICH") {
    conditions.push({ phantichsuco: { is: null } });
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

  const list = await prisma.dangky_sucoykhoa.findMany({
    where,
    include: {
      phantichsuco: { select: { masuco: true } },
    },
    orderBy: { ngaysuco: "desc" },
  });

  return list.map(({ phantichsuco, ...item }) => ({
    ...item,
    daPhanTich: !!phantichsuco,
  }));
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
  payload: IncidentSavePayload,
): Promise<{ success: boolean; masuco?: number; error?: string }> {
  try {
    // 1. Kiểm tra không trùng Mã KCB nếu có nhập
    const trimmedKcb = payload.makcb ? String(payload.makcb).trim() : "";
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
    const trimmedBenhAn = payload.sobenhan
      ? String(payload.sobenhan).trim()
      : "";
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
        const existingIncidentRecord = await prisma.dangky_sucoykhoa.findUnique(
          {
            where: { masuco: candidateIncidentCode.masuco },
            select: { masuco: true },
          },
        );

        if (existingIncidentRecord) {
          continue;
        }

        try {
          await prisma.dangky_sucoykhoa.create({
            data: {
              masuco: candidateIncidentCode.masuco,
              sosuco: candidateIncidentCode.sosuco,
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
  const phai = DANH_MUC_PHAI;
  const [
    loaiSuCo,
    tenSuCo,
    hinhThuc,
    doiTuong,
    phong,
    phongNoi,
    phanLoaiBanDau,
    danhGiaBanDau,
    listKyThuat,
    listNhiemKhuan,
    listThuoc,
    listMau,
    listThietBiYTe,
    listHanhVi,
    listTaiNan,
    listHaTang,
    listNguonLuc,
    listTaiLieu,
    listNhanVien,
    listNguoiBenh,
    listMoiTruong,
    listToChuc,
    listYeuToBenNgoai,
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
    prisma.dmkythuat_scyk.findMany({
      select: { makythuat: true, tenkythuat: true },
    }),
    prisma.dmnhiemkhuan_scyk.findMany({
      select: { manhiemkhuan: true, tennhiemkhuan: true },
    }),
    prisma.dmthuoc_scyk.findMany({
      select: { mathuoc: true, tenthuoc: true },
    }),
    prisma.dmmau_scyk.findMany({
      select: { mamau: true, tenmau: true },
    }),
    prisma.dmthietbiyte_scyk.findMany({
      select: { mathietbiyte: true, tenthietbiyte: true },
    }),
    prisma.dmhanhvi_scyk.findMany({
      select: { mahanhvi: true, tenhanhvi: true },
    }),
    prisma.dmtainan_scyk.findMany({
      select: { matainan: true, tentainan: true },
    }),
    prisma.dmhatang_scyk.findMany({
      select: { mahatang: true, tenhatang: true },
    }),
    prisma.dmnguonluc_scyk.findMany({
      select: { manguonluc: true, tennguonluc: true },
    }),
    prisma.dmtailieu_scyk.findMany({
      select: { matailieu: true, tentailieu: true },
    }),
    prisma.dmnhanvien_scyk.findMany({
      select: { manhanvien: true, tennhanvien: true },
    }),
    prisma.dmnguoibenh_scyk.findMany({
      select: { manguoibenh: true, tennguoibenh: true },
    }),
    prisma.dmmoitruong_scyk.findMany({
      select: { mamoitruong: true, tenmoitruong: true },
    }),
    prisma.dmtochuc_scyk.findMany({
      select: { matochuc: true, tentochuc: true },
    }),
    prisma.dmyeutobenngoai_scyk.findMany({
      select: { mayeutobenngoai: true, tenyeutobenngoai: true },
    }),
  ]);

  const causeSubItemsMap = {
    kythuat: listKyThuat.map((x) => ({
      id: x.makythuat,
      name: x.tenkythuat ?? `Mục ${x.makythuat}`,
    })),
    nhiemkhuan: listNhiemKhuan.map((x) => ({
      id: x.manhiemkhuan,
      name: x.tennhiemkhuan ?? `Mục ${x.manhiemkhuan}`,
    })),
    thuoc: listThuoc.map((x) => ({
      id: x.mathuoc,
      name: x.tenthuoc ?? `Mục ${x.mathuoc}`,
    })),
    mau: listMau.map((x) => ({
      id: x.mamau,
      name: x.tenmau ?? `Mục ${x.mamau}`,
    })),
    thietbiyte: listThietBiYTe.map((x) => ({
      id: x.mathietbiyte,
      name: x.tenthietbiyte ?? `Mục ${x.mathietbiyte}`,
    })),
    hanhvi: listHanhVi.map((x) => ({
      id: x.mahanhvi,
      name: x.tenhanhvi ?? `Mục ${x.mahanhvi}`,
    })),
    tainan: listTaiNan.map((x) => ({
      id: x.matainan,
      name: x.tentainan ?? `Mục ${x.matainan}`,
    })),
    hatang: listHaTang.map((x) => ({
      id: x.mahatang,
      name: x.tenhatang ?? `Mục ${x.mahatang}`,
    })),
    nguonluc: listNguonLuc.map((x) => ({
      id: x.manguonluc,
      name: x.tennguonluc ?? `Mục ${x.manguonluc}`,
    })),
    tailieu: listTaiLieu.map((x) => ({
      id: x.matailieu,
      name: x.tentailieu ?? `Mục ${x.matailieu}`,
    })),
    nnnnhanvien: listNhanVien.map((x) => ({
      id: x.manhanvien,
      name: x.tennhanvien ?? `Mục ${x.manhanvien}`,
    })),
    nnnnguoibenh: listNguoiBenh.map((x) => ({
      id: x.manguoibenh,
      name: x.tennguoibenh ?? `Mục ${x.manguoibenh}`,
    })),
    nnnmoitruong: listMoiTruong.map((x) => ({
      id: x.mamoitruong,
      name: x.tenmoitruong ?? `Mục ${x.mamoitruong}`,
    })),
    nnntochuc: listToChuc.map((x) => ({
      id: x.matochuc,
      name: x.tentochuc ?? `Mục ${x.matochuc}`,
    })),
    nnnbenngoai: listYeuToBenNgoai.map((x) => ({
      id: x.mayeutobenngoai,
      name: x.tenyeutobenngoai ?? `Mục ${x.mayeutobenngoai}`,
    })),
  };

  const causeMaxOptionsMap: Record<string, number> = {};
  for (const [k, v] of Object.entries(causeSubItemsMap)) {
    causeMaxOptionsMap[k] = v.length;
  }

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
    causeMaxOptionsMap,
    causeSubItemsMap,
  };
}

export async function deleteIncidentFromDB(
  masuco: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.dangky_phantichsuco.deleteMany({
        where: { masuco },
      });

      await tx.dangky_sucoykhoa.delete({
        where: { masuco },
      });
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

export async function saveAnalysisToDB(
  masuco: number,
  payload: AnalysisSavePayload,
  isApprove?: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const dataToSave = {
      ...payload,
      ...(isApprove !== undefined ? { duyet: isApprove } : {}),
    };

    await prisma.dangky_phantichsuco.upsert({
      where: { masuco },
      create: {
        masuco,
        ...dataToSave,
      },
      update: dataToSave,
    });

    return { success: true };
  } catch (error) {
    console.error("saveAnalysisToDB error:", error);
    return {
      success: false,
      error: "Không thể lưu kết quả phân tích sự cố. Vui lòng thử lại.",
    };
  }
}
