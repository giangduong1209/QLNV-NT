import { prisma, type Prisma } from "@/lib/prisma";

import {
  toDate,
  formatDate,
  toTimeStr,
  generateRandomIncidentCodeParts,
  checkIsAdmin,
  getAnalysisLabel,
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
  tonThuongNguoiBenhMap: Map<string, string>,
): string {
  if (phanTich) {
    const injuries: string[] = [];
    if (phanTich.tt_NC0 === true) {
      injuries.push("Không có tổn thương (NC0)");
    }

    const appendInjuryLevel = (val?: unknown) => {
      if (val != null) {
        const raw = String(val).trim();
        if (raw !== "" && raw !== "0") {
          const label = tonThuongNguoiBenhMap.get(raw) || raw;
          injuries.push(label);
        }
      }
    };

    appendInjuryLevel(phanTich.tt_NC1);
    appendInjuryLevel(phanTich.tt_NC2);
    appendInjuryLevel(phanTich.tt_NC3);

    if (injuries.length > 0) {
      return Array.from(new Set(injuries)).join("\n");
    }
  }

  // Fallback đánh giá ban đầu
  if (sucoykhoa.danhgiabandau && danhGiaMap.has(sucoykhoa.danhgiabandau)) {
    return danhGiaMap.get(sucoykhoa.danhgiabandau)!;
  }
  if (sucoykhoa.phanloaibandau && phanLoaiMap.has(sucoykhoa.phanloaibandau)) {
    return phanLoaiMap.get(sucoykhoa.phanloaibandau)!;
  }

  return "—";
}

export async function getIncidentExportData(
  params?: FilterParams,
): Promise<IncidentExportRow[]> {
  const data = await getComprehensiveIncidentExportData(params);
  return data.notificationRows.map((item, index) => {
    const analysisRow = data.analysisRows[index];
    return {
      stt: index + 1,
      masuco: parseInt(item.masuco.replace(/\D/g, ""), 10) || index + 1,
      sosuco: item.masuco,
      hoten: item.thongTinNguoiBenh,
      thoidiemXayRa: item.ngayGioXayRa,
      thoigianBaoCao: item.ngayBaoCao,
      diadiem: item.khoaPhongBaoCao,
      vitricuthe: item.viTri,
      tinhchat: item.loaiBaoCao,
      nhomSuCo: item.phanLoaiSuCo,
      nhomNguyenNhan: analysisRow?.nhomNguyenNhan ?? "—",
      mucdoTonThuong: analysisRow?.mucDoTonThuongNguoiBenh ?? "—",
      mota: item.moTa,
      giaiphapBandau: item.dieuTriBanDau,
      giaiphapTranhLaplai: item.deXuatBanDau,
      trangthai: item.trangThai,
    };
  });
}

// ============================================================
// Định dạng xuất theo đúng 19 trường Form Thông Báo Sự Cố
// ============================================================
export interface IncidentNotificationExportRow {
  stt: number;
  masuco: string;
  khoaPhongBaoCao: string;
  loaiBaoCao: string;
  phanLoaiSuCo: string;
  ngayGioXayRa: string;
  doiTuong: string;
  thongTinNguoiBenh: string;
  viTri: string;
  moTa: string;
  dieuTriBanDau: string;
  ghiNhanHSBA: string;
  thongBaoBacSy: string;
  thongBaoNguoiNha: string;
  thongBaoNguoiBenh: string;
  deXuatBanDau: string;
  nguoiChungKien: string;
  nguoiBaoCao: string;
  ngayBaoCao: string;
  trangThai: string;
}

// ============================================================
// Định dạng xuất theo đúng 20 trường Form Phân Tích Sự Cố
// ============================================================
export interface IncidentAnalysisExportRow {
  stt: number;
  masuco: string;
  khoaPhongBaoCao: string;
  loaiBaoCao: string;
  phanLoaiSuCo: string;
  ngayGioXayRa: string;
  doiTuong: string;
  thongTinNguoiBenh: string;
  viTri: string;
  moTa: string;
  nhomSuCo: string;
  moTaDieuTriYLenh: string;
  nhomNguyenNhan: string;
  hanhDongXuLy: string;
  deXuatKhuyenCao: string;
  ketQuaPhatHien: string;
  daThaoLuan: string;
  phuHopKhuyenCao: string;
  mucDoTonThuongNguoiBenh: string;
  mucDoAnhHuongToChuc: string;
  trangThaiPt: string;
}

