/**
 * Chuyển đổi an toàn giá trị sang string (null/undefined -> "")
 */
export const safeToString = (inputValue: unknown): string =>
  inputValue != null ? String(inputValue) : "";

/**
 * Parse an toàn chuỗi sang number (rỗng/invalid -> null)
 */
export const safeParseInt = (
  rawInput: string | null | undefined,
): number | null => (rawInput ? parseInt(rawInput, 10) : null);

/**
 * Trả về string đã trim hoặc null nếu rỗng
 */
export const toNullableString = (
  rawInput: string | null | undefined,
): string | null => (rawInput && rawInput.trim() !== "" ? rawInput.trim() : null);

/**
 * Format giá trị boolean/string option cho select ("true" | "false" | "")
 */
export function formatBooleanOption(
  optionValue: boolean | string | null | undefined,
): string {
  if (optionValue === true || optionValue === "true" || optionValue === "Có")
    return "true";
  if (optionValue === false || optionValue === "false" || optionValue === "Không")
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


