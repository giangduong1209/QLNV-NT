import { KHOA_PHONG_MAP } from "@/types";

export const CO_KHONG_OPTIONS = [
  { value: "true", label: "Có" },
  { value: "false", label: "Không" },
];

export const PHAN_LOAI_OPTIONS = [
  { value: "Nặng", label: "Nặng" },
  { value: "Trung bình", label: "Trung bình" },
  { value: "Nhẹ", label: "Nhẹ" },
];

export const DANH_GIA_OPTIONS = [
  { value: "Mức độ 1", label: "Mức độ 1" },
  { value: "Mức độ 2", label: "Mức độ 2" },
  { value: "Mức độ 3", label: "Mức độ 3" },
];

export const KHOA_PHONG_OPTIONS = [
  { value: "", label: "" },
  ...Object.entries(KHOA_PHONG_MAP).map(([ma, ten]) => ({
    value: ma,
    label: ten,
  })),
];
