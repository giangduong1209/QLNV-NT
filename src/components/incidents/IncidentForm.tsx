"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TimePicker } from "@/components/ui/TimePicker";
import { useEditMode, DASHBOARD_FORM_ID } from "@/lib/edit-mode-context";
import { saveIncident } from "@/actions/incidents";
import type {
  SuCoDetail,
  IncidentFormValues,
  IncidentSavePayload,
} from "@/types";
import type { LookupData } from "@/actions/lookup";
import { toDateStr, toTimeStr, toDate } from "@/utils/format-date";
import {
  CO_KHONG_OPTIONS,
  PHAN_LOAI_OPTIONS,
  DANH_GIA_OPTIONS,
  KHOA_PHONG_OPTIONS,
} from "./incident-form.constants";

function buildDefaultValues(
  initialData: SuCoDetail | null,
  nowDate: string,
  nowTime: string,
): IncidentFormValues {
  const suco = initialData?.sucoykhoa;
  return {
    sosuco: suco?.sosuco ?? "",
    ngayLapDate: suco?.ngay ? toDateStr(suco.ngay) : nowDate,
    ngayLapTime: suco?.ngay ? toTimeStr(suco.ngay) : nowTime,
    mahinhthuc: suco?.mahinhthuc?.toString() ?? "1",
    maloaiscyk: suco?.maloaiscyk?.toString() ?? "",
    makcb: suco?.makcb ?? "",
    hoten: suco?.hoten ?? "",
    maphong: suco?.maphong?.toString() ?? "",
    ngaysinh: suco?.ngaysinh ? toDateStr(suco.ngaysinh) : "",
    sobenhan: suco?.sobenhan ?? "",
    maphai: suco?.maphai?.toString() ?? "",
    madoituongsc: suco?.madoituongsc?.toString() ?? "",
    tensuco: suco?.tensuco ?? "",
    ngaySuCoDate: suco?.ngaysuco ? toDateStr(suco.ngaysuco) : nowDate,
    ngaySuCoTime: suco?.ngaysuco ? toTimeStr(suco.ngaysuco) : nowTime,
    maphongnoi: suco?.maphongnoi?.toString() ?? "",
    vitricuthe: suco?.vitricuthe ?? "",
    mota: suco?.mota ?? "",
    giaiphapdexuat: suco?.giaiphapdexuat ?? "",
    xulybandau: suco?.xulybandau ?? "",
    nguyennhangoc: suco?.nguyennhangoc ?? "",
    giaiphaptranhlaplai: suco?.giaiphaptranhlaplai ?? "",
    thongbaobacsy: suco?.thongbaobacsy ?? "",
    thongbaonguoinha: suco?.thongbaonguoinha ?? "",
    ghinhan: suco?.ghinhan ?? "",
    thongbaonguoibenh: suco?.thongbaonguoibenh ?? "",
    phanloaibandau: suco?.phanloaibandau ?? "",
    danhgiabandau: suco?.danhgiabandau ?? "",
    hotennguoibaocao: suco?.hotennguoibaocao ?? "",
    dienthoainguoibaocao: suco?.dienthoainguoibaocao ?? "",
    emailnguoibaocao: suco?.emailnguoibaocao ?? "",
    chungkien1: suco?.chungkien1 ?? "",
    chungkien2: suco?.chungkien2 ?? "",
  };
}

interface IncidentFormProps {
  initialData: SuCoDetail | null;
  lookupData: LookupData;
  isNew: boolean;
}

