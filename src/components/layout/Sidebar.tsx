"use client";

import {
  useState,
  useEffect,
  useCallback,
  useTransition,
  Suspense,
} from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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

const FILTER_STORAGE_KEY = "qlscyk_sidebar_filter";

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

  const { register, handleSubmit, watch, setValue, getValues, reset } =
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

  const fetchList = useCallback(
    (values: SidebarFilterFormValues) => {
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

          if (pathname === "/incidents" && list.length > 0 && !activeMasuco) {
            // Chỉ trên trang Duyệt (/incidents) mới mặc định chọn item đầu tiên nếu URL chưa có masuco
            router.push(`${pathname}?masuco=${list[0].masuco}`);
          }
        }
      });
    },
    [activeMasuco, pathname, router],
  );

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
