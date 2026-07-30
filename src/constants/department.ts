import type { PhaiItem } from "@/types";

export const KHOA_PHONG_MAP: Record<number, string> = {
  1: "Khoa Cấp cứu",
  2: "Khoa Nội tổng hợp",
  3: "Khoa Ngoại tổng hợp",
  4: "Khoa Sản",
  5: "Khoa Nhi",
  6: "Khoa Tim mạch",
  7: "Khoa Hô hấp",
  8: "Khoa Thận - Tiết niệu",
  9: "Khoa Ung bướu",
  10: "Khoa Xét nghiệm",
  11: "Khoa Chẩn đoán hình ảnh",
  12: "Khoa Dược",
  13: "Phòng Kế hoạch tổng hợp",
  14: "Phòng Điều dưỡng",
};

export const DANH_MUC_PHAI: PhaiItem[] = [
  { maphai: 0, phai: "Nam" },
  { maphai: 1, phai: "Nữ" },
];
