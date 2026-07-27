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
