import type { SuCoDetail, IncidentFormValues, IncidentSavePayload } from "@/types";
import type { LookupData } from "@/actions/lookup";
import { toDateStr, toTimeStr, toDate } from "@/utils/format-date";
import { KHOA_PHONG_OPTIONS } from "./incident-form.constants";

export function buildDefaultValues(
  initialData: SuCoDetail | null,
  lookupData: LookupData,
  nowDate: string,
  nowTime: string,
): IncidentFormValues {
  const suco = initialData?.sucoykhoa;
  let initialTenSuCo = suco?.tensuco ?? "";
  let initialLoaiSuCo = suco?.maloaiscyk?.toString() ?? "";

  if (initialTenSuCo && lookupData?.tenSuCo?.length) {
    const matched = lookupData.tenSuCo.find(
      (t) =>
        t.tensucoyk === initialTenSuCo ||
        t.idscyk.toString() === initialTenSuCo,
    );
    if (matched) {
      if (matched.tensucoyk) {
        initialTenSuCo = matched.tensucoyk;
      }
      if (!initialLoaiSuCo && matched.maloaiscyk != null) {
        initialLoaiSuCo = matched.maloaiscyk.toString();
      }
    }
  }

  return {
    sosuco: suco?.sosuco ?? "",
    ngayLapDate: suco?.ngay ? toDateStr(suco.ngay) : nowDate,
    ngayLapTime: suco?.ngay ? toTimeStr(suco.ngay) : nowTime,
    mahinhthuc: suco?.mahinhthuc?.toString() ?? "1",
    maloaiscyk: initialLoaiSuCo,
    makcb: suco?.makcb ?? "",
    hoten: suco?.hoten ?? "",
    maphong: suco?.maphong?.toString() ?? "",
    ngaysinh: suco?.ngaysinh ? toDateStr(suco.ngaysinh) : "",
    sobenhan: suco?.sobenhan ?? "",
    maphai: suco?.maphai?.toString() ?? "",
    madoituongsc: suco?.madoituongsc?.toString() ?? "",
    tensuco: initialTenSuCo,
    ngaySuCoDate: suco?.ngaysuco ? toDateStr(suco.ngaysuco) : nowDate,
    ngaySuCoTime: suco?.ngaysuco ? toTimeStr(suco.ngaysuco) : nowTime,
    maphongnoi: suco?.maphongnoi?.toString() ?? "",
    vitricuthe: suco?.vitricuthe ?? "",
    mota: suco?.mota ?? "",
    giaiphapdexuat: suco?.giaiphapdexuat ?? "",
    xulybandau: suco?.xulybandau ?? "",
    nguyennhangoc: suco?.nguyennhangoc ?? "",
    giaiphaptranhlaplai: suco?.giaiphaptranhlaplai ?? "",
    thongbaobacsy: formatBooleanOption(suco?.thongbaobacsy),
    thongbaonguoinha: formatBooleanOption(suco?.thongbaonguoinha),
    ghinhan: formatBooleanOption(suco?.ghinhan),
    thongbaonguoibenh: formatBooleanOption(suco?.thongbaonguoibenh),
    phanloaibandau: suco?.phanloaibandau ?? "",
    danhgiabandau: suco?.danhgiabandau ?? "",
    hotennguoibaocao: suco?.hotennguoibaocao ?? "",
    dienthoainguoibaocao: suco?.dienthoainguoibaocao ?? "",
    emailnguoibaocao: suco?.emailnguoibaocao ?? "",
    chungkien1: suco?.chungkien1 ?? "",
    chungkien2: suco?.chungkien2 ?? "",
  };
}

