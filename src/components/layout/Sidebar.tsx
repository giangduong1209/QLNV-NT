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
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { getSuCoList, getSuCoDetail } from "@/actions/incidents";
import { getLookupData } from "@/actions/lookup";
import type {
  SuCoListItem,
  SelectOption,
  SidebarFilterFormValues,
} from "@/types";
import {
  formatDate,
  todayStr,
  toDateStr,
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

  // Tự động kiểm tra và đồng bộ bộ lọc khi activeMasuco trên URL chưa có trong danh sách Sidebar
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

      // 1. Kiểm tra trạng thái phân tích: nếu sự cố mới chưa phân tích mà bộ lọc đang chọn DA_PHAN_TICH
      if (!phantich && currentValues.trangThai === "DA_PHAN_TICH") {
        updatedValues.trangThai = "TAT_CA";
        shouldUpdateFilter = true;
      }

      // 2. Kiểm tra khoảng ngày: nếu ngaysuco nằm ngoài khoảng tuNgay - denNgay
      if (incident.ngaysuco) {
        const incidentDateStr = toDateStr(incident.ngaysuco);
        if (
          currentValues.tuNgayDate &&
          incidentDateStr < currentValues.tuNgayDate
        ) {
          updatedValues.tuNgayDate = incidentDateStr;
          shouldUpdateFilter = true;
        }
        if (
          currentValues.denNgayDate &&
          incidentDateStr > currentValues.denNgayDate
        ) {
          updatedValues.denNgayDate = incidentDateStr;
          shouldUpdateFilter = true;
        }
      }

      // 3. Kiểm tra khoa/phòng: nếu đang lọc theo 1 khoa khác khoa của sự cố mới
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
      } else {
        fetchList(currentValues);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeMasuco, suCoList, getValues, reset, fetchList]);

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
            <input
              type="date"
              {...register("tuNgayDate")}
              className="flex-1"
              suppressHydrationWarning
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
            <input
              type="date"
              {...register("denNgayDate")}
              className="flex-1"
              suppressHydrationWarning
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
          <button type="submit" className="ql-sidebar-btn" disabled={isPending}>
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
                  {isPending
                    ? "Đang tải..."
                    : hasSearched
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
