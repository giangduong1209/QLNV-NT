import type { SuCoDetail, ConfirmForm, LookupData } from "@/types";
import { toDateStr, toTimeStr } from "@/utils";
import type { CauseItem } from "./confirm-incidents.constants";

export interface ResolvedCauseItem {
  causeKey: string;
  causeLabel: string;
  maxOptionsCount: number;
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
 * Tính toán danh mục nguyên nhân động từ LookupData (CSDL), fallback về defaultMaxOptions nếu DB rỗng
 */
export function buildCauseItemsFromLookup(
  baseCauseItems: CauseItem[],
  lookupData?: LookupData,
): ResolvedCauseItem[] {
  return baseCauseItems.map((causeItem) => {
    const databaseCauseCount = lookupData?.causeMaxOptionsMap?.[causeItem.causeKey];
    const maxOptionsCount =
      databaseCauseCount && databaseCauseCount > 0
        ? databaseCauseCount
        : causeItem.defaultMaxOptions;

    return {
      causeKey: causeItem.causeKey,
      causeLabel: causeItem.causeLabel,
      maxOptionsCount,
    };
  });
}
