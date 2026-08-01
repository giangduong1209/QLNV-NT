// Form Field & Select Option Constants

export const CO_KHONG_OPTIONS = [
  { value: "true", label: "Có" },
  { value: "false", label: "Không" },
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
