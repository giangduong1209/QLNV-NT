import type {
  SuCoDetail,
  ConfirmForm,
  LookupData,
  CauseSubItem,
  SelectOption,
} from "@/types";
import { toDateStr, toTimeStr } from "@/utils";
import type { CauseItem } from "./incidents.constants";

export interface ResolvedCauseItem {
  causeKey: string;
  causeLabel: string;
  maxOptionsCount: number;
  subItems: CauseSubItem[];
}

export function buildDefaultValues(
  suco: SuCoDetail["sucoykhoa"] | undefined,
  phanTich: SuCoDetail["phantichsuco"] | null | undefined,
): ConfirmForm {
  return {
    // Thông tin sự cố
    masuco: suco?.masuco?.toString() ?? "",
    sosuco: suco?.sosuco ?? "",
    makcb: suco?.makcb ?? "",
    hoten: suco?.hoten ?? "",
    maphong: suco?.maphong?.toString() ?? "",
    vitricuthe: suco?.vitricuthe ?? "",
    ngaySuCoDate: toDateStr(suco?.ngaysuco),
    ngaySuCoTime: toTimeStr(suco?.ngaysuco),
    tensuco: suco?.tensuco ?? "",

    // Phân tích
    pt_ngayDate: toDateStr(phanTich?.ngay),
    pt_ngayTime: toTimeStr(phanTich?.ngay),
    pt_mota: phanTich?.mota ?? "",
    kythuat: phanTich?.kythuat ?? "",
    nhiemkhuan: phanTich?.nhiemkhuan ?? "",
    thuoc: phanTich?.thuoc ?? "",
    mau: phanTich?.mau ?? "",
    thietbiyte: phanTich?.thietbiyte ?? "",
    hanhvi: phanTich?.hanhvi ?? "",
    tainan: phanTich?.tainan ?? "",
    hatang: phanTich?.hatang ?? "",
    nguonluc: phanTich?.nguonluc ?? "",
    tailieu: phanTich?.tailieu ?? "",
    ptkhac: phanTich?.ptkhac ?? "",
    ylenh: phanTich?.ylenh ?? "",
    nnnnhanvien: phanTich?.nnnnhanvien ?? "",
    nnnnguoibenh: phanTich?.nnnnguoibenh ?? "",
    nnnmoitruong: phanTich?.nnnmoitruong ?? "",
    nnntochuc: phanTich?.nnntochuc ?? "",
    nnnbenngoai: phanTich?.nnnbenngoai ?? "",
    nnnkhac: phanTich?.nnnkhac ?? "",
    khacphucsuco: phanTich?.khacphucsuco ?? "",
    dexuat: phanTich?.dexuat ?? "",
    chuyengiadanhgia: phanTich?.chuyengiadanhgia ?? "",
    cgthaoluan: phanTich?.cgthaoluan ?? "",
    phuhop: phanTich?.phuhop ?? "",
    khuyencao: phanTich?.khuyencao ?? "",
    tt_NC0: phanTich?.tt_NC0 ?? false,
    tt_NC1: phanTich?.tt_NC1 ?? "",
    tt_NC2: phanTich?.tt_NC2 ?? "",
    tt_NC3: phanTich?.tt_NC3 ?? "",
    tttochuc: phanTich?.tttochuc ?? "",
    duyet: phanTich?.duyet ?? false,
  };
}

/**
 * Tính toán danh mục nguyên nhân động từ LookupData (CSDL), bao gồm danh sách tiểu mục subItems
 */
export function buildCauseItemsFromLookup(
  baseCauseItems: CauseItem[],
  lookupData?: LookupData,
): ResolvedCauseItem[] {
  return baseCauseItems.map((causeItem) => {
    const dbSubItems = lookupData?.causeSubItemsMap?.[causeItem.causeKey];
    let subItems: CauseSubItem[] = [];

    if (dbSubItems && dbSubItems.length > 0) {
      subItems = dbSubItems;
    } else {
      // Fallback nếu DB chưa có bản ghi
      subItems = Array.from(
        { length: causeItem.defaultMaxOptions },
        (_, i) => ({
          id: i + 1,
          name: `Tùy chọn ${i + 1}`,
        }),
      );
    }

    return {
      causeKey: causeItem.causeKey,
      causeLabel: causeItem.causeLabel,
      maxOptionsCount: subItems.length,
      subItems,
    };
  });
}

