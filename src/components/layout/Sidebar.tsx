"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TimePicker } from "@/components/ui/TimePicker";
import { getSuCoList } from "@/actions/incidents";
import { KHOA_PHONG_MAP } from "@/lib/definitions";
import type { AnalysisStatus, SuCoListItem } from "@/lib/definitions";

type FilterForm = {
  trangThai: AnalysisStatus;
  tuNgayDate: string;
  tuNgayTime: string;
  denNgayDate: string;
  denNgayTime: string;
  maphong: string;
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function todayStr(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function Sidebar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [suCoList, setSuCoList] = useState<SuCoListItem[]>([]);
  const [selectedMaSuCo, setSelectedMaSuCo] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<FilterForm>({
    defaultValues: {
      trangThai: "CHUA_PHAN_TICH",
      tuNgayDate: todayStr(),
      tuNgayTime: "00:00",
      denNgayDate: todayStr(),
      denNgayTime: "23:59",
      maphong: "",
    },
  });

  const tuNgayTime = watch("tuNgayTime");
  const denNgayTime = watch("denNgayTime");

  const onSubmit = (values: FilterForm) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await getSuCoList({
        trangThai: values.trangThai,
        tuNgay: values.tuNgayDate,
        tuNgayTime: values.tuNgayTime,
        denNgay: values.denNgayDate,
        denNgayTime: values.denNgayTime,
        maphong: values.maphong ? parseInt(values.maphong) : undefined,
      });
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSuCoList(result.data);
        if (
          selectedMaSuCo &&
          !result.data.find((r) => r.masuco === selectedMaSuCo)
        ) {
          setSelectedMaSuCo(null);
        }
      }
    });
  };

  console.log({ suCoList });

  const handleRowClick = (masuco: number) => {
    setSelectedMaSuCo(masuco);
    router.push(`/incidents?masuco=${masuco}`);
  };

  return (
    <div className="ql-sidebar">
      <form onSubmit={handleSubmit(onSubmit)} className="ql-sidebar-filters">
        <div className="ql-sidebar-row">
          <div className="ql-sidebar-label">Phân tích</div>
          <div className="ql-sidebar-control">
            <select {...register("trangThai")}>
              <option value="CHUA_PHAN_TICH">Chưa phân tích</option>
              <option value="DA_PHAN_TICH">Đã phân tích</option>
              <option value="TAT_CA">Tất cả</option>
            </select>
          </div>
        </div>

        <div className="ql-sidebar-row flex-col !items-start gap-2">
          <div className="ql-sidebar-label">Từ ngày</div>
          <div className="flex gap-2 w-full items-center">
            <span className="text-xs w-[30px] text-slate-400 font-semibold">
              Từ
            </span>
            <input type="date" {...register("tuNgayDate")} className="flex-1" />
            <TimePicker
              value={tuNgayTime}
              onChange={(v) => setValue("tuNgayTime", v)}
              size="sm"
            />
          </div>
          <div className="flex gap-2 w-full items-center">
            <span className="text-xs w-[30px] text-slate-400 font-semibold">
              Đến
            </span>
            <input
              type="date"
              {...register("denNgayDate")}
              className="flex-1"
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
              <option value="">-- Tất cả --</option>
              {Object.entries(KHOA_PHONG_MAP).map(([ma, ten]) => (
                <option key={ma} value={ma}>
                  {ten}
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

        {errorMsg && (
          <div className="text-red-500 text-xs px-1 -mt-2">{errorMsg}</div>
        )}
      </form>

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
                  className={selectedMaSuCo === inc.masuco ? "active" : ""}
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