export function IncidentForm({
  initialData,
  lookupData,
  isNew,
}: IncidentFormProps) {
  const router = useRouter();
  const { isEditing, setIsEditing } = useEditMode();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canEdit = isNew || isEditing;

  const { register, control, handleSubmit, reset } =
    useForm<IncidentFormValues>({
      defaultValues: buildDefaultValues(initialData, "", ""),
    });

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    reset(buildDefaultValues(initialData, date, time));
    setIsEditing(isNew);
    setSaveError(null);
    setSaveSuccess(false);
  }, [initialData?.sucoykhoa?.masuco, isNew, reset, setIsEditing]);

  const onSubmit = async (values: IncidentFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const masuco = initialData?.sucoykhoa?.masuco ?? null;

    const payload: IncidentSavePayload = {
      ngay: toDate(values.ngayLapDate, values.ngayLapTime),
      mahinhthuc: values.mahinhthuc ? parseInt(values.mahinhthuc) : null,
      makcb: values.makcb || null,
      hoten: values.hoten || null,
      maphong: values.maphong ? parseInt(values.maphong) : null,
      ngaysinh: values.ngaysinh ? toDate(values.ngaysinh, "00:00") : null,
      sobenhan: values.sobenhan || null,
      maphai: values.maphai ? parseInt(values.maphai) : null,
      madoituongsc: values.madoituongsc ? parseInt(values.madoituongsc) : null,
      tensuco: values.tensuco || null,
      ngaysuco: toDate(values.ngaySuCoDate, values.ngaySuCoTime),
      maphongnoi: values.maphongnoi ? parseInt(values.maphongnoi) : null,
      vitricuthe: values.vitricuthe || null,
      mota: values.mota || null,
      giaiphapdexuat: values.giaiphapdexuat || null,
      xulybandau: values.xulybandau || null,
      nguyennhangoc: values.nguyennhangoc || null,
      giaiphaptranhlaplai: values.giaiphaptranhlaplai || null,
      thongbaobacsy: values.thongbaobacsy || null,
      thongbaonguoinha: values.thongbaonguoinha || null,
      ghinhan: values.ghinhan || null,
      thongbaonguoibenh: values.thongbaonguoibenh || null,
      phanloaibandau: values.phanloaibandau || null,
      danhgiabandau: values.danhgiabandau || null,
      hotennguoibaocao: values.hotennguoibaocao || null,
      dienthoainguoibaocao: values.dienthoainguoibaocao || null,
      emailnguoibaocao: values.emailnguoibaocao || null,
      chungkien1: values.chungkien1 || null,
      chungkien2: values.chungkien2 || null,
      maloaiscyk: values.maloaiscyk ? parseInt(values.maloaiscyk) : null,
    };

    const result = await saveIncident(masuco, payload);
    setIsSaving(false);

    if (result.success && result.masuco) {
      setSaveSuccess(true);
      setIsEditing(false);
      router.push(`/dashboard?masuco=${result.masuco}`);
    } else {
      setSaveError(result.error ?? "Lưu không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <form
      id={DASHBOARD_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="ql-form-container"
    >
      {saveError && (
        <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <span>⚠</span> {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <span>✓</span> Lưu thành công!
        </div>
      )}
      {isSaving && (
        <div className="mb-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          Đang lưu...
        </div>
      )}

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="ql-form-header-line">
        <div className="ql-form-header-field">
          <span className="ql-field-label">Mã sự cố:</span>
          <input
            type="text"
            {...register("sosuco")}
            readOnly
            placeholder={isNew ? "Tự động" : ""}
            className="w-27.5 text-center font-bold bg-primary-light border border-[rgba(220,38,38,0.2)] text-primary-dark"
          />
        </div>

        <div className="ql-form-header-field">
          <span className="ql-field-label">Ngày lập:</span>
          <div className="flex gap-1.5 items-center">
            <input
              type="date"
              {...register("ngayLapDate")}
              readOnly={!canEdit}
              className="w-32.5 text-center bg-primary-light border border-[rgba(220,38,38,0.15)]"
            />
            <Controller
              name="ngayLapTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={field.onChange}
                  size="sm"
                  disabled={!canEdit}
                />
              )}
            />
          </div>
        </div>

        <div className="ql-form-header-field">
          <span className="ql-field-label">Hình thức:</span>
          <select
            {...register("mahinhthuc")}
            disabled={!canEdit}
            className="w-30"
          >
            {lookupData.hinhThuc.map((o) => (
              <option key={o.mahinhthuc} value={o.mahinhthuc.toString()}>
                {o.tenhinhthuc}
              </option>
            ))}
          </select>
        </div>

        <div className="ql-form-header-field">
          <span className="ql-field-label">Loại sự cố:</span>
          <select
            {...register("maloaiscyk")}
            disabled={!canEdit}
            className="w-55"
          >
            <option value=""></option>
            {lookupData.loaiSuCo.map((item) => (
              <option key={item.maloaiscyk} value={item.maloaiscyk.toString()}>
                {item.tenloaiscyk}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── SECTION 1: THÔNG TIN NGƯỜI BỆNH ───────────────────────────────── */}
      <div className="ql-form-section">
        <div className="ql-form-section-header">
          <span>THÔNG TIN NGƯỜI BỆNH</span>
        </div>
        <div className="ql-form-section-body">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[60px]">Mã KCB:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("makcb")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="ql-field">
                <span className="ql-field-label w-[70px]">Họ và tên:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("hoten")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select {...register("maphong")} disabled={!canEdit}>
                    {KHOA_PHONG_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[60px]">Ngày sinh:</span>
                <div className="ql-field-control">
                  <input
                    type="date"
                    {...register("ngaysinh")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="ql-field">
                <span className="ql-field-label w-[70px]">Số bệnh án:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("sobenhan")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Giới tính:</span>
                <div className="ql-field-control">
                  <select {...register("maphai")} disabled={!canEdit}>
                    <option value=""></option>
                    {lookupData.phai.map((o) => (
                      <option key={o.maphai} value={o.maphai.toString()}>
                        {o.phai}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[60px]">Đối tượng:</span>
                <div className="ql-field-control">
                  <select {...register("madoituongsc")} disabled={!canEdit}>
                    <option value=""></option>
                    {lookupData.doiTuong.map((o) => (
                      <option
                        key={o.madoituongsc}
                        value={o.madoituongsc.toString()}
                      >
                        {o.doituongsc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: NƠI XẢY RA SỰ CỐ ─────────────────────────────────── */}
      <div className="ql-form-section">
        <div className="ql-form-section-header">
          <span>NƠI XẢY RA SỰ CỐ</span>
        </div>
        <div className="ql-form-section-body">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label">Tên sự cố:</span>
                <div className="ql-field-control">
                  <select
                    {...register("tensuco")}
                    disabled={!canEdit}
                    className="w-full"
                  >
                    <option value=""></option>
                    {lookupData.tenSuCo.map((item) => (
                      <option key={item.idscyk} value={item.tensucoyk ?? ""}>
                        {item.tensucoyk}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label">Ngày sự cố:</span>
                <div className="ql-field-control ql-datetime-row">
                  <input
                    type="date"
                    {...register("ngaySuCoDate")}
                    readOnly={!canEdit}
                  />
                  <Controller
                    name="ngaySuCoTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!canEdit}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select {...register("maphongnoi")} disabled={!canEdit}>
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
                <span className="ql-field-label">Vị trí cụ thể:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("vitricuthe")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-6">
              <div className="ql-field-label mb-1">Mô tả:</div>
              <div className="ql-field-control">
                <textarea rows={3} {...register("mota")} readOnly={!canEdit} />
              </div>
            </div>
            <div className="col-span-6">
              <div className="ql-field-label mb-1">Đề xuất giải pháp:</div>
              <div className="ql-field-control">
                <textarea
                  rows={3}
                  {...register("giaiphapdexuat")}
                  readOnly={!canEdit}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field-label mb-1">Xử lý ban đầu:</div>
              <div className="ql-field-control">
                <textarea
                  rows={2}
                  {...register("xulybandau")}
                  readOnly={!canEdit}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field">
                <span className="ql-field-label w-[110px]">
                  Nguyên nhân gốc:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("nguyennhangoc")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <div className="ql-field">
                <span className="ql-field-label w-57.2">
                  Giải pháp tránh lặp lại sai sót, sự cố:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("giaiphaptranhlaplai")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: THÔNG BÁO & XÁC NHẬN ─────────────────────────────── */}
      <div className="ql-form-section mb-0">
        <div className="ql-form-section-header">
          <span>THÔNG BÁO &amp; XÁC NHẬN</span>
        </div>
        <div className="ql-form-section-body">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 flex flex-col gap-3">
              {(
                [
                  {
                    name: "thongbaobacsy" as const,
                    label:
                      "Thông báo cho Bác sĩ điều trị/người có trách nhiệm:",
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
                ] as const
              ).map(({ name, label }) => (
                <div key={name} className="ql-field">
                  <span className="ql-field-label w-85 text-xs">{label}</span>
                  <div className="ql-field-control">
                    <select {...register(name)} disabled={!canEdit}>
                      <option value=""></option>
                      {CO_KHONG_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <div className="ql-field">
                <span className="ql-field-label w-85 text-xs">
                  Phân loại ban đầu về sự cố (**):
                </span>
                <div className="ql-field-control">
                  <select {...register("phanloaibandau")} disabled={!canEdit}>
                    <option value=""></option>
                    {PHAN_LOAI_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ql-field">
                <span className="ql-field-label w-85 text-xs">
                  Đánh giá ban đầu về mức độ ảnh hưởng của sự cố (**):
                </span>
                <div className="ql-field-control">
                  <select {...register("danhgiabandau")} disabled={!canEdit}>
                    <option value=""></option>
                    {DANH_GIA_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-span-5 bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col gap-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Người báo cáo
              </div>

              <div className="ql-field">
                <span className="ql-field-label w-15">Họ tên:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("hotennguoibaocao")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div className="ql-field">
                <span className="ql-field-label w-15">SĐT:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("dienthoainguoibaocao")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div className="ql-field">
                <span className="ql-field-label w-15">Email:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("emailnguoibaocao")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div className="ql-field">
                <span className="ql-field-label w-20">Chứng kiến 1:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("chungkien1")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div className="ql-field">
                <span className="ql-field-label w-20">Chứng kiến 2:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("chungkien2")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
