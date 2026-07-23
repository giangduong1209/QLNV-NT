"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { TimePicker } from "../ui/TimePicker";
import type { SuCoDetail } from "@/types";
import { toDateStr, toTimeStr } from "@/utils";
import { KHOA_PHONG_OPTIONS } from "@/components/incidents/incident-form.constants";

interface CauseItem {
  key: string;
  label: string;
  max: number;
}

const CAUSES_LEFT: CauseItem[] = [
  {
    key: "kythuat",
    label: "Thực hiện quy trình kỹ thuật, thủ thuật chuyên môn",
    max: 9,
  },
  { key: "nhiemkhuan", label: "Nhiễm khuẩn bệnh viện", max: 5 },
  { key: "thuoc", label: "Thuốc và dịch truyền", max: 9 },
  { key: "mau", label: "Máu và các chế phẩm máu", max: 3 },
  { key: "thietbiyte", label: "Thiết bị y tế", max: 3 },
  { key: "hanhvi", label: "Hành vi", max: 5 },
  { key: "tainan", label: "Tai nạn đối với người bệnh", max: 1 },
  { key: "hatang", label: "Hạ tầng cơ sở", max: 2 },
  { key: "nguonluc", label: "Quản lý nguồn lực, tổ chức", max: 3 },
  { key: "tailieu", label: "Hồ sơ, tài liệu, thủ tục hành chính", max: 6 },
];

const CAUSES_RIGHT: CauseItem[] = [
  { key: "nnnnhanvien", label: "Nhân viên", max: 6 },
  { key: "nnnnguoibenh", label: "Người bệnh", max: 1 },
  { key: "nnnmoitruong", label: "Môi trường làm việc", max: 4 },
  { key: "nnntochuc", label: "Tổ chức/ dịch vụ", max: 4 },
  { key: "nnnbenngoai", label: "Yếu tố bên ngoài", max: 3 },
];

const INJURY_FIELDS = [
  { field: "tt_NC1" as const, label: "Tổn thương nhẹ NC1:" },
  { field: "tt_NC2" as const, label: "Tổn thương trung bình NC2:" },
  { field: "tt_NC3" as const, label: "Tổn thương nặng NC3:" },
  { field: "tttochuc" as const, label: "Tổn thương trên tổ chức:" },
] as const;

// ─── Kiểu form ───────────────────────────────────────────────────────────────

