export interface CauseItem {
  causeKey: string;
  causeLabel: string;
  defaultMaxOptions: number;
}

export const CAUSES_LEFT_DEFAULT: CauseItem[] = [
  {
    causeKey: "kythuat",
    causeLabel: "Thực hiện quy trình kỹ thuật, thủ thuật chuyên môn",
    defaultMaxOptions: 9,
  },
  { causeKey: "nhiemkhuan", causeLabel: "Nhiễm khuẩn bệnh viện", defaultMaxOptions: 5 },
  { causeKey: "thuoc", causeLabel: "Thuốc và dịch truyền", defaultMaxOptions: 9 },
  { causeKey: "mau", causeLabel: "Máu và các chế phẩm máu", defaultMaxOptions: 3 },
  { causeKey: "thietbiyte", causeLabel: "Thiết bị y tế", defaultMaxOptions: 3 },
  { causeKey: "hanhvi", causeLabel: "Hành vi", defaultMaxOptions: 5 },
  { causeKey: "tainan", causeLabel: "Tai nạn đối với người bệnh", defaultMaxOptions: 1 },
  { causeKey: "hatang", causeLabel: "Hạ tầng cơ sở", defaultMaxOptions: 2 },
  { causeKey: "nguonluc", causeLabel: "Quản lý nguồn lực, tổ chức", defaultMaxOptions: 3 },
  { causeKey: "tailieu", causeLabel: "Hồ sơ, tài liệu, thủ tục hành chính", defaultMaxOptions: 6 },
];

export const CAUSES_RIGHT_DEFAULT: CauseItem[] = [
  { causeKey: "nnnnhanvien", causeLabel: "Nhân viên", defaultMaxOptions: 6 },
  { causeKey: "nnnnguoibenh", causeLabel: "Người bệnh", defaultMaxOptions: 1 },
  { causeKey: "nnnmoitruong", causeLabel: "Môi trường làm việc", defaultMaxOptions: 4 },
  { causeKey: "nnntochuc", causeLabel: "Tổ chức/ dịch vụ", defaultMaxOptions: 4 },
  { causeKey: "nnnbenngoai", causeLabel: "Yếu tố bên ngoài", defaultMaxOptions: 3 },
];

export const INJURY_FIELDS = [
  { field: "tt_NC1" as const, label: "Tổn thương nhẹ NC1:" },
  { field: "tt_NC2" as const, label: "Tổn thương trung bình NC2:" },
  { field: "tt_NC3" as const, label: "Tổn thương nặng NC3:" },
  { field: "tttochuc" as const, label: "Tổn thương trên tổ chức:" },
] as const;
