/**
 * Chuyển đổi an toàn giá trị sang string (null/undefined -> "")
 */
export const safeToString = (val: unknown): string =>
  val != null ? String(val) : "";

/**
 * Parse an toàn chuỗi sang number (rỗng/invalid -> null)
 */
export const safeParseInt = (val: string | null | undefined): number | null =>
  val ? parseInt(val, 10) : null;

/**
 * Trả về string đã trim hoặc null nếu rỗng
 */
export const toNullableString = (
  val: string | null | undefined,
): string | null => (val && val.trim() !== "" ? val.trim() : null);

/**
 * Format giá trị boolean/string option cho select ("true" | "false" | "")
 */
export function formatBooleanOption(
  val: boolean | string | null | undefined,
): string {
  if (val === true || val === "true" || val === "Có") return "true";
  if (val === false || val === "false" || val === "Không") return "false";
  return "";
}

/**
 * Parse chuỗi boolean option thành boolean | null
 */
export function parseBooleanOption(
  val: string | null | undefined,
): boolean | null {
  if (val === "true" || val === "Có") return true;
  if (val === "false" || val === "Không") return false;
  return null;
}

/**
 * Sinh ngẫu nhiên Mã sự cố theo format SC + YYMMDD + 3 số ngẫu nhiên
 */
export function generateRandomIncidentCodeParts(date: Date = new Date()): {
  sosuco: string;
  masuco: number;
} {
  const yy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const datePrefix = `${yy}${mm}${dd}`;
  const random3Digits = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const sosuco = `SC${datePrefix}${random3Digits}`;
  const masuco = parseInt(`${datePrefix}${random3Digits}`, 10);

  return { sosuco, masuco };
}

