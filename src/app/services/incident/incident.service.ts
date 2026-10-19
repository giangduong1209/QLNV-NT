import { prisma, type Prisma } from "@/lib/prisma";

import {
  toDate,
  formatDate,
  toTimeStr,
  generateRandomIncidentCodeParts,
  checkIsAdmin,
} from "@/utils";
import { getLookupDataFromDB } from "@/app/services/lookup/lookup.service";
import { CAUSES_LEFT_DEFAULT, CAUSES_RIGHT_DEFAULT } from "@/constants";
import type {
  FilterParams,
  IncidentSavePayload,
  AnalysisSavePayload,
  CauseSubItem,
} from "@/types";

function isFilterParams(arg: unknown): arg is FilterParams {
  if (!arg || typeof arg !== "object") return false;
  return (
    "trangThai" in arg ||
    "tuNgay" in arg ||
    "denNgay" in arg ||
    "maphong" in arg ||
    "tuNgayTime" in arg ||
    "denNgayTime" in arg
  );
}

export async function getCandidateDepartmentIds(selectedId: number): Promise<{
  maphongIds: number[];
  maphongnoiIds: number[];
}> {
  if (selectedId === undefined || selectedId === null || isNaN(selectedId)) {
    return { maphongIds: [], maphongnoiIds: [] };
  }

  const subRooms = await prisma.dmphongnoi_scyk.findMany({
    where: { maphong: selectedId },
    select: { maphongnoi: true },
  });

  return {
    maphongIds: [selectedId],
    maphongnoiIds: subRooms.map((room) => room.maphongnoi),
  };
}

export async function getIncidentList(
  params?: FilterParams | Prisma.dangky_sucoykhoaWhereInput,
) {
  const getAnalyzedMasucoSet = async () => {
    const analyzedRows = await prisma.dangky_phantichsuco.findMany({
      select: { masuco: true },
    });
    return new Set(analyzedRows.map((row) => row.masuco));
  };

  if (!params || !isFilterParams(params)) {
    const where =
      params && typeof params === "object"
        ? (params as Prisma.dangky_sucoykhoaWhereInput)
        : undefined;
    const list = await prisma.dangky_sucoykhoa.findMany({
      where,
      orderBy: { ngaysuco: "desc" },
    });
    const analyzedSet = await getAnalyzedMasucoSet();
    return list.map((item) => ({
      ...item,
      daPhanTich: analyzedSet.has(item.masuco),
    }));
  }

  const { trangThai, tuNgay, tuNgayTime, denNgay, denNgayTime, maphong } =
    params;

  const startDate = tuNgay
    ? toDate(tuNgay, tuNgayTime || "00:00", false)
    : null;
  const endDate = denNgay
    ? toDate(denNgay, denNgayTime || "23:59", true)
    : null;

  const conditions: Prisma.dangky_sucoykhoaWhereInput[] = [];

  if (startDate || endDate) {
    conditions.push({
      ngaysuco: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    });
  }

  const analyzedSet = await getAnalyzedMasucoSet();
  const analyzedMasucoList = Array.from(analyzedSet);

  if (trangThai === "DA_PHAN_TICH") {
    if (analyzedMasucoList.length > 0) {
      conditions.push({ masuco: { in: analyzedMasucoList } });
    } else {
      conditions.push({ masuco: { in: [-1] } });
    }
  } else if (trangThai === "CHUA_PHAN_TICH") {
    if (analyzedMasucoList.length > 0) {
      conditions.push({ masuco: { notIn: analyzedMasucoList } });
    }
  }

  if (maphong !== undefined && maphong !== null && !isNaN(maphong)) {
    const { maphongIds, maphongnoiIds } =
      await getCandidateDepartmentIds(maphong);
    if (maphongIds.length > 0) {
      const orConditions: Prisma.dangky_sucoykhoaWhereInput[] = [
        { maphong: { in: maphongIds } },
        { makkbaocao: { in: maphongIds } },
      ];
      if (maphongnoiIds.length > 0) {
        orConditions.push({ maphongnoi: { in: maphongnoiIds } });
      } else {
        orConditions.push({ maphongnoi: { in: maphongIds } });
      }
      conditions.push({ OR: orConditions });
    }
  }

  const where: Prisma.dangky_sucoykhoaWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const list = await prisma.dangky_sucoykhoa.findMany({
    where,
    orderBy: { ngaysuco: "desc" },
  });

  return list.map((item) => ({
    ...item,
    daPhanTich: analyzedSet.has(item.masuco),
  }));
}

