"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { TimePicker } from "@/components/ui/TimePicker";
import { getSuCoList } from "@/actions/incidents";
import { getLookupData } from "@/actions/lookup";
import { KHOA_PHONG_MAP } from "@/types";
import type {
  SuCoListItem,
  SelectOption,
  SidebarFilterFormValues,
  LookupData,
} from "@/types";
import { formatDate, todayStr } from "@/utils";

/**
 * Xây dựng danh sách tùy chọn Khoa & Phòng phân cấp từ LookupData.
 */
function buildDepartmentSelectOptions(lookupData: LookupData): SelectOption[] {
  const options: SelectOption[] = [];

  if (lookupData.phong?.length) {
    lookupData.phong.forEach((parentPhong) => {
      options.push({
        value: parentPhong.maphong.toString(),
        label: parentPhong.tenphong ?? `Khoa/Phòng ${parentPhong.maphong}`,
      });
    });
  }

  // Fallback nếu CSDL chưa khởi tạo dữ liệu phòng khoa
  if (options.length === 0) {
    Object.entries(KHOA_PHONG_MAP).forEach(([ma, ten]) => {
      options.push({ value: ma, label: ten });
    });
  }

  return options;
}

function SidebarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const masucoParam = searchParams.get("masuco");
  const activeMasuco = masucoParam ? parseInt(masucoParam, 10) : null;

  const [isPending, startTransition] = useTransition();
  const [suCoList, setSuCoList] = useState<SuCoListItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([]);

  const { register, handleSubmit, watch, setValue } = useForm<SidebarFilterFormValues>({
    defaultValues: {
      trangThai: "TAT_CA",
      tuNgayDate: todayStr(),
      tuNgayTime: "00:00",
      denNgayDate: todayStr(),
      denNgayTime: "23:59",
      maphong: "",
    },
  });

  const tuNgayTime = watch("tuNgayTime");
  const denNgayTime = watch("denNgayTime");

  // Nạp danh mục Khoa & Phòng động từ CSDL
  useEffect(() => {
    let isMounted = true;
    getLookupData()
      .then((data) => {
        if (isMounted) {
          setDepartmentOptions(buildDepartmentSelectOptions(data));
        }
      })
      .catch((err) => {
        console.error("[Sidebar] Lỗi nạp danh mục Khoa Phòng:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = (values: SidebarFilterFormValues) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await getSuCoList({
        trangThai: values.trangThai,
        tuNgay: values.tuNgayDate,
        tuNgayTime: values.tuNgayTime,
        denNgay: values.denNgayDate,
        denNgayTime: values.denNgayTime,
        maphong: values.maphong ? parseInt(values.maphong, 10) : undefined,
      });

      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSuCoList(result.data ?? []);
      }
    });
  };

  const handleRowClick = (masuco: number) => {
    router.push(`/dashboard?masuco=${masuco}`);
  };

  return (
    <div className="ql-sidebar">
      <form onSubmit={handleSubmit(onSubmit)} className="ql-sidebar-filters">
        <div className="ql-sidebar-row">
          <div className="ql-sidebar-label">Phân tích</div>
          <div className="ql-sidebar-control">
            <select {...register("trangThai")}>
              <option value="TAT_CA">Tất cả</option>
              <option value="CHUA_PHAN_TICH">Chưa phân tích</option>
              <option value="DA_PHAN_TICH">Đã phân tích</option>
            </select>
          </div>
        </div>

        <div className="ql-sidebar-row">
          <div className="ql-sidebar-label">Từ ngày</div>
          <div className="ql-sidebar-control flex gap-2 items-center">
            <input type="date" {...register("tuNgayDate")} className="flex-1" />
            <TimePicker
              value={tuNgayTime}
              onChange={(v) => setValue("tuNgayTime", v)}
              size="sm"
            />
          </div>
        </div>

        <div className="ql-sidebar-row">
          <div className="ql-sidebar-label">Đến ngày</div>
          <div className="ql-sidebar-control flex gap-2 items-center">
            <input type="date" {...register("denNgayDate")} className="flex-1" />
            <TimePicker
              value={denNgayTime}
              onChange={(v) => setValue("denNgayTime", v)}
              size="sm"
            />
          </div>
        </div>

        <div className="ql-sidebar-row">
          <div className="ql-sidebar-label">K.phòng</div>
          <div className="ql-sidebar-control">
            <select {...register("maphong")}>
              <option value="">Tất cả khoa phòng</option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ql-sidebar-btn-row">
          <button
            type="submit"
            className="ql-sidebar-btn"
            disabled={isPending}
          >
            {isPending ? "Đang tải..." : "Nạp"}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          {errorMsg}
        </div>
      )}

      <div className="ql-sidebar-list-container">
        <table className="ql-sidebar-list-table">
          <thead>
            <tr>
              <th>Mã SC</th>
              <th>Họ tên</th>
              <th>Ngày SC</th>
            </tr>
          </thead>
          <tbody>
            {suCoList.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center text-slate-400 italic py-6"
                >
                  {isPending ? "Đang tải..." : "Nhấn Nạp để tìm kiếm"}
                </td>
              </tr>
            ) : (
              suCoList.map((inc) => (
                <tr
                  key={inc.masuco}
                  className={activeMasuco === inc.masuco ? "active" : ""}
                  onClick={() => handleRowClick(inc.masuco)}
                  title={inc.daPhanTich ? "Đã phân tích" : "Chưa phân tích"}
                  style={{ cursor: "pointer" }}
                >
                  <td>{inc.sosuco ?? String(inc.masuco)}</td>
                  <td>{inc.hoten ?? "—"}</td>
                  <td>{formatDate(inc.ngaysuco)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <Suspense
      fallback={
        <div className="ql-sidebar">
          <div className="text-slate-400 text-xs py-4">Đang tải danh sách...</div>
        </div>
      }
    >
      <SidebarContent />
    </Suspense>
  );
}