type ConfirmForm = {
  // Thông tin sự cố (từ dangky_sucoykhoa)
  masuco: string;
  sosuco: string;
  makcb: string;
  hoten: string;
  maphong: string;
  vitricuthe: string;
  ngaySuCoDate: string;
  ngaySuCoTime: string;
  tensuco: string;

  // Phân tích (từ dangky_phantichsuco)
  pt_ngayDate: string;
  pt_ngayTime: string;
  pt_mota: string;
  // Nguyên nhân cột trái (lưu giá trị select dropdown)
  kythuat: string;
  nhiemkhuan: string;
  thuoc: string;
  mau: string;
  thietbiyte: string;
  hanhvi: string;
  tainan: string;
  hatang: string;
  nguonluc: string;
  tailieu: string;
  ptkhac: string;
  // Nguyên nhân cột phải
  ylenh: string;
  nnnnhanvien: string;
  nnnnguoibenh: string;
  nnnmoitruong: string;
  nnntochuc: string;
  nnnbenngoai: string;
  nnnkhac: string;
  // Kết quả phân tích
  khacphucsuco: string;
  dexuat: string;
  chuyengiadanhgia: string;
  cgthaoluan: string;
  phuhop: string;
  khuyencao: string;
  tt_NC0: boolean;
  tt_NC1: string;
  tt_NC2: string;
  tt_NC3: string;
  tttochuc: string;
  duyet: boolean;
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface ConfirmIncidentsProps {
  initialData: SuCoDetail | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ConfirmIncidents = ({ initialData }: ConfirmIncidentsProps) => {
  const suco = initialData?.sucoykhoa;
  const phanTich = initialData?.phantichsuco;

  const { control, register, reset, watch } = useForm<ConfirmForm>({
    defaultValues: buildDefaultValues(suco, phanTich),
  });

  // Reset form khi initialData thay đổi (người dùng click dòng khác)
  useEffect(() => {
    reset(buildDefaultValues(suco, phanTich));
  }, [initialData, reset, suco, phanTich]);

  // Watch time values cho TimePicker
  const pt_ngayTime = watch("pt_ngayTime");
  const ngaySuCoTime = watch("ngaySuCoTime");

  const daPhanTich = !!phanTich;

  // ── Render nguyên nhân ─────────────────────────────────────────────────────
  const renderCauseRow = (item: CauseItem) => (
    <div key={item.key} className="flex items-center gap-2 mb-1 text-[13px]">
      <span className="flex-1 min-w-0">{item.label}</span>
      <Controller
        name={item.key as keyof ConfirmForm}
        control={control}
        render={({ field }) => (
          <select
            value={field.value as string}
            onChange={field.onChange}
            className="w-[110px] text-xs px-0.5 py-px border border-[#bbb] rounded"
          >
            <option value="">Không chọn</option>
            {Array.from({ length: item.max }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        )}
      />
    </div>
  );

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="ql-form-container">
      {/* ── Thông tin chung ────────────────────────────────────────────────── */}
      <div className="ql-form-section">
        <div className="ql-form-section-body">
          {/* Mã sự cố */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Mã sự cố:</span>
                <div className="ql-field-control">
                  <div className="ql-field-control-wrapper">
                    <input type="text" {...register("sosuco")} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tên sự cố + Ngày sự cố */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-5">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Tên sự cố:</span>
                <div className="ql-field-control">
                  <div className="ql-field-control-wrapper">
                    <input
                      type="text"
                      className="ql-input-with-addon"
                      {...register("tensuco")}
                      readOnly
                    />
                    <button type="button" className="ql-input-addon-btn">
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Ngày sự cố:</span>
                <div className="ql-field-control ql-datetime-row">
                  <input type="date" {...register("ngaySuCoDate")} readOnly />
                  <Controller
                    name="ngaySuCoTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mã KCB + Họ và tên */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Mã KCB:</span>
                <div className="ql-field-control">
                  <input type="text" {...register("makcb")} readOnly />
                </div>
              </div>
            </div>
            <div className="col-span-9">
              <div className="ql-field">
                <span className="ql-field-label w-[70px]">Họ và tên:</span>
                <div className="ql-field-control">
                  <input type="text" {...register("hoten")} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Khoa/phòng + Vị trí cụ thể */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select {...register("maphong")} disabled>
                    {KHOA_PHONG_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Vị trí cụ thể:</span>
                <div className="ql-field-control">
                  <input type="text" {...register("vitricuthe")} readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Phân tích sự cố ──────────────────────────────────────────────────── */}
      <div className="ql-form-section">
        <div className="ql-form-section-header">
          <span>PHÂN TÍCH SỰ CỐ</span>
          {daPhanTich && (
            <span className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              ✓ Đã phân tích
            </span>
          )}
        </div>
        <div className="ql-form-section-body">
          {/* Ngày phân tích */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-6">
              <div className="ql-field">
                <span className="ql-field-label">Ngày phân tích:</span>
                <div className="ql-field-control ql-datetime-row">
                  <input type="date" {...register("pt_ngayDate")} />
                  <Controller
                    name="pt_ngayTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-6">
              <div className="ql-field-label">Mô tả:</div>
              <div className="ql-field-control">
                <textarea rows={5} {...register("pt_mota")} />
              </div>
            </div>
          </div>

          {/* Bảng nguyên nhân */}
          <div className="grid grid-cols-12 gap-2">
            {/* Cột trái */}
            <div className="col-span-6">
              {CAUSES_LEFT.map((item) => renderCauseRow(item))}
              <div className="ql-field">
                <span className="ql-field-label w-[40px]">Khác:</span>
                <div className="ql-field-control">
                  <input type="text" {...register("ptkhac")} />
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="col-span-6">
              <div className="ql-field mb-2">
                <span className="ql-field-label w-[40px]">Y lệnh:</span>
                <div className="ql-field-control">
                  <textarea rows={3} {...register("ylenh")} />
                </div>
              </div>

              {CAUSES_RIGHT.map((item) => renderCauseRow(item))}

              <div className="ql-field mb-2">
                <span className="ql-field-label w-[40px]">Khác:</span>
                <div className="ql-field-control">
                  <input type="text" {...register("nnnkhac")} />
                </div>
              </div>

              <div>
                <span className="ql-field-label">Khắc phục sự cố</span>
                <div className="ql-field-control">
                  <textarea rows={3} {...register("khacphucsuco")} />
                </div>
              </div>
              <div className="mt-2">
                <div className="ql-field-label">Đề xuất khuyến cáo</div>
                <div className="ql-field-control">
                  <textarea rows={3} {...register("dexuat")} />
                </div>
              </div>
            </div>
          </div>

          {/* Đánh giá chuyên gia */}
          <div className="grid grid-cols-12 gap-4 my-6">
            <div className="col-span-12">
              <div className="ql-field">
                <div className="ql-field-label w-[190px]">
                  Đánh giá của chuyên gia:
                </div>
                <div className="ql-field-control">
                  <textarea
                    rows={5}
                    {...register("chuyengiadanhgia")}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thảo luận / Phù hợp */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label">
                  Đã thảo luận đưa ra khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <input type="text" {...register("cgthaoluan")} disabled />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Phù hợp với các khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <input type="text" {...register("phuhop")} disabled />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Cụ thể khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <input type="text" {...register("khuyencao")} />
                </div>
              </div>
            </div>
          </div>

          {/* Tổn thương NC0 */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field">
                <div className="ql-field-label w-[190px]">
                  Tổn thương trên người bệnh:
                </div>
                <div className="ql-field-control">
                  <input type="checkbox" {...register("tt_NC0")} />
                  <span className="text-[13px] ml-2">Chưa xảy ra NC0(A)</span>
                </div>
              </div>
            </div>
          </div>

          {/* NC1, NC2, NC3, Tổ chức */}
          {INJURY_FIELDS.map(({ field, label }) => (
            <div key={field} className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-8">
                <div className="ql-field">
                  <span className="ql-field-label w-[190px]">{label}</span>
                  <div className="ql-field-control">
                    <input type="text" {...register(field)} disabled />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Build default values từ data ────────────────────────────────────────────

function buildDefaultValues(
  suco: SuCoDetail["sucoykhoa"] | undefined,
  phanTich: SuCoDetail["phantichsuco"] | null | undefined,
): ConfirmForm {
  return {
    // Thông tin sự cố
    masuco: suco?.masuco?.toString() ?? "",
    sosuco: suco?.sosuco ?? "",
    makcb: suco?.makcb ?? "",
    hoten: suco?.hoten ?? "",
    maphong: suco?.maphong?.toString() ?? "",
    vitricuthe: suco?.vitricuthe ?? "",
    ngaySuCoDate: toDateStr(suco?.ngaysuco),
    ngaySuCoTime: toTimeStr(suco?.ngaysuco),
    tensuco: suco?.tensuco ?? "",

    // Phân tích
    pt_ngayDate: toDateStr(phanTich?.ngay),
    pt_ngayTime: toTimeStr(phanTich?.ngay),
    pt_mota: phanTich?.mota ?? "",
    kythuat: phanTich?.kythuat ?? "",
    nhiemkhuan: phanTich?.nhiemkhuan ?? "",
    thuoc: phanTich?.thuoc ?? "",
    mau: phanTich?.mau ?? "",
    thietbiyte: phanTich?.thietbiyte ?? "",
    hanhvi: phanTich?.hanhvi ?? "",
    tainan: phanTich?.tainan ?? "",
    hatang: phanTich?.hatang ?? "",
    nguonluc: phanTich?.nguonluc ?? "",
    tailieu: phanTich?.tailieu ?? "",
    ptkhac: phanTich?.ptkhac ?? "",
    ylenh: phanTich?.ylenh ?? "",
    nnnnhanvien: phanTich?.nnnnhanvien ?? "",
    nnnnguoibenh: phanTich?.nnnnguoibenh ?? "",
    nnnmoitruong: phanTich?.nnnmoitruong ?? "",
    nnntochuc: phanTich?.nnntochuc ?? "",
    nnnbenngoai: phanTich?.nnnbenngoai ?? "",
    nnnkhac: phanTich?.nnnkhac ?? "",
    khacphucsuco: phanTich?.khacphucsuco ?? "",
    dexuat: phanTich?.dexuat ?? "",
    chuyengiadanhgia: phanTich?.chuyengiadanhgia ?? "",
    cgthaoluan: phanTich?.cgthaoluan ?? "",
    phuhop: phanTich?.phuhop ?? "",
    khuyencao: phanTich?.khuyencao ?? "",
    tt_NC0: phanTich?.tt_NC0 ?? false,
    tt_NC1: phanTich?.tt_NC1 ?? "",
    tt_NC2: phanTich?.tt_NC2 ?? "",
    tt_NC3: phanTich?.tt_NC3 ?? "",
    tttochuc: phanTich?.tttochuc ?? "",
    duyet: phanTich?.duyet ?? false,
  };
}
