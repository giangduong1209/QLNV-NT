import { z } from "zod/v4";
export type { ActionResult } from "./action-result";

// ============================================================
// Auth & User Types
// ============================================================
export type UserRole = "admin" | "manager" | "user";

export interface SessionPayload {
  userId: string;
  role: UserRole;
  expiresAt: Date;
  [key: string]: unknown;
}

export const LoginFormSchema = z.object({
  username: z.string().min(1, { error: "Vui lòng nhập tên đăng nhập" }).trim(),
  password: z.string().min(1, { error: "Vui lòng nhập mật khẩu" }).trim(),
});

export type LoginFormState =
  | {
      errors?: {
        username?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

// ============================================================
// Incident Types & Enums
// ============================================================
export type AnalysisStatus = "CHUA_PHAN_TICH" | "DA_PHAN_TICH" | "TAT_CA";
export type ReportType = "TU_NGUYEN" | "BAT_BUOC";

export const IncidentCodeSchema = z
  .string()
  .regex(/^SC\d{8}$/, { error: "Mã sự cố không hợp lệ (VD: SC26000001)" });

export interface SuCoListItem {
  masuco: number;
  sosuco: string | null;
  hoten: string | null;
  ngaysuco: Date | null;
  maphong: number | null;
  daPhanTich?: boolean;
}

// ============================================================
// Common UI & Form Types
// ============================================================
export interface SelectOption {
  value: string;
  label: string;
}

export type SidebarFilterFormValues = {
  trangThai: AnalysisStatus;
  tuNgayDate: string;
  tuNgayTime: string;
  denNgayDate: string;
  denNgayTime: string;
  maphong: string;
};

// ============================================================
// Lookup Data Types
// ============================================================
export interface LoaiSuCoItem {
  maloaiscyk: number;
  tenloaiscyk: string | null;
}

export interface TenSuCoItem {
  idscyk: number;
  maloaiscyk?: number | null;
  tensucoyk: string | null;
}

export interface HinhThucItem {
  mahinhthuc: number;
  tenhinhthuc: string | null;
}

export interface PhaiItem {
  maphai: number;
  phai: string | null;
}

export interface DoiTuongItem {
  madoituongsc: number;
  doituongsc: string | null;
}

export interface PhongItem {
  maphong: number;
  tenphong: string | null;
  loai?: string | null;
  sapxep?: number | null;
  ksd?: boolean | null;
}

export interface PhongNoiItem {
  maphongnoi: number;
  maphong: number;
  tenphongnoi: string | null;
  sapxep?: number | null;
  ksd?: boolean | null;
}

export interface PhanLoaiBanDauItem {
  maphanloai: number;
  tenphanloai: string | null;
}

export interface DanhGiaBanDauItem {
  madanhgia: number;
  mamucdo: string | null;
  tendanhgia: string | null;
}

export interface CauseSubItem {
  id: number;
  name: string;
}

export interface LookupData {
  loaiSuCo: LoaiSuCoItem[];
  tenSuCo: TenSuCoItem[];
  hinhThuc: HinhThucItem[];
  phai: PhaiItem[];
  doiTuong: DoiTuongItem[];
  phong: PhongItem[];
  phongNoi: PhongNoiItem[];
  phanLoaiBanDau: PhanLoaiBanDauItem[];
  danhGiaBanDau: DanhGiaBanDauItem[];
  causeMaxOptionsMap?: Record<string, number>;
  causeSubItemsMap?: Record<string, CauseSubItem[]>;
}

export interface FilterParams {
  trangThai?: AnalysisStatus;
  tuNgay?: string; // "YYYY-MM-DD"
  tuNgayTime?: string;
  denNgay?: string; // "YYYY-MM-DD"
  denNgayTime?: string;
  maphong?: number;
}

export interface SuCoDetail {
  sucoykhoa: {
    masuco: number;
    sosuco: string | null;
    ngay: Date | null;
    mahinhthuc: number | null;
    makcb: string | null;
    hoten: string | null;
    maphong: number | null;
    ngaysinh: Date | null;
    sobenhan: string | null;
    maphai: number | null;
    madoituongsc: number | null;
    tensuco: string | null;
    ngaysuco: Date | null;
    maphongnoi: number | null;
    vitricuthe: string | null;
    mota: string | null;
    giaiphapdexuat: string | null;
    xulybandau: string | null;
    thongbaobacsy: boolean | string | null;
    thongbaonguoinha: boolean | string | null;
    ghinhan: boolean | string | null;
    thongbaonguoibenh: boolean | string | null;
    phanloaibandau: string | number | null;
    danhgiabandau: string | number | null;
    manguoibaocao: number | null;
    hotennguoibaocao: string | null;
    dienthoainguoibaocao: string | null;
    emailnguoibaocao: string | null;
    chungkien1: string | null;
    chungkien2: string | null;
    nguyennhangoc: string | null;
    giaiphaptranhlaplai: string | null;
    maloaiscyk: number | null;
  };

  phantichsuco: {
    masuco: number;
    ngay: Date | null;
    mota: string | null;
    kythuat: string | null;
    nhiemkhuan: string | null;
    thuoc: string | null;
    mau: string | null;
    thietbiyte: string | null;
    hanhvi: string | null;
    tainan: string | null;
    hatang: string | null;
    nguonluc: string | null;
    tailieu: string | null;
    ptkhac: string | null;
    ylenh: string | null;
    nnnnhanvien: string | null;
    nnnnguoibenh: string | null;
    nnnmoitruong: string | null;
    nnntochuc: string | null;
    nnnbenngoai: string | null;
    nnnkhac: string | null;
    khacphucsuco: string | null;
    dexuat: string | null;
    chuyengiadanhgia: string | null;
    cgthaoluan: string | null;
    phuhop: string | null;
    khuyencao: string | null;
    tt_NC0: boolean | null;
    tt_NC1: string | null;
    tt_NC2: string | null;
    tt_NC3: string | null;
    tttochuc: string | null;
    malanhdao: number | null;
    duyet: boolean | null;
  } | null;
}

// Map Khoa Phong
export const KHOA_PHONG_MAP: Record<number, string> = {
  1: "Khoa Cấp cứu",
  2: "Khoa Nội tổng hợp",
  3: "Khoa Ngoại tổng hợp",
  4: "Khoa Sản",
  5: "Khoa Nhi",
  6: "Khoa Tim mạch",
  7: "Khoa Hô hấp",
  8: "Khoa Thận - Tiết niệu",
  9: "Khoa Ung bướu",
  10: "Khoa Xét nghiệm",
  11: "Khoa Chẩn đoán hình ảnh",
  12: "Khoa Dược",
  13: "Phòng Kế hoạch tổng hợp",
  14: "Phòng Điều dưỡng",
};

// Form values cho Incident Form
export type IncidentFormValues = {
  sosuco: string;
  ngayLapDate: string;
  ngayLapTime: string;
  mahinhthuc: string;
  maloaiscyk: string;
  makcb: string;
  hoten: string;
  maphong: string;
  ngaysinh: string;
  sobenhan: string;
  maphai: string;
  madoituongsc: string;
  tensuco: string;
  ngaySuCoDate: string;
  ngaySuCoTime: string;
  maphongnoi: string;
  vitricuthe: string;
  mota: string;
  giaiphapdexuat: string;
  xulybandau: string;
  nguyennhangoc: string;
  giaiphaptranhlaplai: string;
  thongbaobacsy: string;
  thongbaonguoinha: string;
  ghinhan: string;
  thongbaonguoibenh: string;
  phanloaibandau: string;
  danhgiabandau: string;
  hotennguoibaocao: string;
  dienthoainguoibaocao: string;
  emailnguoibaocao: string;
  chungkien1: string;
  chungkien2: string;
};

// ============================================================
// Payload type cho lưu sự cố & Zod Schemas
// ============================================================
export const IncidentSavePayloadSchema = z.object({
  ngay: z.coerce.date().nullable().optional(),
  mahinhthuc: z.number().nullable().optional(),
  makcb: z.string().nullable().optional(),
  hoten: z.string().nullable().optional(),
  maphong: z.number().nullable().optional(),
  ngaysinh: z.coerce.date().nullable().optional(),
  sobenhan: z.string().nullable().optional(),
  maphai: z.number().nullable().optional(),
  madoituongsc: z.number().nullable().optional(),
  tensuco: z.string().nullable().optional(),
  ngaysuco: z.coerce.date().nullable().optional(),
  maphongnoi: z.number().nullable().optional(),
  vitricuthe: z.string().nullable().optional(),
  mota: z.string().nullable().optional(),
  giaiphapdexuat: z.string().nullable().optional(),
  xulybandau: z.string().nullable().optional(),
  nguyennhangoc: z.string().nullable().optional(),
  giaiphaptranhlaplai: z.string().nullable().optional(),
  thongbaobacsy: z.boolean().nullable().optional(),
  thongbaonguoinha: z.boolean().nullable().optional(),
  ghinhan: z.boolean().nullable().optional(),
  thongbaonguoibenh: z.boolean().nullable().optional(),
  phanloaibandau: z.number().nullable().optional(),
  danhgiabandau: z.number().nullable().optional(),
  manguoibaocao: z.number().nullable().optional(),
  hotennguoibaocao: z.string().nullable().optional(),
  dienthoainguoibaocao: z.string().nullable().optional(),
  emailnguoibaocao: z.string().nullable().optional(),
  chungkien1: z.string().nullable().optional(),
  chungkien2: z.string().nullable().optional(),
  maloaiscyk: z.number().nullable().optional(),
});

export type IncidentSavePayload = z.infer<typeof IncidentSavePayloadSchema>;

export const AnalysisSavePayloadSchema = z.object({
  ngay: z.coerce.date().nullable().optional(),
  mota: z.string().nullable().optional(),
  kythuat: z.string().nullable().optional(),
  nhiemkhuan: z.string().nullable().optional(),
  thuoc: z.string().nullable().optional(),
  mau: z.string().nullable().optional(),
  thietbiyte: z.string().nullable().optional(),
  hanhvi: z.string().nullable().optional(),
  tainan: z.string().nullable().optional(),
  hatang: z.string().nullable().optional(),
  nguonluc: z.string().nullable().optional(),
  tailieu: z.string().nullable().optional(),
  ptkhac: z.string().nullable().optional(),
  ylenh: z.string().nullable().optional(),
  nnnnhanvien: z.string().nullable().optional(),
  nnnnguoibenh: z.string().nullable().optional(),
  nnnmoitruong: z.string().nullable().optional(),
  nnntochuc: z.string().nullable().optional(),
  nnnbenngoai: z.string().nullable().optional(),
  nnnkhac: z.string().nullable().optional(),
  khacphucsuco: z.string().nullable().optional(),
  dexuat: z.string().nullable().optional(),
  chuyengiadanhgia: z.string().nullable().optional(),
  cgthaoluan: z.string().nullable().optional(),
  phuhop: z.string().nullable().optional(),
  khuyencao: z.string().nullable().optional(),
  tt_NC0: z.boolean().nullable().optional(),
  tt_NC1: z.string().nullable().optional(),
  tt_NC2: z.string().nullable().optional(),
  tt_NC3: z.string().nullable().optional(),
  tttochuc: z.string().nullable().optional(),
  malanhdao: z.number().nullable().optional(),
  duyet: z.boolean().nullable().optional(),
});

export type AnalysisSavePayload = z.infer<typeof AnalysisSavePayloadSchema>;

// ─── Kiểu form ───────────────────────────────────────────────────────────────

export type ConfirmForm = {
  // Thông tin sự cố (từ dangky_sucoykhoa)
  masuco: string;
  sosuco: string;
  makcb: string;
  hoten: string;
  maphong: string;
  vitricuthe: string;
  ngaySuCoDate: string;
  ngaySuCoTime: string;
  tensuco: string;

  // Phân tích (từ dangky_phantichsuco)
  pt_ngayDate: string;
  pt_ngayTime: string;
  pt_mota: string;
  // Nguyên nhân cột trái (lưu giá trị select dropdown)
  kythuat: string;
  nhiemkhuan: string;
  thuoc: string;
  mau: string;
  thietbiyte: string;
  hanhvi: string;
  tainan: string;
  hatang: string;
  nguonluc: string;
  tailieu: string;
  ptkhac: string;
  // Nguyên nhân cột phải
  ylenh: string;
  nnnnhanvien: string;
  nnnnguoibenh: string;
  nnnmoitruong: string;
  nnntochuc: string;
  nnnbenngoai: string;
  nnnkhac: string;
  // Kết quả phân tích
  khacphucsuco: string;
  dexuat: string;
  chuyengiadanhgia: string;
  cgthaoluan: string;
  phuhop: string;
  khuyencao: string;
  tt_NC0: boolean;
  tt_NC1: string;
  tt_NC2: string;
  tt_NC3: string;
  tttochuc: string;
  duyet: boolean;
};
