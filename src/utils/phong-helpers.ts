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
 * Xây dựng danh sách tùy chọn Phòng nội bộ trực thuộc Khoa & Phòng hoặc Khoa/Phòng (nếu không có phòng nội bộ)
 */
export function buildPhongNoiSelectOptions(
  lookupData: LookupData,
  selectedMaphong?: string,
): SelectOption[] {
  const optionsMap = new Map<string, string>();

  const filterMaphong = safeParseInt(selectedMaphong);

  // 1. Duyệt qua tất cả các Khoa/Phòng trong danh mục
  if (lookupData.phong?.length) {
    const targetPhongList = filterMaphong
      ? lookupData.phong.filter((p) => p.maphong === filterMaphong)
      : lookupData.phong;

    targetPhongList.forEach((phongItem) => {
      // Tìm các phòng nội bộ trực thuộc khoa/phòng này
      const subRooms =
        lookupData.phongNoi?.filter((pn) => pn.maphong === phongItem.maphong) ??
        [];

      if (subRooms.length > 0) {
        // Có phòng nội bộ: Thêm từng phòng nội bộ kèm tên khoa/phòng
        subRooms.forEach((subRoom) => {
          const label = !filterMaphong
            ? `${subRoom.tenphongnoi} (${phongItem.tenphong})`
            : (subRoom.tenphongnoi ?? `Phòng ${subRoom.maphongnoi}`);
          optionsMap.set(safeToString(subRoom.maphongnoi), label);
        });
      } else {
        // Không có phòng nội bộ: Thêm chính khoa/phòng đó vào danh sách
        optionsMap.set(
          safeToString(phongItem.maphong),
          phongItem.tenphong ?? `Khoa/Phòng ${phongItem.maphong}`,
        );
      }
    });
  }

  // 2. Bổ sung các phòng nội bộ không map được với khoa/phòng cha (nếu có)
  if (lookupData.phongNoi?.length) {
    lookupData.phongNoi.forEach((pn) => {
      const key = safeToString(pn.maphongnoi);
      if (!optionsMap.has(key)) {
        optionsMap.set(key, pn.tenphongnoi ?? `Phòng ${pn.maphongnoi}`);
      }
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
