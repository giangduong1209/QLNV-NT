"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TimePicker } from "@/components/ui/TimePicker";
import { useToast } from "@/components/ui/ToastProvider";
import { useEditMode, DASHBOARD_FORM_ID } from "@/lib/edit-mode-context";
import { saveIncident } from "@/actions/incidents";
import type { SuCoDetail, IncidentFormValues } from "@/types";
import type { LookupData } from "@/actions/lookup";
import {
  CO_KHONG_OPTIONS,
  PHAN_LOAI_OPTIONS,
  DANH_GIA_OPTIONS,
} from "./incident-form.constants";
import {
  buildDefaultValues,
  buildPhongOptions,
  buildTenSuCoList,
  buildSavePayload,
} from "./incident-form.helpers";

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
  const toast = useToast();
  const { isEditing, setIsEditing } = useEditMode();
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = isNew || isEditing;

  const { register, control, handleSubmit, reset } =
    useForm<IncidentFormValues>({
      defaultValues: buildDefaultValues(initialData, lookupData, "", ""),
    });

  const selectedLoaiSuCo = useWatch({ control, name: "maloaiscyk" });
  const currentTenSuCo = useWatch({ control, name: "tensuco" });

  const phongOptions = useMemo(
    () => buildPhongOptions(lookupData),
    [lookupData],
  );
  const tenSuCoList = useMemo(
    () => buildTenSuCoList(lookupData, selectedLoaiSuCo, currentTenSuCo),
    [lookupData, selectedLoaiSuCo, currentTenSuCo],
  );

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    reset(buildDefaultValues(initialData, lookupData, date, time));
    setIsEditing(isNew);
  }, [initialData?.sucoykhoa?.masuco, lookupData, isNew, reset, setIsEditing]);

  const onSubmit = async (values: IncidentFormValues) => {
    setIsSaving(true);

    const masuco = initialData?.sucoykhoa?.masuco ?? null;
    const payload = buildSavePayload(values);

    const result = await saveIncident(masuco, payload);
    setIsSaving(false);

    if (result.success && result.data?.masuco) {
      toast.success("Lưu thông tin sự cố thành công!");
      setIsEditing(false);
      router.push(`/dashboard?masuco=${result.data.masuco}`);
    } else {
      toast.error(result.error ?? "Lưu không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <form
      id={DASHBOARD_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="ql-form-container"
    >
      {isSaving && (
        <div className="mb-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v1m0 14v1m8-8h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
            />
          </svg>
          Đang lưu dữ liệu...
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
            className="w-40"
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
            className="w-full"
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
                <span className="ql-field-label w-15">Mã KCB:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("makcb")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-17.5">Họ và tên:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("hoten")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-5">
              <div className="ql-field">
                <span className="ql-field-label w-20">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select {...register("maphong")} disabled={!canEdit}>
                    {phongOptions.map((o) => (
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
                <span className="ql-field-label w-15">Ngày sinh:</span>
                <div className="ql-field-control">
                  <input
                    type="date"
                    {...register("ngaysinh")}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-17.5">Số bệnh án:</span>
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
                <span className="ql-field-label w-20">Giới tính:</span>
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
                    {tenSuCoList.map((item) => (
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
                    {phongOptions.map((o) => (
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
