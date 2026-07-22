import { KHOA_PHONG_MAP } from "@/types";

export const CO_KHONG_OPTIONS = [
  { value: "true", label: "Có" },
  { value: "false", label: "Không" },
];

export const PHAN_LOAI_OPTIONS = [
  { value: "1", label: "Sự cố suýt xảy ra (Near miss)" },
  { value: "2", label: "Sự cố đã tác động đến người bệnh nhưng chưa gây tổn thương" },
  { value: "3", label: "Sự cố đã gây tổn thương cho người bệnh" },
];

export const DANH_GIA_OPTIONS = [
  { value: "1", label: "NC0 - Chưa gây tổn thương (Nhẹ)" },
  { value: "2", label: "NC1 - Tổn thương nhẹ" },
  { value: "3", label: "NC2 - Tổn thương trung bình" },
  { value: "4", label: "NC3 - Tổn thương nặng / Tử vong" },
];

export const KHOA_PHONG_OPTIONS = [
  { value: "", label: "" },
  ...Object.entries(KHOA_PHONG_MAP).map(([ma, ten]) => ({
    value: ma,
    label: ten,
  })),
];

export const NOTIFICATION_FIELDS = [
  {
    name: "thongbaobacsy" as const,
    label: "Thông báo cho Bác sĩ điều trị/người có trách nhiệm:",
  },
  {
    name: "thongbaonguoinha" as const,
    label: "Thông báo cho người nhà/người bảo hộ:",
  },
  {
    name: "ghinhan" as const,
    label: "Ghi nhận vào hồ sơ bệnh án/giấy tờ liên quan:",
  },
  {
    name: "thongbaonguoibenh" as const,
    label: "Thông báo cho người bệnh:",
  },
] as const;
