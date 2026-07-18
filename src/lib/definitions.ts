import { z } from "zod/v4";

// ============================================================
// User Roles
// ============================================================
export type UserRole = "admin" | "manager" | "user";

// ============================================================
// Session Payload (JWT)
// ============================================================
export interface SessionPayload {
  userId: string;
  role: UserRole;
  expiresAt: Date;
  [key: string]: unknown;
}

// ============================================================
// Login Form Schema
// ============================================================
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
// Incident Form Schemas (will expand in Phase 5)
// ============================================================
export const IncidentCodeSchema = z
  .string()
  .regex(/^SC\d{8}$/, { error: "Mã sự cố không hợp lệ (VD: SC26000001)" });

export type AnalysisStatus = "CHUA_PHAN_TICH" | "DA_PHAN_TICH" | "TAT_CA";
export type ReportType = "TU_NGUYEN" | "BAT_BUOC";

// ============================================================
// Khoa/Phòng mapping (maphong Int → tên hiển thị)
// ============================================================
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

// ============================================================
// Incident List Item (dùng trong Sidebar DataTable)
// ============================================================
export type SuCoListItem = {
  masuco: number;
  sosuco: string | null;
  hoten: string | null;
  ngaysuco: Date | null;
  maphong: number | null;
  daPhanTich: boolean; // computed: có bản ghi phantichsuco với duyet=true
};

// ============================================================
// Filter Params (Sidebar → Server Action)
// ============================================================
export type FilterParams = {
  trangThai: AnalysisStatus;
  tuNgay: string; // "YYYY-MM-DD"
  tuNgayTime: string;
  denNgay: string; // "YYYY-MM-DD"
  denNgayTime: string;
  maphong?: number;
};

// ============================================================
// Sự cố Detail (click row → load form)
// ============================================================
export type SuCoDetail = {
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
    tensuco: string | null;
    ngaysuco: Date | null;
    maphongnoi: number | null;
    vitricuthe: string | null;
    mota: string | null;
    giaiphapdexuat: string | null;
    xulybandau: string | null;
    thongbaobacsy: string | null;
    thongbaonguoinha: string | null;
    ghinhan: string | null;
    thongbaonguoibenh: string | null;
    phanloaibandau: string | null;
    danhgiabandau: string | null;
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
  } | null; // null nếu chưa phân tích
};
