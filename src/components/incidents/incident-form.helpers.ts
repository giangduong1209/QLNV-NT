import type {
  SuCoDetail,
  IncidentFormValues,
  IncidentSavePayload,
} from "@/types";
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
      optionsMap.set(
        safeToString(p.maphong),
        p.tenphong ?? `Khoa/Phòng ${p.maphong}`,
      );
    });
  }

  return Array.from(optionsMap.entries()).map(([value, label]) => ({
    value,
    label,
  }));
}

export function buildPhongNoiOptions(
  lookupData: LookupData,
  selectedMaphong?: string,
) {
  const optionsMap = new Map<string, string>();
  optionsMap.set("", "");

  const filterMaphong = safeParseInt(selectedMaphong);

  if (lookupData.phongNoi?.length) {
    // Nếu có chọn maphong, lọc danh sách phòng nội thuộc maphong đó
    let filteredList = filterMaphong
      ? lookupData.phongNoi.filter((pn) => pn.maphong === filterMaphong)
      : lookupData.phongNoi;

    // Nếu lọc xong mà rỗng (hoặc chưa chọn maphong), hiển thị tất cả
    if (filteredList.length === 0 && filterMaphong) {
      filteredList = lookupData.phongNoi;
    }

    filteredList.forEach((pn) => {
      const parent = lookupData.phong?.find((p) => p.maphong === pn.maphong);
      const label =
        parent && !filterMaphong
          ? `${pn.tenphongnoi} (${parent.tenphong})`
          : (pn.tenphongnoi ?? `Phòng ${pn.maphongnoi}`);
      optionsMap.set(safeToString(pn.maphongnoi), label);
    });
  }

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

export function buildSavePayload(
  values: IncidentFormValues,
): IncidentSavePayload {
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
