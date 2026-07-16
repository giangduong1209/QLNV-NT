"use client";

import { useState, useEffect } from "react";
import { TimePicker } from "@/components/ui/TimePicker";

export function Sidebar() {
  const [phanTich, setPhanTich] = useState("Chưa phân tích");
  const [tuNgayDate, setTuNgayDate] = useState("");
  const [tuNgayTime, setTuNgayTime] = useState("");
  const [denNgayDate, setDenNgayDate] = useState("");
  const [denNgayTime, setDenNgayTime] = useState("");
  const [khoaPhong, setKhoaPhong] = useState("");

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    setTuNgayDate(today);
    setTuNgayTime("00:00");
    setDenNgayDate(today);
    setDenNgayTime("23:59");
  }, []);

  const mockIncidents = [
    { code: "SC26000001", name: "Nguyễn Văn A", date: "14/07/2026" },
    { code: "SC26000002", name: "Trần Thị B", date: "13/07/2026" },
    { code: "SC26000003", name: "Lê Văn C", date: "12/07/2026" },
  ];

  return (
    <div className="ql-sidebar">
      {/* Filters block */}
      <div className="ql-sidebar-filters">
        <div className="ql-sidebar-row">
          <div className="ql-sidebar-label">Phân tích</div>
          <div className="ql-sidebar-control">
            <select value={phanTich} onChange={(e) => setPhanTich(e.target.value)}>
              <option value="Chưa phân tích">Chưa phân tích</option>
              <option value="Đã phân tích">Đã phân tích</option>
              <option value="Tất cả">Tất cả</option>
            </select>
          </div>
        </div>

        <div className="ql-sidebar-row flex-col !items-start gap-2">
          <div className="ql-sidebar-label">Từ ngày</div>
          <div className="flex gap-2 w-full items-center">
            <span className="text-xs w-[30px] text-slate-400 font-semibold">Từ</span>
            <input type="date" value={tuNgayDate} onChange={(e) => setTuNgayDate(e.target.value)} className="flex-1" />
            <TimePicker value={tuNgayTime} onChange={setTuNgayTime} size="sm" />
          </div>
          <div className="flex gap-2 w-full items-center">
            <span className="text-xs w-[30px] text-slate-400 font-semibold">Đến</span>
            <input type="date" value={denNgayDate} onChange={(e) => setDenNgayDate(e.target.value)} className="flex-1" />
            <TimePicker value={denNgayTime} onChange={setDenNgayTime} size="sm" />
          </div>
        </div>

        <div className="ql-sidebar-row">
          <div className="ql-sidebar-label">K.phòng</div>
          <div className="ql-sidebar-control">
            <select value={khoaPhong} onChange={(e) => setKhoaPhong(e.target.value)}>
              <option value="">-- Chọn khoa/phòng --</option>
              <option value="Cấp cứu">Khoa Cấp cứu</option>
              <option value="Nội tổng hợp">Khoa Nội tổng hợp</option>
              <option value="Ngoại tổng hợp">Khoa Ngoại tổng hợp</option>
              <option value="Sản">Khoa Sản</option>
              <option value="Nhi">Khoa Nhi</option>
            </select>
          </div>
        </div>

        <div className="ql-sidebar-btn-row">
          <button className="ql-sidebar-btn">
            <span>⇄</span> Nạp
          </button>
        </div>
      </div>

      {/* Incident List Table */}
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
            {mockIncidents.map((inc) => (
              <tr key={inc.code}>
                <td>{inc.code}</td>
                <td>{inc.name}</td>
                <td>{inc.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