export async function getComprehensiveIncidentExportData(
  params?: FilterParams,
): Promise<{
  notificationRows: IncidentNotificationExportRow[];
  analysisRows: IncidentAnalysisExportRow[];
}> {
  const list = await getIncidentList(params);
  if (!list || list.length === 0) {
    return { notificationRows: [], analysisRows: [] };
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
  const doiTuongMap = new Map(
    lookup.doiTuong.map((d) => [d.madoituongsc, d.doituongsc]),
  );
  const phaiMap = new Map([
    [0, "Nam"],
    [1, "Nữ"],
  ]);
  const tonThuongToChucMap = new Map(
    lookup.tonThuongToChuc?.map((t) => [
      String(t.matonthuong),
      t.tentonthuong,
    ]) ?? [],
  );
  const tonThuongNguoiBenhMap = new Map<string, string>();
  lookup.tonThuongNguoiBenh?.forEach((item) => {
    const capDo = item.capdotonthuong?.trim() ?? "";
    if (capDo) {
      tonThuongNguoiBenhMap.set(String(item.maphanloai), capDo);
      if (item.macapdotonthuong) {
        tonThuongNguoiBenhMap.set(item.macapdotonthuong.trim(), capDo);
      }
    }
  });

  const notificationRows: IncidentNotificationExportRow[] = [];
  const analysisRows: IncidentAnalysisExportRow[] = [];

  list.forEach((item, index) => {
    const pt = phanTichMap.get(item.masuco) as
      | Record<string, unknown>
      | undefined;

    const tenPhong = item.maphong ? (phongMap.get(item.maphong) ?? "") : "";
    const tenKkBaoCao = item.makkbaocao
      ? (phongMap.get(item.makkbaocao) ?? "")
      : "";
    const tenPhongNoi = item.maphongnoi
      ? (phongNoiMap.get(item.maphongnoi) ?? "")
      : "";

    // 1. Khoa phòng báo cáo
    const khoaPhongBaoCao = tenKkBaoCao || tenPhong || "—";

    // 2. Loại báo cáo (Tự nguyện / Bắt buộc)
    const loaiBaoCao = item.mahinhthuc
      ? (hinhThucMap.get(item.mahinhthuc) ??
        (item.mahinhthuc === 1 ? "Tự nguyện" : "Bắt buộc"))
      : "—";

    // 3. Phân loại sự cố
    const phanLoaiSuCo = item.phanloaibandau
      ? (phanLoaiMap.get(item.phanloaibandau) ?? "")
      : item.danhgiabandau
        ? (danhGiaMap.get(item.danhgiabandau) ?? "")
        : "—";

    // 4. Ngày giờ xảy ra
    const ngayGioXayRa = formatExportDateTime(item.ngaysuco);

    // 5. Đối tượng xảy ra sự cố
    const doiTuong = item.madoituongsc
      ? (doiTuongMap.get(item.madoituongsc) ?? "—")
      : "—";

    // 6. Thông tin người bệnh (Họ tên, ngày sinh, giới tính, số bệnh án, khoa/phòng)
    const hotenStr = item.hoten || "Không rõ họ tên";
    const ngaysinhStr = item.ngaysinh ? formatDate(item.ngaysinh) : "";
    const phaiStr =
      item.maphai != null
        ? (phaiMap.get(item.maphai) ?? (item.maphai === 1 ? "Nữ" : "Nam"))
        : "";
    const sobenhanStr = item.sobenhan ? `Số BA: ${item.sobenhan}` : "";
    const phongDieuTriStr = tenPhong ? `Khoa/Phòng: ${tenPhong}` : "";

    const thongTinNguoiBenhParts = [
      hotenStr,
      ngaysinhStr ? `Sinh: ${ngaysinhStr}` : "",
      phaiStr ? `Giới tính: ${phaiStr}` : "",
      sobenhanStr,
      phongDieuTriStr,
    ].filter(Boolean);
    const thongTinNguoiBenh = thongTinNguoiBenhParts.join(" | ");

    // 7. Vị trí xảy ra sự cố
    let viTri = "";
    if (tenPhong && tenPhongNoi) {
      viTri = `${tenPhong} - ${tenPhongNoi}`;
    } else {
      viTri = tenPhong || tenPhongNoi || "—";
    }
    if (item.vitricuthe) {
      viTri += ` (${item.vitricuthe})`;
    }

    // 8. Mô tả sự cố
    const moTa = item.mota || (pt?.mota as string) || "—";

    // Trạng thái tổng quát
    let trangThai = "Chưa phân tích";
    if (pt) {
      trangThai = pt.duyet === true ? "Đã duyệt" : "Đã phân tích (Chưa duyệt)";
    }

    // A. Thêm vào mảng Notification Rows (19 trường)
    notificationRows.push({
      stt: index + 1,
      masuco: item.sosuco ?? String(item.masuco),
      khoaPhongBaoCao,
      loaiBaoCao,
      phanLoaiSuCo,
      ngayGioXayRa,
      doiTuong,
      thongTinNguoiBenh,
      viTri,
      moTa,
      dieuTriBanDau: item.xulybandau || "—",
      ghiNhanHSBA:
        item.ghinhan === true ? "Có" : item.ghinhan === false ? "Không" : "—",
      thongBaoBacSy:
        item.thongbaobacsy === true
          ? "Có"
          : item.thongbaobacsy === false
            ? "Không"
            : "—",
      thongBaoNguoiNha:
        item.thongbaonguoinha === true
          ? "Có"
          : item.thongbaonguoinha === false
            ? "Không"
            : "—",
      thongBaoNguoiBenh:
        item.thongbaonguoibenh === true
          ? "Có"
          : item.thongbaonguoibenh === false
            ? "Không"
            : "—",
      deXuatBanDau: item.giaiphapdexuat || "—",
      nguoiChungKien:
        [item.chungkien1, item.chungkien2].filter(Boolean).join(", ") || "—",
      nguoiBaoCao:
        [
          item.hotennguoibaocao,
          item.dienthoainguoibaocao ? `SĐT: ${item.dienthoainguoibaocao}` : "",
          item.emailnguoibaocao ? `Email: ${item.emailnguoibaocao}` : "",
        ]
          .filter(Boolean)
          .join(" - ") || "—",
      ngayBaoCao: formatExportDateTime(item.ngay),
      trangThai,
    });

    // B. Thêm vào mảng Analysis Rows (20 trường)
    const nhomSuCo =
      (item.maloaiscyk ? loaiSuCoMap.get(item.maloaiscyk) : null) ||
      item.tensuco ||
      "—";

    const moTaDieuTriYLenh = (pt?.ylenh as string) || "—";
    const nhomNguyenNhan = formatCausesText(pt, lookup.causeSubItemsMap);
    const hanhDongXuLy = (pt?.khacphucsuco as string) || "—";
    const deXuatKhuyenCao =
      (pt?.dexuat as string) || item.giaiphaptranhlaplai || "—";
    const ketQuaPhatHien = (pt?.chuyengiadanhgia as string) || "—";

    // 16. Đã thảo luận đưa ra khuyến cáo (Dùng getAnalysisLabel)
    const daThaoLuan = getAnalysisLabel("cgthaoluan", pt?.cgthaoluan as string);

    // 17. Phù hợp với các khuyến cáo (Dùng getAnalysisLabel)
    const phuHopText = getAnalysisLabel("cgthaoluan", pt?.phuhop as string, "");
    const phuHopKhuyenCao =
      [
        phuHopText ? `Phù hợp: ${phuHopText}` : "",
        pt?.khuyencao ? `Khuyến cáo: ${pt.khuyencao}` : "",
      ]
        .filter(Boolean)
        .join("\n") || "—";

    const mucDoTonThuongNguoiBenh = formatInjuryText(
      item,
      pt,
      danhGiaMap,
      phanLoaiMap,
      tonThuongNguoiBenhMap,
    );

    // 18. Mức độ ảnh hưởng trên tổ chức (Lấy thuần túy từ DB bảng dmtonthuongtrentochuc_scyk)
    const ttToChucRaw = pt?.tttochuc ? String(pt.tttochuc).trim() : "";
    const mucDoAnhHuongToChuc = ttToChucRaw
      ? tonThuongToChucMap.get(ttToChucRaw) || ttToChucRaw
      : "—";

    let trangThaiPt = "Chưa phân tích";
    if (pt) {
      trangThaiPt = pt.duyet === true ? "Đã duyệt" : "Chưa duyệt";
    }

    analysisRows.push({
      stt: index + 1,
      masuco: item.sosuco ?? String(item.masuco),
      khoaPhongBaoCao,
      loaiBaoCao,
      phanLoaiSuCo,
      ngayGioXayRa,
      doiTuong,
      thongTinNguoiBenh,
      viTri,
      moTa,
      nhomSuCo,
      moTaDieuTriYLenh,
      nhomNguyenNhan,
      hanhDongXuLy,
      deXuatKhuyenCao,
      ketQuaPhatHien,
      daThaoLuan,
      phuHopKhuyenCao,
      mucDoTonThuongNguoiBenh,
      mucDoAnhHuongToChuc,
      trangThaiPt,
    });
  });

  return { notificationRows, analysisRows };
}
