import type { LookupData, SelectOption } from "@/types";
import { safeToString, safeParseInt } from "./helpers";
import { KHOA_PHONG_MAP } from "@/constants/department";

/**
 * Xây dựng danh sách tùy chọn Khoa & Phòng cho dropdown select từ LookupData
 */
export function buildPhongSelectOptions(
  lookupData: LookupData,
): SelectOption[] {
  const optionsMap = new Map<string, string>();
  if (lookupData.phong?.length) {
    lookupData.phong.forEach((phongItem) => {
      optionsMap.set(
        safeToString(phongItem.maphong),
        phongItem.tenphong ?? `Khoa/Phòng ${phongItem.maphong}`,
      );
    });
  }

  return Array.from(optionsMap.entries()).map(([value, label]) => ({
    value,
    label,
  }));
}

/**
 * Xây dựng danh sách tùy chọn Phòng nội bộ trực thuộc Khoa & Phòng
 */
export function buildPhongNoiSelectOptions(
  lookupData: LookupData,
  selectedMaphong?: string,
): SelectOption[] {
  const optionsMap = new Map<string, string>();
  optionsMap.set("", "");

  const filterMaphong = safeParseInt(selectedMaphong);

  if (lookupData.phongNoi?.length) {
    let filteredList = filterMaphong
      ? lookupData.phongNoi.filter(
          (phongNoiItem) => phongNoiItem.maphong === filterMaphong,
        )
      : lookupData.phongNoi;

    if (filteredList.length === 0 && filterMaphong) {
      filteredList = lookupData.phongNoi;
    }

    filteredList.forEach((phongNoiItem) => {
      const parentPhong = lookupData.phong?.find(
        (phongItem) => phongItem.maphong === phongNoiItem.maphong,
      );
      const label =
        parentPhong && !filterMaphong
          ? `${phongNoiItem.tenphongnoi} (${parentPhong.tenphong})`
          : (phongNoiItem.tenphongnoi ?? `Phòng ${phongNoiItem.maphongnoi}`);
      optionsMap.set(safeToString(phongNoiItem.maphongnoi), label);
    });
  }

  return Array.from(optionsMap.entries()).map(([value, label]) => ({
    value,
    label,
  }));
}

/**
 * Xây dựng danh sách tùy chọn Khoa & Phòng phân cấp cho Sidebar Filter
 */
export function buildDepartmentSelectOptions(
  lookupData: LookupData,
): SelectOption[] {
  const options: SelectOption[] = [];

  if (lookupData.phong?.length) {
    lookupData.phong.forEach((parentPhong) => {
      options.push({
        value: parentPhong.maphong.toString(),
        label: parentPhong.tenphong ?? `Khoa/Phòng ${parentPhong.maphong}`,
      });
    });
  }

  // Fallback nếu CSDL chưa khởi tạo dữ liệu phòng khoa
  if (options.length === 0) {
    Object.entries(KHOA_PHONG_MAP).forEach(([maKhoa, tenKhoa]) => {
      options.push({ value: maKhoa, label: tenKhoa });
    });
  }

  return options;
}
