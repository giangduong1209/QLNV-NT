"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TimePicker } from "@/components/ui/TimePicker";
import { FormFieldControl } from "@/components/ui/FormFieldControl";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useToast } from "@/components/ui/ToastProvider";
import { useEditMode } from "@/store/use-edit-mode-store";
import { saveIncident, getPreviewSoSuCo } from "@/actions/incidents";
import type { SuCoDetail, IncidentFormValues } from "@/types";
import type { LookupData } from "@/actions/lookup";
import { toDate, todayStr } from "@/utils";
import { CO_KHONG_OPTIONS, NOTIFICATION_FIELDS } from "@/constants";
import {
  buildDefaultValues,
  buildPhongOptions,
  buildPhongNoiOptions,
  buildTenSuCoList,
  buildSavePayload,
} from "./dashboard.helpers";

interface IncidentReportFormProps {
  initialData: SuCoDetail | null;
  lookupData: LookupData;
  isNew: boolean;
}

export function IncidentReportForm({
  initialData,
  lookupData,
  isNew,
}: IncidentReportFormProps) {
  const router = useRouter();
  const toast = useToast();
  const {
    isEditing,
    setIsEditing,
    setDisableEditButton,
    setIncidentStatus,
    registerSubmitHandler,
  } = useEditMode();

  useEffect(() => {
    const daPhanTich = !!initialData?.phantichsuco;
    const daDuyet = !!initialData?.phantichsuco?.duyet;
    setIncidentStatus({ daPhanTich, daDuyet });
    return () => {
      setIncidentStatus({ daPhanTich: false, daDuyet: false });
    };
  }, [initialData, setIncidentStatus]);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = isNew || isEditing;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    defaultValues: buildDefaultValues(initialData, lookupData, "", ""),
    mode: "onTouched",
  });

  const selectedLoaiSuCo = useWatch({ control, name: "maloaiscyk" });
  const currentTenSuCo = useWatch({ control, name: "tensuco" });
  const selectedMaphong = useWatch({ control, name: "maphong" });

  const loaiSuCoOptions = useMemo(
    () => [
      ...lookupData.loaiSuCo.map((item) => ({
        value: item.maloaiscyk.toString(),
        label: item.tenloaiscyk ?? "",
      })),
    ],
    [lookupData.loaiSuCo],
  );

  const phongOptions = useMemo(
    () => buildPhongOptions(lookupData),
    [lookupData],
  );

  const phongNoiOptions = useMemo(
    () => buildPhongNoiOptions(lookupData, selectedMaphong),
    [lookupData, selectedMaphong],
  );

  const tenSuCoList = useMemo(
    () => buildTenSuCoList(lookupData, selectedLoaiSuCo, currentTenSuCo),
    [lookupData, selectedLoaiSuCo, currentTenSuCo],
  );

  const tenSuCoSelectOptions = useMemo(
    () => [
      ...tenSuCoList.map((item) => ({
        value: item.tensucoyk ?? "",
        label: String(item.tensucoyk ?? ""),
      })),
    ],
    [tenSuCoList],
  );

  const onSubmit = useCallback(
    async (values: IncidentFormValues) => {
      const now = new Date();

      const ngayLap = toDate(values.ngayLapDate, values.ngayLapTime);
      if (ngayLap && ngayLap > now) {
        toast.error("Ngày lập không được vượt quá thời gian và ngày hiện tại!");
        return;
      }

      const ngaySuCo = toDate(values.ngaySuCoDate, values.ngaySuCoTime);
      if (ngaySuCo && ngaySuCo > now) {
        toast.error(
          "Ngày sự cố không được vượt quá thời gian và ngày hiện tại!",
        );
        return;
      }

      setIsSaving(true);

      const masuco = initialData?.sucoykhoa?.masuco ?? null;
      const payload = buildSavePayload(values);

      const result = await saveIncident(masuco, payload);
      setIsSaving(false);

      if (result.success && result.data?.masuco) {
        toast.success("Lưu thông tin sự cố thành công!");
        setIsEditing(false);
        router.push(`/incidents?masuco=${result.data.masuco}`);
      } else {
        toast.error(result.error ?? "Lưu không thành công. Vui lòng thử lại.");
      }
    },
    [initialData, router, setIsEditing, toast],
  );

  const onError = useCallback(() => {
    toast.error("Vui lòng kiểm tra và nhập đầy đủ các thông tin bắt buộc!");
  }, [toast]);

  // Đăng ký submit handler với Zustand Store
  useEffect(() => {
    registerSubmitHandler(() => {
      handleSubmit(onSubmit, onError)();
    });
    return () => {
      registerSubmitHandler(null);
    };
  }, [registerSubmitHandler, handleSubmit, onSubmit, onError]);

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    reset(buildDefaultValues(initialData, lookupData, date, time));
    setIsEditing(isNew);
    setDisableEditButton(isNew);

    if (isNew) {
      getPreviewSoSuCo().then((res) => {
        if (res.success && res.data?.sosuco) {
          setValue("sosuco", res.data.sosuco);
        }
      });
    }

    return () => {
      setDisableEditButton(false);
    };
  }, [
    initialData?.sucoykhoa?.masuco,
    lookupData,
    isNew,
    reset,
    setValue,
    setIsEditing,
    setDisableEditButton,
  ]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
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
        <div className="ql-form-header-field col-span-3">
          <span className="ql-field-label">Mã sự cố:</span>
          <input
            type="text"
            {...register("sosuco")}
            readOnly
            placeholder={isNew ? "Tự động" : ""}
            className="w-full font-bold bg-primary-light border border-[rgba(220,38,38,0.2)] text-primary-dark"
          />
        </div>

        <div className="ql-form-header-field col-span-5">
          <span className="ql-field-label">Ngày lập:</span>
          <div className="flex gap-1.5 items-center flex-1">
            <input
              type="date"
              {...register("ngayLapDate")}
              max={todayStr()}
              readOnly={!canEdit}
              disabled={!canEdit}
              className="w-full text-center bg-primary-light border border-[rgba(220,38,38,0.15)]"
              suppressHydrationWarning
            />
            <Controller
              name="ngayLapTime"
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

        <div className="ql-form-header-field col-span-4">
          <span className="ql-field-label">Hình thức:</span>
          <select
            {...register("mahinhthuc")}
            disabled={!canEdit}
            className="w-full"
          >
            {lookupData.hinhThuc.map((o) => (
              <option key={o.mahinhthuc} value={o.mahinhthuc.toString()}>
                {o.tenhinhthuc}
              </option>
            ))}
          </select>
        </div>

        <div className="ql-form-header-field col-span-12">
          <span className="ql-field-label">
            Loại sự cố <span className="text-red-500 font-bold">*</span>:
          </span>
          <FormFieldControl error={errors.maloaiscyk}>
            <Controller
              name="maloaiscyk"
              control={control}
              rules={{ required: "Vui lòng chọn loại sự cố" }}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={loaiSuCoOptions}
                  disabled={!canEdit}
                  error={!!errors.maloaiscyk}
                  placeholder="-- Chọn loại sự cố --"
                />
              )}
            />
          </FormFieldControl>
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
                <span className="ql-field-label w-15">
                  Mã KCB <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.makcb}>
                    <input
                      type="text"
                      {...register("makcb", {
                        required: "Vui lòng nhập mã KCB",
                      })}
                      readOnly={!canEdit}
                      className={errors.makcb ? "ql-input-error" : ""}
                    />
                  </FormFieldControl>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-17.5">
                  Họ và tên <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.hoten}>
                    <input
                      type="text"
                      {...register("hoten", {
                        required: "Vui lòng nhập họ và tên",
                      })}
                      readOnly={!canEdit}
                      className={errors.hoten ? "ql-input-error" : ""}
                    />
                  </FormFieldControl>
                </div>
              </div>
            </div>
            <div className="col-span-5">
              <div className="ql-field">
                <span className="ql-field-label w-20">
                  Khoa/phòng <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.maphong}>
                    <Controller
                      name="maphong"
                      control={control}
                      rules={{ required: "Vui lòng chọn khoa/phòng" }}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={phongOptions}
                          disabled={!canEdit}
                          error={!!errors.maphong}
                          placeholder="-- Chọn khoa/phòng --"
                        />
                      )}
                    />
                  </FormFieldControl>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-15">
                  Ngày sinh <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.ngaysinh}>
                    <input
                      type="date"
                      {...register("ngaysinh", {
                        required: "Vui lòng chọn ngày sinh",
                      })}
                      readOnly={!canEdit}
                      disabled={!canEdit}
                      className={errors.ngaysinh ? "ql-input-error" : ""}
                    />
                  </FormFieldControl>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-17.5">
                  Số bệnh án <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.sobenhan}>
                    <input
                      type="text"
                      {...register("sobenhan", {
                        required: "Vui lòng nhập số bệnh án",
                      })}
                      readOnly={!canEdit}
                      className={errors.sobenhan ? "ql-input-error" : ""}
                    />
                  </FormFieldControl>
                </div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-20">
                  Giới tính <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.maphai}>
                    <select
                      {...register("maphai", {
                        required: "Vui lòng chọn giới tính",
                      })}
                      disabled={!canEdit}
                      className={errors.maphai ? "ql-input-error" : ""}
                    >
                      <option value=""></option>
                      {lookupData.phai.map((o) => (
                        <option key={o.maphai} value={o.maphai.toString()}>
                          {o.phai}
                        </option>
                      ))}
                    </select>
                  </FormFieldControl>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-15">
                  Đối tượng <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.madoituongsc}>
                    <select
                      {...register("madoituongsc", {
                        required: "Vui lòng chọn đối tượng",
                      })}
                      disabled={!canEdit}
                      className={errors.madoituongsc ? "ql-input-error" : ""}
                    >
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
                  </FormFieldControl>
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
                <span className="ql-field-label">
                  Tên sự cố <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.tensuco}>
                    <Controller
                      name="tensuco"
                      control={control}
                      rules={{ required: "Vui lòng chọn tên sự cố" }}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={tenSuCoSelectOptions}
                          disabled={!canEdit}
                          error={!!errors.tensuco}
                          placeholder="-- Chọn tên sự cố --"
                        />
                      )}
                    />
                  </FormFieldControl>
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
                    max={todayStr()}
                    readOnly={!canEdit}
                    disabled={!canEdit}
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
                <span className="ql-field-label">
                  Khoa/phòng <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.maphongnoi}>
                    <Controller
                      name="maphongnoi"
                      control={control}
                      rules={{
                        required: "Vui lòng chọn khoa/phòng nơi xảy ra sự cố",
                      }}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={phongNoiOptions}
                          disabled={!canEdit}
                          error={!!errors.maphongnoi}
                          placeholder="-- Chọn khoa/phòng nơi xảy ra sự cố --"
                        />
                      )}
                    />
                  </FormFieldControl>
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
              <div className="ql-field-label mb-1">
                Mô tả <span className="text-red-500 font-bold">*</span>:
              </div>
              <div className="ql-field-control">
                <FormFieldControl error={errors.mota}>
                  <textarea
                    rows={5}
                    {...register("mota", {
                      required: "Vui lòng nhập mô tả sự cố",
                    })}
                    readOnly={!canEdit}
                    className={errors.mota ? "ql-input-error" : ""}
                  />
                </FormFieldControl>
              </div>
            </div>
            <div className="col-span-6">
              <div className="ql-field-label mb-1">
                Đề xuất giải pháp{" "}
                <span className="text-red-500 font-bold">*</span>:
              </div>
              <div className="ql-field-control">
                <FormFieldControl error={errors.giaiphapdexuat}>
                  <textarea
                    rows={5}
                    {...register("giaiphapdexuat", {
                      required: "Vui lòng nhập đề xuất giải pháp",
                    })}
                    readOnly={!canEdit}
                    className={errors.giaiphapdexuat ? "ql-input-error" : ""}
                  />
                </FormFieldControl>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field-label mb-1">
                Xử lý ban đầu <span className="text-red-500 font-bold">*</span>:
              </div>
              <div className="ql-field-control">
                <FormFieldControl error={errors.xulybandau}>
                  <textarea
                    rows={4}
                    {...register("xulybandau", {
                      required: "Vui lòng nhập xử lý ban đầu",
                    })}
                    readOnly={!canEdit}
                    className={errors.xulybandau ? "ql-input-error" : ""}
                  />
                </FormFieldControl>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field">
                <span className="ql-field-label w-27.5">Nguyên nhân gốc:</span>
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
              {NOTIFICATION_FIELDS.map(({ name, label }) => (
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
                  Phân loại ban đầu về sự cố{" "}
                  <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.phanloaibandau}>
                    <select
                      {...register("phanloaibandau", {
                        required: "Vui lòng chọn phân loại ban đầu về sự cố",
                      })}
                      disabled={!canEdit}
                      className={errors.phanloaibandau ? "ql-input-error" : ""}
                    >
                      <option value=""></option>
                      {lookupData.phanLoaiBanDau?.map((o) => (
                        <option
                          key={o.maphanloai}
                          value={o.maphanloai.toString()}
                        >
                          {o.tenphanloai}
                        </option>
                      ))}
                    </select>
                  </FormFieldControl>
                </div>
              </div>

              <div className="ql-field">
                <span className="ql-field-label w-85 text-xs">
                  Đánh giá ban đầu về mức độ ảnh hưởng của sự cố{" "}
                  <span className="text-red-500 font-bold">*</span>:
                </span>
                <div className="ql-field-control">
                  <FormFieldControl error={errors.danhgiabandau}>
                    <select
                      {...register("danhgiabandau", {
                        required:
                          "Vui lòng chọn đánh giá ban đầu về mức độ ảnh hưởng",
                      })}
                      disabled={!canEdit}
                      className={errors.danhgiabandau ? "ql-input-error" : ""}
                    >
                      <option value=""></option>
                      {lookupData.danhGiaBanDau?.map((o) => (
                        <option
                          key={o.madanhgia}
                          value={o.madanhgia.toString()}
                        >
                          {o.mamucdo
                            ? `${o.mamucdo} - ${o.tendanhgia}`
                            : o.tendanhgia}
                        </option>
                      ))}
                    </select>
                  </FormFieldControl>
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
