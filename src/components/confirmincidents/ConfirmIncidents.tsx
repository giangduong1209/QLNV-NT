"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { TimePicker } from "../ui/TimePicker";
import type { LookupData, SuCoDetail, ConfirmForm } from "@/types";
import { buildPhongOptions } from "../incidents/incident-form.helpers";
import { MultiSelect } from "../ui/MultiSelect";
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
}

export const ConfirmIncidents = ({
  initialData,
  lookupData,
}: ConfirmIncidentsProps) => {
  const suco = initialData?.sucoykhoa;
  const phanTich = initialData?.phantichsuco;

  const { control, register, reset, watch } = useForm<ConfirmForm>({
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

  // Reset form khi initialData thay đổi (người dùng click dòng khác)
  useEffect(() => {
    reset(buildDefaultValues(suco, phanTich));
  }, [initialData, reset, suco, phanTich]);

  const daPhanTich = !!phanTich;

  // ── Render nguyên nhân ─────────────────────────────────────────────────────
  const renderCauseRow = (causeItem: ResolvedCauseItem) => (
    <div key={causeItem.causeKey} className="flex items-center gap-2 mb-1.5 text-[13px]">
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
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <MultiSelect
                value={selectedOptionValue}
                onChange={field.onChange}
                options={causeItem.subItems}
                totalMax={causeItem.maxOptionsCount}
              />
            </div>
          );
        }}
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
                  <input type="date" {...register("ngaySuCoDate")} readOnly />
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
              {causesLeft.map((causeItem) => renderCauseRow(causeItem))}
              <div className="ql-field">
                <span className="ql-field-label w-10">Khác:</span>
                <div className="ql-field-control">
                  <input type="text" {...register("ptkhac")} />
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="col-span-6">
              <div className="ql-field mb-2">
                <span className="ql-field-label w-10">Y lệnh:</span>
                <div className="ql-field-control">
                  <textarea rows={3} {...register("ylenh")} />
                </div>
              </div>

              {causesRight.map((causeItem) => renderCauseRow(causeItem))}

              <div className="ql-field mb-2">
                <span className="ql-field-label w-10">Khác:</span>
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
          <div className="ql-form-section mt-6">
            <div className="ql-form-section-header">
              <span>ĐÁNH GIÁ CỦA CHUYÊN GIA</span>
            </div>
            <div className="ql-form-section-body">
              <div className="grid grid-cols-12 gap-4 my-6">
                <div className="col-span-12">
                  <div className="ql-field">
                    <div className="ql-field-label w-47.5">
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
                    <span className="ql-field-label w-47.5">
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
                    <span className="ql-field-label w-47.5">
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
                    <div className="ql-field-label w-47.5">
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
                      <span className="ql-field-label w-47.5">{label}</span>
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
      </div>
    </div>
  );
};
