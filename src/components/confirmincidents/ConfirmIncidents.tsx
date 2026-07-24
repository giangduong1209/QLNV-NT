"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TimePicker } from "../ui/TimePicker";
import { useToast } from "../ui/ToastProvider";
import { useEditMode, DASHBOARD_FORM_ID } from "@/lib/edit-mode-context";
import { saveAnalysisIncident } from "@/actions/incidents";
import type { LookupData, SuCoDetail, ConfirmForm } from "@/types";
import { buildPhongOptions } from "../incidents/incident-form.helpers";
import { MultiSelect } from "../ui/MultiSelect";
import { toDate, toNullableString, checkIsAdmin } from "@/utils";
import {
  CAUSES_LEFT_DEFAULT,
  CAUSES_RIGHT_DEFAULT,
  INJURY_FIELDS,
} from "./confirm-incidents.constants";
import {
  buildDefaultValues,
  buildCauseItemsFromLookup,
  type ResolvedCauseItem,
} from "./confirm-incidents.helpers";

interface ConfirmIncidentsProps {
  initialData: SuCoDetail | null;
  lookupData: LookupData;
  userRole?: string;
}

export const ConfirmIncidents = ({
  initialData,
  lookupData,
  userRole,
}: ConfirmIncidentsProps) => {
  const router = useRouter();
  const toast = useToast();
  const {
    isEditing,
    setIsEditing,
    setDisableEditButton,
    setDisableApproveButton,
  } = useEditMode();
  const [isSaving, setIsSaving] = useState(false);

  const suco = initialData?.sucoykhoa;
  const phanTich = initialData?.phantichsuco;

  const { control, register, reset, handleSubmit } = useForm<ConfirmForm>({
    defaultValues: buildDefaultValues(suco, phanTich),
  });

  const phongOptions = useMemo(
    () => buildPhongOptions(lookupData),
    [lookupData],
  );

  const causesLeft = useMemo(
    () => buildCauseItemsFromLookup(CAUSES_LEFT_DEFAULT, lookupData),
    [lookupData],
  );

  const causesRight = useMemo(
    () => buildCauseItemsFromLookup(CAUSES_RIGHT_DEFAULT, lookupData),
    [lookupData],
  );

  // Reset form khi initialData thay đổi
  useEffect(() => {
    reset(buildDefaultValues(suco, phanTich));
  }, [initialData, reset, suco, phanTich]);

  const daPhanTich = !!phanTich;
  const daDuyet = !!phanTich?.duyet;
  const isAdmin = checkIsAdmin(userRole);

  // Sự cố chưa phân tích (!daPhanTich) -> disable nút "Sửa"
  // Sự cố đã duyệt (daDuyet) -> disable nút "Duyệt"
  useEffect(() => {
    setDisableEditButton(!daPhanTich);
    setDisableApproveButton(daDuyet);
    return () => {
      setDisableEditButton(false);
      setDisableApproveButton(false);
    };
  }, [daPhanTich, daDuyet, setDisableEditButton, setDisableApproveButton]);

  // Khi sự cố chưa phân tích (!daPhanTich): tự động enable ô nhập sẵn theo quyền mà không cần bấm Sửa trước
  // Khi sự cố đã phân tích (daPhanTich): disable theo mặc định, bấm Sửa (isEditing) mới enable
  const canEditGeneral = !daPhanTich || isEditing;
  const canEditExpert = isAdmin && (!daPhanTich || isEditing);

  const onSubmit = async (
    values: ConfirmForm,
    e?: React.BaseSyntheticEvent,
  ) => {
    if (!suco?.masuco) {
      toast.error("Vui lòng chọn một sự cố để thực hiện phân tích/duyệt.");
      return;
    }

    const nativeEvent = e?.nativeEvent as SubmitEvent | undefined;
    const submitter = nativeEvent?.submitter as HTMLButtonElement | undefined;
    const isApprove = submitter?.value === "approve";

    setIsSaving(true);

    const ptNgay = toDate(values.pt_ngayDate, values.pt_ngayTime);

    const payload = {
      ngay: ptNgay,
      mota: toNullableString(values.pt_mota),
      kythuat: toNullableString(values.kythuat),
      nhiemkhuan: toNullableString(values.nhiemkhuan),
      thuoc: toNullableString(values.thuoc),
      mau: toNullableString(values.mau),
      thietbiyte: toNullableString(values.thietbiyte),
      hanhvi: toNullableString(values.hanhvi),
      tainan: toNullableString(values.tainan),
      hatang: toNullableString(values.hatang),
      nguonluc: toNullableString(values.nguonluc),
      tailieu: toNullableString(values.tailieu),
      ptkhac: toNullableString(values.ptkhac),
      ylenh: toNullableString(values.ylenh),
      nnnnhanvien: toNullableString(values.nnnnhanvien),
      nnnnguoibenh: toNullableString(values.nnnnguoibenh),
      nnnmoitruong: toNullableString(values.nnnmoitruong),
      nnntochuc: toNullableString(values.nnntochuc),
      nnnbenngoai: toNullableString(values.nnnbenngoai),
      nnnkhac: toNullableString(values.nnnkhac),
      khacphucsuco: toNullableString(values.khacphucsuco),
      dexuat: toNullableString(values.dexuat),
      chuyengiadanhgia: toNullableString(values.chuyengiadanhgia),
      cgthaoluan: toNullableString(values.cgthaoluan),
      phuhop: toNullableString(values.phuhop),
      khuyencao: toNullableString(values.khuyencao),
      tt_NC0: values.tt_NC0,
      tt_NC1: toNullableString(values.tt_NC1),
      tt_NC2: toNullableString(values.tt_NC2),
      tt_NC3: toNullableString(values.tt_NC3),
      tttochuc: toNullableString(values.tttochuc),
    };

    const result = await saveAnalysisIncident(suco.masuco, payload, isApprove);
    setIsSaving(false);

    if (result.success) {
      toast.success(
        isApprove
          ? "Duyệt thông tin sự cố thành công!"
          : "Lưu kết quả phân tích sự cố thành công!",
      );
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(
        result.error ?? "Thao tác không thành công. Vui lòng thử lại.",
      );
    }
  };

  // ── Render nguyên nhân ─────────────────────────────────────────────────────
  const renderCauseRow = (causeItem: ResolvedCauseItem) => (
    <div
      key={causeItem.causeKey}
      className="flex items-center gap-2 mb-1.5 text-[13px]"
    >
      <span className="flex-1 min-w-0 font-bold text-slate-800">
        {causeItem.causeLabel}
      </span>
      <Controller
        name={causeItem.causeKey as keyof ConfirmForm}
        control={control}
        render={({ field }) => {
          const selectedOptionValue = (field.value as string) || "";
          const isChecked = Boolean(
            selectedOptionValue && selectedOptionValue !== "0",
          );

          const handleCheckboxChange = (
            e: React.ChangeEvent<HTMLInputElement>,
          ) => {
            if (e.target.checked) {
              const defaultFirstId = String(causeItem.subItems[0]?.id || 1);
              field.onChange(defaultFirstId);
            } else {
              field.onChange("");
            }
          };

          return (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                disabled={!canEditGeneral}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer disabled:opacity-50"
              />
              <MultiSelect
                value={selectedOptionValue}
                onChange={field.onChange}
                options={causeItem.subItems}
                totalMax={causeItem.maxOptionsCount}
                disabled={!canEditGeneral}
              />
            </div>
          );
        }}
      />
    </div>
  );

  // ── JSX ────────────────────────────────────────────────────────────────────
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

      {/* ── Thông tin chung ────────────────────────────────────────────────── */}
      <div className="ql-form-section">
        <div className="ql-form-section-body">
          {/* Mã sự cố */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-25">Mã sự cố:</span>
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
                <span className="ql-field-label w-25">Tên sự cố:</span>
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
                <span className="ql-field-label w-20">Ngày sự cố:</span>
                <div className="ql-field-control ql-datetime-row">
                  <input
                    type="date"
                    {...register("ngaySuCoDate")}
                    readOnly
                    suppressHydrationWarning
                  />
                  <Controller
                    name="ngaySuCoTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled
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
                <span className="ql-field-label w-25">Mã KCB:</span>
                <div className="ql-field-control">
                  <input type="text" {...register("makcb")} readOnly />
                </div>
              </div>
            </div>
            <div className="col-span-9">
              <div className="ql-field">
                <span className="ql-field-label w-25">Họ và tên:</span>
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
                <span className="ql-field-label w-25">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select {...register("maphong")} disabled>
                    {phongOptions.map((departmentOption) => (
                      <option
                        key={departmentOption.value}
                        value={departmentOption.value}
                      >
                        {departmentOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-25">Vị trí cụ thể:</span>
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
                  <input
                    type="date"
                    {...register("pt_ngayDate")}
                    disabled={!canEditGeneral}
                    suppressHydrationWarning
                  />
                  <Controller
                    name="pt_ngayTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!canEditGeneral}
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
                <textarea
                  rows={5}
                  {...register("pt_mota")}
                  disabled={!canEditGeneral}
                />
              </div>
            </div>
          </div>

          {/* Bảng nguyên nhân */}
          <div className="grid grid-cols-12 gap-2">
            {/* Cột trái */}
            <div className="col-span-6">
              {causesLeft.map((causeItem) => renderCauseRow(causeItem))}
              <div className="ql-field">
                <span className="ql-field-label w-10 font-bold">Khác:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("ptkhac")}
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="col-span-6">
              <div className="ql-field mb-2">
                <span className="ql-field-label w-10 font-bold">Y lệnh:</span>
                <div className="ql-field-control">
                  <textarea
                    rows={3}
                    {...register("ylenh")}
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>

              {causesRight.map((causeItem) => renderCauseRow(causeItem))}

              <div className="ql-field mb-2">
                <span className="ql-field-label w-10 font-bold">Khác:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("nnnkhac")}
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>

              <div>
                <span className="ql-field-label font-bold">
                  Khắc phục sự cố
                </span>
                <div className="ql-field-control">
                  <textarea
                    rows={3}
                    {...register("khacphucsuco")}
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>
              <div className="mt-2">
                <div className="ql-field-label font-bold">
                  Đề xuất khuyến cáo
                </div>
                <div className="ql-field-control">
                  <textarea
                    rows={3}
                    {...register("dexuat")}
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Đánh giá chuyên gia */}
      <div className="ql-form-section mt-6">
        <div className="ql-form-section-header">
          <span>ĐÁNH GIÁ CỦA CHUYÊN GIA</span>
        </div>
        <div className="ql-form-section-body">
          <div className="grid grid-cols-12 gap-4 my-6">
            <div className="col-span-12">
              <div className="ql-field">
                <div className="ql-field-label w-47.5 font-bold">
                  Đánh giá của chuyên gia:
                </div>
                <div className="ql-field-control">
                  <textarea
                    rows={5}
                    {...register("chuyengiadanhgia")}
                    disabled={!canEditExpert}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Thảo luận / Phù hợp */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label font-bold">
                  Đã thảo luận đưa ra khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("cgthaoluan")}
                    disabled={!canEditExpert}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-47.5 font-bold">
                  Phù hợp với các khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("phuhop")}
                    disabled={!canEditExpert}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-47.5 font-bold">
                  Cụ thể khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    {...register("khuyencao")}
                    disabled={!canEditExpert}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tổn thương NC0 */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field">
                <div className="ql-field-label w-47.5 font-bold">
                  Tổn thương trên người bệnh:
                </div>
                <div className="ql-field-control">
                  <input
                    type="checkbox"
                    {...register("tt_NC0")}
                    disabled={!canEditExpert}
                    className="disabled:opacity-50 cursor-pointer"
                  />
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
                  <span className="ql-field-label w-47.5 font-bold">
                    {label}
                  </span>
                  <div className="ql-field-control">
                    <input
                      type="text"
                      {...register(field)}
                      disabled={!canEditExpert}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
