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
  username: z
    .string()
    .min(1, { error: "Vui lòng nhập tên đăng nhập" })
    .trim(),
  password: z
    .string()
    .min(1, { error: "Vui lòng nhập mật khẩu" })
    .trim(),
});

export type LoginFormState = {
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

export type AnalysisStatus = "CHUA_PHAN_TICH" | "DA_PHAN_TICH";
export type ReportType = "TU_NGUYEN" | "BAT_BUOC";
