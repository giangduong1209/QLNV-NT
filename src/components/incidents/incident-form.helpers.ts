import type { SuCoDetail, IncidentFormValues, IncidentSavePayload } from "@/types";
import type { LookupData } from "@/actions/lookup";
import {
  toDateStr,
  toTimeStr,
  toDate,
  safeToString,
  safeParseInt,
  toNullableString,
  formatBooleanOption,
  parseBooleanOption,
} from "@/utils";
import { KHOA_PHONG_OPTIONS } from "./incident-form.constants";

export function buildDefaultValues(
  initialData: SuCoDetail | null,
  lookupData: LookupData,
  nowDate: string,
  nowTime: string,
): IncidentFormValues {
  const suco = initialData?.sucoykhoa;
  let initialTenSuCo = suco?.tensuco ?? "";
  let initialLoaiSuCo = safeToString(suco?.maloaiscyk);

  if (initialTenSuCo && lookupData?.tenSuCo?.length) {
    const matched = lookupData.tenSuCo.find(
      (t) =>
        t.tensucoyk === initialTenSuCo ||
        safeToString(t.idscyk) === initialTenSuCo,
    );
    if (matched) {
      if (matched.tensucoyk) {
        initialTenSuCo = matched.tensucoyk;
      }
      if (!initialLoaiSuCo && matched.maloaiscyk != null) {
        initialLoaiSuCo = safeToString(matched.maloaiscyk);
      }
    }
  }

  return {
    sosuco: suco?.sosuco ?? "",
    ngayLapDate: suco?.ngay ? toDateStr(suco.ngay) : nowDate,
    ngayLapTime: suco?.ngay ? toTimeStr(suco.ngay) : nowTime,
    mahinhthuc: safeToString(suco?.mahinhthuc) || "1",
    maloaiscyk: initialLoaiSuCo,
    makcb: suco?.makcb ?? "",
    hoten: suco?.hoten ?? "",
    maphong: safeToString(suco?.maphong),
    ngaysinh: suco?.ngaysinh ? toDateStr(suco.ngaysinh) : "",
    sobenhan: suco?.sobenhan ?? "",
    maphai: safeToString(suco?.maphai),
    madoituongsc: safeToString(suco?.madoituongsc),
    tensuco: initialTenSuCo,
    ngaySuCoDate: suco?.ngaysuco ? toDateStr(suco.ngaysuco) : nowDate,
    ngaySuCoTime: suco?.ngaysuco ? toTimeStr(suco.ngaysuco) : nowTime,
    maphongnoi: safeToString(suco?.maphongnoi),
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
    phanloaibandau: safeToString(suco?.phanloaibandau),
    danhgiabandau: safeToString(suco?.danhgiabandau),
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
      optionsMap.set(safeToString(p.maphong), label);
    });
  }

  if (lookupData.khoa?.length) {
    lookupData.khoa.forEach((k) => {
      const key = safeToString(k.makhoa);
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
        (item) => safeToString(item.maloaiscyk) === selectedLoaiSuCo,
      )
    : lookupData.tenSuCo;

  const result = [...filtered];
  if (currentTenSuCo) {
    const exists = result.some(
      (t) =>
        t.tensucoyk === currentTenSuCo ||
        safeToString(t.idscyk) === currentTenSuCo,
    );
    if (!exists) {
      const matchInLookup = lookupData.tenSuCo.find(
        (t) =>
          t.tensucoyk === currentTenSuCo ||
          safeToString(t.idscyk) === currentTenSuCo,
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

export function buildSavePayload(values: IncidentFormValues): IncidentSavePayload {
  return {
    ngay: toDate(values.ngayLapDate, values.ngayLapTime),
    mahinhthuc: safeParseInt(values.mahinhthuc),
    makcb: toNullableString(values.makcb),
    hoten: toNullableString(values.hoten),
    maphong: safeParseInt(values.maphong),
    ngaysinh: values.ngaysinh ? toDate(values.ngaysinh, "00:00") : null,
    sobenhan: toNullableString(values.sobenhan),
    maphai: safeParseInt(values.maphai),
    madoituongsc: safeParseInt(values.madoituongsc),
    tensuco: toNullableString(values.tensuco),
    ngaysuco: toDate(values.ngaySuCoDate, values.ngaySuCoTime),
    maphongnoi: safeParseInt(values.maphongnoi),
    vitricuthe: toNullableString(values.vitricuthe),
    mota: toNullableString(values.mota),
    giaiphapdexuat: toNullableString(values.giaiphapdexuat),
    xulybandau: toNullableString(values.xulybandau),
    nguyennhangoc: toNullableString(values.nguyennhangoc),
    giaiphaptranhlaplai: toNullableString(values.giaiphaptranhlaplai),
    thongbaobacsy: parseBooleanOption(values.thongbaobacsy),
    thongbaonguoinha: parseBooleanOption(values.thongbaonguoinha),
    ghinhan: parseBooleanOption(values.ghinhan),
    thongbaonguoibenh: parseBooleanOption(values.thongbaonguoibenh),
    phanloaibandau: safeParseInt(values.phanloaibandau),
    danhgiabandau: safeParseInt(values.danhgiabandau),
    hotennguoibaocao: toNullableString(values.hotennguoibaocao),
    dienthoainguoibaocao: toNullableString(values.dienthoainguoibaocao),
    emailnguoibaocao: toNullableString(values.emailnguoibaocao),
    chungkien1: toNullableString(values.chungkien1),
    chungkien2: toNullableString(values.chungkien2),
    maloaiscyk: safeParseInt(values.maloaiscyk),
  };
}