export async function getIncidentDetail(masuco: number) {
  const [sucoykhoa, phantichsuco] = await Promise.all([
    prisma.dangky_sucoykhoa.findUnique({
      where: { masuco },
    }),
    prisma.dangky_phantichsuco.findUnique({
      where: { masuco },
    }),
  ]);

  if (!sucoykhoa) return null;

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
        } catch (databaseInsertError: unknown) {
          console.warn(
            `[saveIncidentToDB] Xung đột DB/Race Condition tại lượt ${attempt + 1}:`,
            (databaseInsertError as Error)?.message,
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

export async function deleteIncidentFromDB(
  masuco: number,
  userRole?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Kiểm tra tồn tại bản ghi sự cố
    const incidentRecord = await prisma.dangky_sucoykhoa.findUnique({
      where: { masuco },
      select: { masuco: true },
    });

    if (!incidentRecord) {
      return { success: false, error: "Không tìm thấy sự cố cần xóa." };
    }

    // 2. Kiểm tra bản ghi phân tích và điều kiện xóa
    const phanTichRecord = await prisma.dangky_phantichsuco.findUnique({
      where: { masuco },
      select: { duyet: true },
    });

    if (phanTichRecord) {
      if (phanTichRecord.duyet === true) {
        return {
          success: false,
          error: "Sự cố đã được duyệt và không được phép xóa.",
        };
      }

      const isAdmin = checkIsAdmin(userRole);

      if (!isAdmin) {
        return {
          success: false,
          error: "Sự cố đã được phân tích, không được phép xóa.",
        };
      }
    }

    // 3. Thực hiện xóa triệt để cả 2 bảng trong Prisma Transaction
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

// ============================================================
// Xuất danh sách sự cố y khoa sang định dạng Excel
// ============================================================
export interface IncidentExportRow {
  stt: number;
  masuco: number;
  sosuco: string;
  hoten: string;
  thoidiemXayRa: string;
  thoigianBaoCao: string;
  diadiem: string;
  vitricuthe: string;
  tinhchat: string;
  nhomSuCo: string;
  nhomNguyenNhan: string;
  mucdoTonThuong: string;
  mota: string;
  giaiphapBandau: string;
  giaiphapTranhLaplai: string;
  trangthai: string;
}

function formatExportDateTime(dt: Date | string | null | undefined): string {
  if (!dt) return "—";
  const d = formatDate(dt);
  const t = toTimeStr(dt);
  return t ? `${t} ${d}` : d || "—";
}

function formatCausesText(
  phanTich: Record<string, unknown> | null | undefined,
  causeSubItemsMap?: Record<string, CauseSubItem[]>,
): string {
  if (!phanTich) return "Chưa phân tích";

  const allCauseDefinitions: { key: string; label: string }[] = [
    ...CAUSES_LEFT_DEFAULT.map((c) => ({
      key: c.causeKey,
      label: c.causeLabel,
    })),
    ...CAUSES_RIGHT_DEFAULT.map((c) => ({
      key: c.causeKey,
      label: c.causeLabel,
    })),
  ];

  const matchedCauses: string[] = [];

  for (const def of allCauseDefinitions) {
    const rawVal = phanTich[def.key];
    if (rawVal && typeof rawVal === "string" && rawVal.trim() !== "") {
      const selectedIds = rawVal
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const subItems = causeSubItemsMap?.[def.key] ?? [];
      const subItemMap = new Map(
        subItems.map((item) => [String(item.id), item.name]),
      );

      const itemNames = selectedIds.map(
        (id: string) => subItemMap.get(id) ?? `Mục ${id}`,
      );

      if (itemNames.length > 0) {
        matchedCauses.push(`• ${def.label}: ${itemNames.join(", ")}`);
      }
    }
  }

  if (
    phanTich.ptkhac &&
    typeof phanTich.ptkhac === "string" &&
    phanTich.ptkhac.trim() !== ""
  ) {
    matchedCauses.push(`• Khác: ${phanTich.ptkhac.trim()}`);
  }
  if (
    phanTich.nnnkhac &&
    typeof phanTich.nnnkhac === "string" &&
    phanTich.nnnkhac.trim() !== ""
  ) {
    matchedCauses.push(`• Nguyên nhân khác: ${phanTich.nnnkhac.trim()}`);
  }

  return matchedCauses.length > 0
    ? matchedCauses.join("\n")
    : "Không ghi nhận nguyên nhân cụ thể";
}

function formatInjuryText(
  sucoykhoa: {
    danhgiabandau?: number | null;
    phanloaibandau?: number | null;
  },
  phanTich: Record<string, unknown> | null | undefined,
  danhGiaMap: Map<number, string>,
  phanLoaiMap: Map<number, string>,
): string {
  if (phanTich) {
    const injuries: string[] = [];
    if (phanTich.tt_NC0 === true) {
      injuries.push("NC0 - Không có tổn thương");
    }
    if (
      phanTich.tt_NC1 &&
      typeof phanTich.tt_NC1 === "string" &&
      phanTich.tt_NC1.trim() !== ""
    ) {
      injuries.push(`NC1 (Nhẹ): ${phanTich.tt_NC1.trim()}`);
    }
    if (
      phanTich.tt_NC2 &&
      typeof phanTich.tt_NC2 === "string" &&
      phanTich.tt_NC2.trim() !== ""
    ) {
      injuries.push(`NC2 (Trung bình): ${phanTich.tt_NC2.trim()}`);
    }
    if (
      phanTich.tt_NC3 &&
      typeof phanTich.tt_NC3 === "string" &&
      phanTich.tt_NC3.trim() !== ""
    ) {
      injuries.push(`NC3 (Nặng): ${phanTich.tt_NC3.trim()}`);
    }
    if (
      phanTich.tttochuc &&
      typeof phanTich.tttochuc === "string" &&
      phanTich.tttochuc.trim() !== ""
    ) {
      injuries.push(`Tổn thương tổ chức: ${phanTich.tttochuc.trim()}`);
    }
    if (injuries.length > 0) {
      return injuries.join("\n");
    }
  }

  // Fallback đánh giá ban đầu
  if (sucoykhoa.danhgiabandau && danhGiaMap.has(sucoykhoa.danhgiabandau)) {
    return danhGiaMap.get(sucoykhoa.danhgiabandau)!;
  }
  if (sucoykhoa.phanloaibandau && phanLoaiMap.has(sucoykhoa.phanloaibandau)) {
    return phanLoaiMap.get(sucoykhoa.phanloaibandau)!;
  }

  return "Chưa xác định";
}

export async function getIncidentExportData(
  params?: FilterParams,
): Promise<IncidentExportRow[]> {
  const list = await getIncidentList(params);
  if (!list || list.length === 0) {
    return [];
  }

  const masucoList = list.map((item) => item.masuco);
  const [phanTichList, lookup] = await Promise.all([
    prisma.dangky_phantichsuco.findMany({
      where: { masuco: { in: masucoList } },
    }),
    getLookupDataFromDB(),
  ]);

  const phanTichMap = new Map(phanTichList.map((p) => [p.masuco, p]));

  const phongMap = new Map(lookup.phong.map((p) => [p.maphong, p.tenphong]));
  const phongNoiMap = new Map(
    lookup.phongNoi.map((pn) => [pn.maphongnoi, pn.tenphongnoi]),
  );
  const hinhThucMap = new Map(
    lookup.hinhThuc.map((h) => [h.mahinhthuc, h.tenhinhthuc]),
  );
  const loaiSuCoMap = new Map(
    lookup.loaiSuCo.map((l) => [l.maloaiscyk, l.tenloaiscyk]),
  );
  const danhGiaMap = new Map(
    lookup.danhGiaBanDau.map((d) => [d.madanhgia, d.tendanhgia]),
  );
  const phanLoaiMap = new Map(
    lookup.phanLoaiBanDau.map((p) => [p.maphanloai, p.tenphanloai]),
  );

  return list.map((item, index) => {
    const pt = phanTichMap.get(item.masuco) as
      | Record<string, unknown>
      | undefined;

    const tenPhong = item.maphong ? (phongMap.get(item.maphong) ?? "") : "";
    const tenPhongNoi = item.maphongnoi
      ? (phongNoiMap.get(item.maphongnoi) ?? "")
      : "";
    let diadiem = "";
    if (tenPhong && tenPhongNoi) {
      diadiem = `${tenPhong} - ${tenPhongNoi}`;
    } else {
      diadiem = tenPhong || tenPhongNoi || "—";
    }

    const tinhchat = item.mahinhthuc
      ? (hinhThucMap.get(item.mahinhthuc) ?? "—")
      : "—";

    const nhomSuCo =
      (item.maloaiscyk ? loaiSuCoMap.get(item.maloaiscyk) : null) ||
      item.tensuco ||
      "—";

    const nhomNguyenNhan = formatCausesText(pt, lookup.causeSubItemsMap);
    const mucdoTonThuong = formatInjuryText(item, pt, danhGiaMap, phanLoaiMap);

    const giaiphapTranhLaplai =
      item.giaiphaptranhlaplai ||
      (typeof pt?.dexuat === "string" ? pt.dexuat : null) ||
      (typeof pt?.khacphucsuco === "string" ? pt.khacphucsuco : null) ||
      item.giaiphapdexuat ||
      "—";

    let trangthai = "Chưa phân tích";
    if (pt) {
      trangthai = pt.duyet === true ? "Đã duyệt" : "Đã phân tích (Chưa duyệt)";
    }

    return {
      stt: index + 1,
      masuco: item.masuco,
      sosuco: item.sosuco ?? String(item.masuco),
      hoten: item.hoten || "—",
      thoidiemXayRa: formatExportDateTime(item.ngaysuco),
      thoigianBaoCao: formatExportDateTime(item.ngay),
      diadiem,
      vitricuthe: item.vitricuthe || "—",
      tinhchat,
      nhomSuCo,
      nhomNguyenNhan,
      mucdoTonThuong,
      mota: item.mota || "—",
      giaiphapBandau: item.xulybandau || "—",
      giaiphapTranhLaplai,
      trangthai,
    };
  });
}
