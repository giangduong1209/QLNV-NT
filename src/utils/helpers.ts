/**
 * Chuyển đổi giá trị sang string (null/undefined -> "")
 */
export const safeToString = (inputValue: unknown): string =>
  inputValue != null ? String(inputValue) : "";

/**
 * Parse chuỗi sang number (rỗng/invalid -> null)
 */
export const safeParseInt = (
  rawInput: string | null | undefined,
): number | null => (rawInput ? parseInt(rawInput, 10) : null);

/**
 * Trả về string đã trim hoặc null nếu rỗng
 */
export const toNullableString = (
  rawInput: string | null | undefined,
): string | null =>
  rawInput && rawInput.trim() !== "" ? rawInput.trim() : null;

/**
 * Format giá trị boolean/string option cho select ("true" | "false" | "")
 */
export function formatBooleanOption(
  optionValue: boolean | string | null | undefined,
): string {
  if (optionValue === true || optionValue === "true" || optionValue === "Có")
    return "true";
  if (
    optionValue === false ||
    optionValue === "false" ||
    optionValue === "Không"
  )
    return "false";
  return "";
}

/**
 * Parse chuỗi boolean option thành boolean | null
 */
export function parseBooleanOption(
  optionValue: string | null | undefined,
): boolean | null {
  if (optionValue === "true" || optionValue === "Có") return true;
  if (optionValue === "false" || optionValue === "Không") return false;
  return null;
}

/**
 * Kiểm tra người dùng có quyền Admin hay không (không phân biệt hoa/thường hay khoảng trắng)
 */
export function checkIsAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = String(role).trim().toLowerCase();
  return (
    normalized === "admin" ||
    normalized === "quantri" ||
    normalized === "quan_tri" ||
    normalized === "administrator" ||
    normalized === "qt" ||
    normalized === "1"
  );
}

/**
 * Sinh ngẫu nhiên Mã sự cố theo format SC + YYMMDD + 3 số ngẫu nhiên
 */
export function generateRandomIncidentCodeParts(targetDate: Date = new Date()): {
  sosuco: string;
  masuco: number;
} {
  const yearSuffix = targetDate.getFullYear().toString().slice(-2);
  const monthPadded = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dayPadded = String(targetDate.getDate()).padStart(2, "0");
  const formattedDatePrefix = `${yearSuffix}${monthPadded}${dayPadded}`;

  const randomSequenceSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const sosuco = `SC${formattedDatePrefix}${randomSequenceSuffix}`;
  const masuco = parseInt(`${formattedDatePrefix}${randomSequenceSuffix}`, 10);

  return { sosuco, masuco };
}

