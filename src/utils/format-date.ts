export function formatDate(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function toDateStr(d: Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function toTimeStr(d: Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export function toDate(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.trim().split("-").map(Number);
  if (parts.length !== 3 || parts.some((p) => isNaN(p))) return null;
  const [y, m, d] = parts;
  const [hh, mm] = timeStr ? timeStr.trim().split(":").map(Number) : [0, 0];
  const validHh = isNaN(hh) ? 0 : hh;
  const validMm = isNaN(mm) ? 0 : mm;
  const date = new Date(y, m - 1, d, validHh, validMm);
  return isNaN(date.getTime()) ? null : date;
}

export function todayStr(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