/**
 * Tách chuỗi ID phân cách bởi dấu phẩy thành mảng string ID
 */
export function parseCommaSeparatedIds(valueString: string): string[] {
  if (!valueString) return [];
  return valueString
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Ghép mảng ID thành chuỗi phân cách bởi dấu phẩy
 */
export function formatCommaSeparatedIds(idsArray: string[]): string {
  return idsArray.filter(Boolean).join(",");
}

export interface TonThuongLabelInput {
  maphanloai: number;
  macapdotonthuong?: string | null;
  capdotonthuong?: string | null;
  motasucoykhoa?: string | null;
}

/**
 * Định dạng nhãn hiển thị cho tùy chọn tổn thương người bệnh: ${Mã cấp độ} - ${Mô tả chi tiết}
 */
function formatTonThuongLabel(item: TonThuongLabelInput): string {
  const code = item.macapdotonthuong ? item.macapdotonthuong.trim() : "";
  const desc = item.motasucoykhoa
    ? item.motasucoykhoa.trim()
    : item.capdotonthuong
      ? item.capdotonthuong.trim()
      : "";
  if (code && desc) {
    return `${code} - ${desc}`;
  }
  return code || desc || `Mục ${item.maphanloai}`;
}

/**
 * Xây dựng danh sách tùy chọn tổn thương nhẹ (NC1) - Mã B, C, D
 */
export function buildTonThuongNC1Options(
  lookupData: LookupData,
): SelectOption[] {
  if (!lookupData.tonThuongNguoiBenh?.length) return [];
  return lookupData.tonThuongNguoiBenh
    .filter(
      (item) =>
        item.capdotonthuong?.includes("NC1") ||
        ["B", "C", "D"].includes(item.macapdotonthuong?.trim() ?? "") ||
        [1, 2, 3].includes(item.maphanloai),
    )
    .map((item) => ({
      value: String(item.maphanloai),
      label: formatTonThuongLabel(item),
    }));
}

/**
 * Xây dựng danh sách tùy chọn tổn thương trung bình (NC2) - Mã E, F
 */
export function buildTonThuongNC2Options(
  lookupData: LookupData,
): SelectOption[] {
  if (!lookupData.tonThuongNguoiBenh?.length) return [];
  return lookupData.tonThuongNguoiBenh
    .filter(
      (item) =>
        item.capdotonthuong?.includes("NC2") ||
        ["E", "F"].includes(item.macapdotonthuong?.trim() ?? "") ||
        [4, 5].includes(item.maphanloai),
    )
    .map((item) => ({
      value: String(item.maphanloai),
      label: formatTonThuongLabel(item),
    }));
}

/**
 * Xây dựng danh sách tùy chọn tổn thương nặng (NC3) - Mã G, H, I
 */
export function buildTonThuongNC3Options(
  lookupData: LookupData,
): SelectOption[] {
  if (!lookupData.tonThuongNguoiBenh?.length) return [];
  return lookupData.tonThuongNguoiBenh
    .filter(
      (item) =>
        item.capdotonthuong?.includes("NC3") ||
        ["G", "H", "I"].includes(item.macapdotonthuong?.trim() ?? "") ||
        [6, 7, 8].includes(item.maphanloai),
    )
    .map((item) => ({
      value: String(item.maphanloai),
      label: formatTonThuongLabel(item),
    }));
}

/**
 * Xây dựng danh sách tùy chọn combobox cho tổn thương trên tổ chức
 */
export function buildTonThuongToChucOptions(
  lookupData: LookupData,
): SelectOption[] {
  if (!lookupData.tonThuongToChuc?.length) return [];
  return lookupData.tonThuongToChuc.map((item) => ({
    value: String(item.matonthuong),
    label: item.tentonthuong ?? `Mục ${item.matonthuong}`,
  }));
}
