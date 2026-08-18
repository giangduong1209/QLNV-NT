"use client";

import {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useMemo,
  Suspense,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TimePicker } from "@/components/ui/TimePicker";
import { DatePicker } from "@/components/ui/DatePicker";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { getSuCoList, getSuCoDetail } from "@/actions/incidents";
import { getLookupData } from "@/actions/lookup";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  SuCoListItem,
  SelectOption,
  SidebarFilterFormValues,
} from "@/types";
import {
  formatDate,
  todayStr,
  toDate,
  buildDepartmentSelectOptions,
} from "@/utils";
import { FILTER_STORAGE_KEY } from "@/constants/app";

function SidebarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const masucoParam = searchParams.get("masuco");
  const activeMasuco = masucoParam ? parseInt(masucoParam, 10) : null;

  const [isPending, startTransition] = useTransition();
  const [suCoList, setSuCoList] = useState<SuCoListItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>(
    [],
  );

  const { register, handleSubmit, watch, setValue, getValues, reset, control } =
    useForm<SidebarFilterFormValues>({
      defaultValues: {
        trangThai: "TAT_CA",
        tuNgayDate: "", // Đặt rỗng cho SSR để tránh hydration mismatch; useEffect sẽ gán ngày hôm nay sau khi mount
        tuNgayTime: "00:00",
        denNgayDate: "", // Đặt rỗng cho SSR để tránh hydration mismatch; useEffect sẽ gán ngày hôm nay sau khi mount
        denNgayTime: "23:59",
        maphong: "",
      },
    });

  const tuNgayTime = watch("tuNgayTime");
  const denNgayTime = watch("denNgayTime");

  const departmentSelectOptions = useMemo(
    () => [{ value: "", label: "Tất cả khoa phòng" }, ...departmentOptions],
    [departmentOptions],
  );

  const fetchList = useCallback((values: SidebarFilterFormValues) => {
    setErrorMsg(null);

    // Lưu bộ lọc hiện tại vào sessionStorage để duy trì khi refresh trang (F5)
    try {
      sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(values));
    } catch (e) {
      console.error("Lỗi khi ghi sessionStorage:", e);
    }

    startTransition(async () => {
      const result = await getSuCoList({
        trangThai: values.trangThai,
        tuNgay: values.tuNgayDate,
        tuNgayTime: values.tuNgayTime,
        denNgay: values.denNgayDate,
        denNgayTime: values.denNgayTime,
        maphong: values.maphong ? parseInt(values.maphong, 10) : undefined,
      });

      setHasSearched(true);

      if (result.error) {
        setErrorMsg(result.error);
        setSuCoList([]);
      } else {
        const list = result.data ?? [];
        setSuCoList(list);
      }
    });
  }, []);

  // Nạp danh mục Khoa & Phòng động và khôi phục bộ lọc từ sessionStorage khi mount
  useEffect(() => {
    let isMounted = true;

    // Đặt ngày hôm nay làm mặc định (chỉ chạy ở phía Client sau mount -> tránh hydration mismatch)
    // Khôi phục bộ lọc đã lưu từ sessionStorage (nếu có sẽ ghi đè)
    let initialValues: SidebarFilterFormValues = {
      ...getValues(),
      tuNgayDate: todayStr(),
      denNgayDate: todayStr(),
    };
    try {
      const saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (parsed.tuNgayDate) {
            parsed.tuNgayDate = formatDate(parsed.tuNgayDate);
          }
          if (parsed.denNgayDate) {
            parsed.denNgayDate = formatDate(parsed.denNgayDate);
          }
          initialValues = { ...initialValues, ...parsed };
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc bộ lọc từ sessionStorage:", e);
    }
    reset(initialValues);

    getLookupData()
      .then((data) => {
        if (isMounted) {
          setDepartmentOptions(buildDepartmentSelectOptions(data));
        }
      })
      .catch((err) => {
        console.error("[Sidebar] Lỗi nạp danh mục Khoa Phòng:", err);
      });

    fetchList(initialValues);

    return () => {
      isMounted = false;
    };
  }, [fetchList, getValues, reset]);

  // Tự động kiểm tra và đồng bộ bộ lọc khi người dùng truy cập trực tiếp URL có ?masuco
  useEffect(() => {
    if (!activeMasuco) return;

    const isAlreadyInList = suCoList.some(
      (item) => item.masuco === activeMasuco,
    );
    if (isAlreadyInList) return;

    let isMounted = true;
    getSuCoDetail(activeMasuco).then((res) => {
      if (!isMounted || !res.success || !res.data?.sucoykhoa) return;

      const incident = res.data.sucoykhoa;
      const phantich = res.data.phantichsuco;

      const currentValues = getValues();
      let shouldUpdateFilter = false;
      const updatedValues = { ...currentValues };

      // 1. Kiểm tra trạng thái phân tích: nếu sự cố chưa phân tích mà bộ lọc đang chọn DA_PHAN_TICH
      if (!phantich && currentValues.trangThai === "DA_PHAN_TICH") {
        updatedValues.trangThai = "TAT_CA";
        shouldUpdateFilter = true;
      }

      // 2. Kiểm tra khoảng ngày bằng đối tượng Date chính xác
      if (incident.ngaysuco) {
        const incidentDate = new Date(incident.ngaysuco);
        const filterStart = toDate(currentValues.tuNgayDate, currentValues.tuNgayTime || "00:00");
        const filterEnd = toDate(currentValues.denNgayDate, currentValues.denNgayTime || "23:59", true);

        if (filterStart && incidentDate < filterStart) {
          updatedValues.tuNgayDate = formatDate(incidentDate);
          shouldUpdateFilter = true;
        }
        if (filterEnd && incidentDate > filterEnd) {
          updatedValues.denNgayDate = formatDate(incidentDate);
          shouldUpdateFilter = true;
        }
      }

      // 3. Kiểm tra khoa/phòng
      if (
        currentValues.maphong &&
        incident.maphong &&
        parseInt(currentValues.maphong, 10) !== incident.maphong
      ) {
        updatedValues.maphong = "";
        shouldUpdateFilter = true;
      }

      if (shouldUpdateFilter) {
        reset(updatedValues);
        fetchList(updatedValues);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeMasuco]);

  const onSubmit = (values: SidebarFilterFormValues) => {
    fetchList(values);
  };

  const handleRowClick = (masuco: number) => {
    router.push(`${pathname}?masuco=${masuco}`);
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
            <Controller
              name="tuNgayDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  size="sm"
                  placeholder="dd/mm/yyyy"
                  className="flex-1"
                />
              )}
            />
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
            <Controller
              name="denNgayDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  size="sm"
                  placeholder="dd/mm/yyyy"
                  className="flex-1"
                />
              )}
            />
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
            <Controller
              name="maphong"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={departmentSelectOptions}
                  placeholder="Tất cả khoa phòng"
                />
              )}
            />
          </div>
        </div>

        <div className="ql-sidebar-btn-row">
          <button type="submit" className="ql-sidebar-btn flex items-center justify-center gap-1.5" disabled={isPending}>
            {isPending && (
              <svg
                className="w-3.5 h-3.5 animate-spin text-primary-dark"
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
            )}
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
              <th className="w-[30%]">Mã SC</th>
              <th className="w-[38%]">Họ tên</th>
              <th className="w-[32%] text-center">Ngày SC</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-2">
                    <Skeleton className="h-3.5 w-16" />
                  </td>
                  <td className="py-2.5 px-2">
                    <Skeleton className="h-3.5 w-24" />
                  </td>
                  <td className="py-2.5 px-2">
                    <Skeleton className="h-3.5 w-14" />
                  </td>
                </tr>
              ))
            ) : suCoList.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center text-slate-400 italic py-6"
                >
                  {hasSearched
                    ? "Không tìm thấy dữ liệu"
                    : "Nhấn Nạp để tìm kiếm"}
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
                  <td className="truncate">{inc.sosuco ?? String(inc.masuco)}</td>
                  <td className="truncate">{inc.hoten ?? "—"}</td>
                  <td className="text-center font-medium text-xs">{formatDate(inc.ngaysuco)}</td>
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
          <div className="text-slate-400 text-xs py-4">
            Đang tải danh sách...
          </div>
        </div>
      }
    >
      <SidebarContent />
    </Suspense>
  );
}
