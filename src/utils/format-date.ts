/**
 * Format Date hoặc chuỗi ngày sang định dạng dd/mm/yyyy (VD: 18/08/2026)
 */
export function formatDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";
  const d = typeof date === "string" ? toDate(date) : new Date(date);
  if (!d || isNaN(d.getTime())) return typeof date === "string" ? date : "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Lấy chuỗi giờ:phút (HH:mm) từ Date hoặc chuỗi ngày
 */
export function toTimeStr(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

/**
 * Chuyển chuỗi ngày (dd/mm/yyyy, dd-mm-yyyy, ddmmyyyy, yyyy-mm-dd, dd/mm/yy) thành Date
 * @param dateStr Chuỗi ngày cần chuyển đổi
 * @param timeStr Chuỗi giờ:phút (HH:mm)
 * @param isEndOfMinute Nếu true, đặt giây là 59 và mili-giây là 999 (dùng cho endDate)
 */
export function toDate(
  dateStr?: string | null,
  timeStr?: string | null,
  isEndOfMinute: boolean = false,
): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  let d = 0;
  let m = 0;
  let y = 0;

  // 1. Phân tách theo dấu gạch chéo (/), gạch ngang (-) hoặc khoảng trắng
  if (/[/\- ]/.test(trimmed)) {
    const parts = trimmed.split(/[/\- ]/).map((p) => parseInt(p.trim(), 10));
    if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
      if (parts[0] > 31) {
        // Định dạng YYYY/MM/DD hoặc YYYY-MM-DD
        [y, m, d] = parts;
      } else {
        // Định dạng DD/MM/YYYY hoặc DD-MM-YYYY
        [d, m, y] = parts;
        if (y < 100) {
          y = y < 70 ? 2000 + y : 1900 + y;
        }
      }
    } else {
      return null;
    }
  } else if (/^\d{8}$/.test(trimmed)) {
    // Định dạng 8 chữ số liên tiếp: DDMMYYYY
    d = parseInt(trimmed.slice(0, 2), 10);
    m = parseInt(trimmed.slice(2, 4), 10);
    y = parseInt(trimmed.slice(4, 8), 10);
  } else if (/^\d{6}$/.test(trimmed)) {
    // Định dạng 6 chữ số liên tiếp: DDMMYY
    d = parseInt(trimmed.slice(0, 2), 10);
    m = parseInt(trimmed.slice(2, 4), 10);
    const yy = parseInt(trimmed.slice(4, 6), 10);
    y = yy < 70 ? 2000 + yy : 1900 + yy;
  } else {
    // Thử parse qua Date constructor tiêu chuẩn
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      y = parsed.getFullYear();
      m = parsed.getMonth() + 1;
      d = parsed.getDate();
    } else {
      return null;
    }
  }

  // Kiểm tra tính hợp lệ của ngày, tháng, năm
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) {
    return null;
  }

  // Xử lý giờ, phút, giây, mili-giây
  const [hh, mm] = timeStr ? timeStr.trim().split(":").map(Number) : [0, 0];
  const validHh = isNaN(hh) ? 0 : hh;
  const validMm = isNaN(mm) ? 0 : mm;
  const ss = isEndOfMinute ? 59 : 0;
  const ms = isEndOfMinute ? 999 : 0;

  const date = new Date(y, m - 1, d, validHh, validMm, ss, ms);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Lấy ngày hôm nay định dạng dd/mm/yyyy (VD: 18/08/2026)
 */
export function todayStr(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}