export function buildPhongOptions(lookupData: LookupData) {
  const optionsMap = new Map<string, string>();
  optionsMap.set("", "");

  if (lookupData.phong?.length) {
    lookupData.phong.forEach((p) => {
      const khoaItem = lookupData.khoa?.find((k) => k.makhoa === p.makhoa);
      const label = khoaItem?.tenkhoa
        ? `${p.tenphong} (${khoaItem.tenkhoa})`
        : (p.tenphong ?? `Phòng ${p.maphong}`);
      optionsMap.set(p.maphong.toString(), label);
    });
  }

  if (lookupData.khoa?.length) {
    lookupData.khoa.forEach((k) => {
      const key = k.makhoa.toString();
      if (!optionsMap.has(key)) {
        optionsMap.set(key, k.tenkhoa ?? `Khoa ${k.makhoa}`);
      }
    });
  }

  KHOA_PHONG_OPTIONS.forEach((item) => {
    if (item.value && !optionsMap.has(item.value)) {
      optionsMap.set(item.value, item.label);
    }
  });

  return Array.from(optionsMap.entries()).map(([value, label]) => ({
    value,
    label,
  }));
}

export function buildTenSuCoList(
  lookupData: LookupData,
  selectedLoaiSuCo?: string,
  currentTenSuCo?: string,
) {
  const filtered = selectedLoaiSuCo
    ? lookupData.tenSuCo.filter(
        (item) => item.maloaiscyk?.toString() === selectedLoaiSuCo,
      )
    : lookupData.tenSuCo;

  const result = [...filtered];
  if (currentTenSuCo) {
    const exists = result.some(
      (t) =>
        t.tensucoyk === currentTenSuCo ||
        t.idscyk.toString() === currentTenSuCo,
    );
    if (!exists) {
      const matchInLookup = lookupData.tenSuCo.find(
        (t) =>
          t.tensucoyk === currentTenSuCo ||
          t.idscyk.toString() === currentTenSuCo,
      );
      if (matchInLookup) {
        result.push(matchInLookup);
      } else {
        result.push({
          idscyk: -1,
          maloaiscyk: null,
          tensucoyk: currentTenSuCo,
        });
      }
    }
  }
  return result;
}

function formatBooleanOption(val: boolean | string | null | undefined): string {
  if (val === true || val === "true" || val === "Có") return "true";
  if (val === false || val === "false" || val === "Không") return "false";
  return "";
}

function parseBooleanOption(val: string | null | undefined): boolean | null {
  if (val === "true" || val === "Có") return true;
  if (val === "false" || val === "Không") return false;
  return null;
}

export function buildSavePayload(values: IncidentFormValues): IncidentSavePayload {
  return {
    ngay: toDate(values.ngayLapDate, values.ngayLapTime),
    mahinhthuc: values.mahinhthuc ? parseInt(values.mahinhthuc) : null,
    makcb: values.makcb || null,
    hoten: values.hoten || null,
    maphong: values.maphong ? parseInt(values.maphong) : null,
    ngaysinh: values.ngaysinh ? toDate(values.ngaysinh, "00:00") : null,
    sobenhan: values.sobenhan || null,
    maphai: values.maphai ? parseInt(values.maphai) : null,
    madoituongsc: values.madoituongsc ? parseInt(values.madoituongsc) : null,
    tensuco: values.tensuco || null,
    ngaysuco: toDate(values.ngaySuCoDate, values.ngaySuCoTime),
    maphongnoi: values.maphongnoi ? parseInt(values.maphongnoi) : null,
    vitricuthe: values.vitricuthe || null,
    mota: values.mota || null,
    giaiphapdexuat: values.giaiphapdexuat || null,
    xulybandau: values.xulybandau || null,
    nguyennhangoc: values.nguyennhangoc || null,
    giaiphaptranhlaplai: values.giaiphaptranhlaplai || null,
    thongbaobacsy: parseBooleanOption(values.thongbaobacsy),
    thongbaonguoinha: parseBooleanOption(values.thongbaonguoinha),
    ghinhan: parseBooleanOption(values.ghinhan),
    thongbaonguoibenh: parseBooleanOption(values.thongbaonguoibenh),
    phanloaibandau: values.phanloaibandau || null,
    danhgiabandau: values.danhgiabandau || null,
    hotennguoibaocao: values.hotennguoibaocao || null,
    dienthoainguoibaocao: values.dienthoainguoibaocao || null,
    emailnguoibaocao: values.emailnguoibaocao || null,
    chungkien1: values.chungkien1 || null,
    chungkien2: values.chungkien2 || null,
    maloaiscyk: values.maloaiscyk ? parseInt(values.maloaiscyk) : null,
  };
}
