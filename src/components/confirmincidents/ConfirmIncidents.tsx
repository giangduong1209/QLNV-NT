"use client";
import { useState, useEffect } from "react";
import { TimePicker } from "../ui/TimePicker";

// ─── Dữ liệu tĩnh (dummy data) ──────────────────────────────────────────────

const KHOA_PHONG_OPTIONS = [
  { value: "", label: "" },
  { value: "cap-cuu", label: "Khoa Cấp cứu" },
  { value: "noi-tong-hop", label: "Khoa Nội tổng hợp" },
  { value: "ngoai-tong-hop", label: "Khoa Ngoại tổng hợp" },
  { value: "san", label: "Khoa Sản" },
  { value: "nhi", label: "Khoa Nhi" },
];

const THAO_LUAN_OPTIONS = [
  { value: "", label: "" },
  { value: "cap-cuu", label: "Khoa Cấp cứu" },
  { value: "noi-tong-hop", label: "Khoa Nội tổng hợp" },
  { value: "ngoai-tong-hop", label: "Khoa Ngoại tổng hợp" },
  { value: "san", label: "Khoa Sản" },
  { value: "nhi", label: "Khoa Nhi" },
];

const PHU_HOP_VOI_KHUYEN_CAO_OPTIONS = [
  { value: "", label: "" },
  { value: "cap-cuu", label: "Khoa Cấp cứu" },
  { value: "noi-tong-hop", label: "Khoa Nội tổng hợp" },
  { value: "ngoai-tong-hop", label: "Khoa Ngoại tổng hợp" },
  { value: "san", label: "Khoa Sản" },
  { value: "nhi", label: "Khoa Nhi" },
];

const TON_THUONG_NC1_OPTIONS = [
  { value: "", label: "" },
  { value: "cap-cuu", label: "Khoa Cấp cứu" },
  { value: "noi-tong-hop", label: "Khoa Nội tổng hợp" },
  { value: "ngoai-tong-hop", label: "Khoa Ngoại tổng hợp" },
  { value: "san", label: "Khoa Sản" },
  { value: "nhi", label: "Khoa Nhi" },
];

const TON_THUONG_NC2_OPTIONS = [
  { value: "", label: "" },
  { value: "cap-cuu", label: "Khoa Cấp cứu" },
  { value: "noi-tong-hop", label: "Khoa Nội tổng hợp" },
  { value: "ngoai-tong-hop", label: "Khoa Ngoại tổng hợp" },
  { value: "san", label: "Khoa Sản" },
  { value: "nhi", label: "Khoa Nhi" },
];

const TON_THUONG_NC3_OPTIONS = [
  { value: "", label: "" },
  { value: "cap-cuu", label: "Khoa Cấp cứu" },
  { value: "noi-tong-hop", label: "Khoa Nội tổng hợp" },
  { value: "ngoai-tong-hop", label: "Khoa Ngoại tổng hợp" },
  { value: "san", label: "Khoa Sản" },
  { value: "nhi", label: "Khoa Nhi" },
];

const TON_THUONG_TO_CHUC_OPTIONS = [
  { value: "", label: "" },
  { value: "cap-cuu", label: "Khoa Cấp cứu" },
  { value: "noi-tong-hop", label: "Khoa Nội tổng hợp" },
  { value: "ngoai-tong-hop", label: "Khoa Ngoại tổng hợp" },
  { value: "san", label: "Khoa Sản" },
  { value: "nhi", label: "Khoa Nhi" },
];

interface CauseItem {
  key: string;
  label: string;
  max: number;
}

const CAUSES_LEFT: CauseItem[] = [
  {
    key: "quyTrinh",
    label: "Thực hiện quy trình kỹ thuật, thủ thuật chuyên môn",
    max: 9,
  },
  { key: "nhiemKhuan", label: "Nhiễm khuẩn bệnh viện", max: 5 },
  { key: "thuoc", label: "Thuốc và dịch truyền", max: 9 },
  { key: "mau", label: "Máu và các chế phẩm máu", max: 3 },
  { key: "thietBi", label: "Thiết bị y tế", max: 3 },
  { key: "hanhVi", label: "Hành vi", max: 5 },
  { key: "taiNan", label: "Tai nạn đối với người bệnh", max: 1 },
  { key: "haTang", label: "Hạ tầng cơ sở", max: 2 },
  { key: "quanLy", label: "Quản lý nguồn lực, tổ chức", max: 3 },
  { key: "hoSo", label: "Hồ sơ, tài liệu, thủ tục hành chính", max: 6 },
];

const CAUSES_RIGHT: CauseItem[] = [
  { key: "nhanVien", label: "Nhân viên", max: 6 },
  { key: "nguoiBenh", label: "Người bệnh", max: 1 },
  { key: "moiTruong", label: "Môi trường làm việc", max: 4 },
  { key: "toChuc", label: "Tổ chức/ dịch vụ", max: 4 },
  { key: "yeuToNgoai", label: "Yếu tố bên ngoài", max: 3 },
];

// ─── Kiểu trạng thái nguyên nhân ────────────────────────────────────────────

type CauseState = { checked: boolean; val: string };
type CauseMap = Record<string, CauseState>;

function initCauseMap(items: CauseItem[]): CauseMap {
  return Object.fromEntries(
    items.map((c) => [c.key, { checked: false, val: "" }]),
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ConfirmIncidents = () => {
  const [maSuCo] = useState("SC26000001");
  const [ngayLapDate, setNgayLapDate] = useState("");
  const [ngayLapTime, setNgayLapTime] = useState("");

  // Thông tin sự cố
  const [tenSuCo, setTenSuCo] = useState("");
  const [ngaySuCoDate, setNgaySuCoDate] = useState("");
  const [ngaySuCoTime, setNgaySuCoTime] = useState("");
  const [maKCB, setMaKCB] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [khoaPhongSC, setKhoaPhongSC] = useState("");
  const [viTriCuThe, setViTriCuThe] = useState("");

  // Phân tích sự cố
  const [moTa, setMoTa] = useState("");
  const [causesLeft, setCausesLeft] = useState<CauseMap>(() =>
    initCauseMap(CAUSES_LEFT),
  );
  const [causeKhacLeft, setCauseKhacLeft] = useState("");
  const [yLenh, setYLenh] = useState("");
  const [causesRight, setCausesRight] = useState<CauseMap>(() =>
    initCauseMap(CAUSES_RIGHT),
  );
  const [causeKhacRight, setCauseKhacRight] = useState("");
  const [khacPhucSuCo, setKhacPhucSuCo] = useState("");
  const [deXuatKhuyenCao, setDeXuatKhuyenCao] = useState("");
  const [danhGiaChuyenGia, setDanhGiaChuyenGia] = useState("");
  const [thaoLuan, setThaoLuan] = useState("");
  const [phuHopVoiKhuyenCao, setPhuHopVoiKhuyenCao] = useState("");
  const [cuTheKhuyenCao, setCuTheKhuyenCao] = useState("");
  const [tonThuongNguoiBenh, setTonThuongNguoiBenh] = useState(false);
  const [tonThuongNC1, setTonThuongNC1] = useState("");
  const [tonThuongNC2, setTonThuongNC2] = useState("");
  const [tonThuongNC3, setTonThuongNC3] = useState("");
  const [tonThuongToChuc, setTonThuongToChuc] = useState("");

  // Khởi tạo ngày/giờ mặc định ở client để tránh hydration mismatch
  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    // setNgayLapDate(today);
    // setNgayLapTime(time);
    // setNgaySuCoDate(today);
    // setNgaySuCoTime(time);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setCauseLeft = (key: string, patch: Partial<CauseState>) =>
    setCausesLeft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const setCauseRight = (key: string, patch: Partial<CauseState>) =>
    setCausesRight((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  // ── Render nguyên nhân (dùng chung cho cả 2 cột) ─────────────────────────

  const renderCauseRow = (
    item: CauseItem,
    state: CauseState,
    onChange: (patch: Partial<CauseState>) => void,
  ) => (
    <div key={item.key} className="flex items-center gap-2 mb-1 text-[13px]">
      <input
        type="checkbox"
        checked={state.checked}
        onChange={(e) => onChange({ checked: e.target.checked })}
        className="w-3.5 h-3.5 shrink-0"
      />
      <span className="flex-1 min-w-0">{item.label}</span>
      <select
        value={state.val}
        onChange={(e) => onChange({ val: e.target.value })}
        className="w-[110px] text-xs px-0.5 py-px border border-[#bbb] rounded"
      >
        <option value="">Không chọn</option>
        {Array.from({ length: item.max }, (_, i) => i + 1).map((n) => (
          <option key={n} value={String(n)}>
            {n}
          </option>
        ))}
      </select>
      <span className="text-[#c00] text-xs whitespace-nowrap">
        0/{item.max}
      </span>
    </div>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div className="ql-form-container">
      {/* ── Section: Thông tin chung ─────────────────────────────────────── */}
      <div className="ql-form-section">
        <div className="ql-form-section-body">
          {/* Mã sự cố */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Mã sự cố:</span>
                <div className="ql-field-control">
                  <div className="ql-field-control-wrapper">
                    <input type="text" value={maSuCo} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tên sự cố + Ngày sự cố */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-5">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Tên sự cố:</span>
                <div className="ql-field-control">
                  <div className="ql-field-control-wrapper">
                    <input
                      type="text"
                      className="ql-input-with-addon"
                      value={tenSuCo}
                      onChange={(e) => setTenSuCo(e.target.value)}
                    />
                    <button className="ql-input-addon-btn">▼</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Ngày sự cố:</span>
                <div className="ql-field-control ql-datetime-row">
                  <input
                    type="date"
                    value={ngaySuCoDate}
                    onChange={(e) => setNgaySuCoDate(e.target.value)}
                  />
                  <TimePicker value={ngaySuCoTime} onChange={setNgaySuCoTime} />
                </div>
              </div>
            </div>
          </div>

          {/* Mã KCB + Họ và tên */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Mã KCB:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={maKCB}
                    onChange={(e) => setMaKCB(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-9">
              <div className="ql-field">
                <span className="ql-field-label w-[70px]">Họ và tên:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Khoa/phòng + Vị trí cụ thể */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select
                    value={khoaPhongSC}
                    onChange={(e) => setKhoaPhongSC(e.target.value)}
                  >
                    {KHOA_PHONG_OPTIONS.map((o) => (
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
                <span className="ql-field-label w-[80px]">Vị trí cụ thể:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={viTriCuThe}
                    onChange={(e) => setViTriCuThe(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Khoa/phòng SC */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field">
                <span className="ql-field-label w-[100px]">Khoa/phòng SC:</span>
                <div className="ql-field-control">
                  <select
                    value={khoaPhongSC}
                    onChange={(e) => setKhoaPhongSC(e.target.value)}
                  >
                    {KHOA_PHONG_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Phân tích sự cố ─────────────────────────────────────── */}
      <div className="ql-form-section">
        <div className="ql-form-section-header">
          <span>PHÂN TÍCH SỰ CỐ</span>
        </div>
        <div className="ql-form-section-body">
          {/* Ngày sự cố */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-6">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Ngày sự cố:</span>
                <div className="ql-field-control ql-datetime-row">
                  <input
                    type="date"
                    value={ngaySuCoDate}
                    onChange={(e) => setNgaySuCoDate(e.target.value)}
                  />
                  <TimePicker value={ngaySuCoTime} onChange={setNgaySuCoTime} />
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
                  rows={3}
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Bảng phân tích nguyên nhân */}
          <div className="grid grid-cols-12 gap-2">
            {/* Cột trái */}
            <div className="col-span-6">
              {CAUSES_LEFT.map((item) =>
                renderCauseRow(item, causesLeft[item.key], (patch) =>
                  setCauseLeft(item.key, patch),
                ),
              )}
              {/* Khác - cột trái */}
              <div className="ql-field">
                <span className="ql-field-label w-[40px]">Khác:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={causeKhacLeft}
                    onChange={(e) => setCauseKhacLeft(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="col-span-6">
              {/* Y lệnh */}
              <div className="ql-field mb-2">
                <span className="ql-field-label w-[40px]">Y lệnh:</span>
                <div className="ql-field-control">
                  <textarea
                    rows={2}
                    value={yLenh}
                    onChange={(e) => setYLenh(e.target.value)}
                  />
                </div>
              </div>

              {/* Nguyên nhân cột phải */}
              {CAUSES_RIGHT.map((item) =>
                renderCauseRow(item, causesRight[item.key], (patch) =>
                  setCauseRight(item.key, patch),
                ),
              )}

              {/* Khác - cột phải */}
              <div className="ql-field mb-2">
                <span className="ql-field-label w-[40px]">Khác:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={causeKhacRight}
                    onChange={(e) => setCauseKhacRight(e.target.value)}
                  />
                </div>
              </div>

              {/* Khắc phục sự cố */}
              <div>
                <span className="ql-field-label">Khắc phục sự cố</span>
                <div className="ql-field-control">
                  <textarea
                    rows={2}
                    value={khacPhucSuCo}
                    onChange={(e) => setKhacPhucSuCo(e.target.value)}
                  />
                </div>
              </div>
              {/* Đề xuất khuyến cáo */}
              <div className="mt-2">
                <div className="ql-field-label">Đề xuất khuyến cáo</div>
                <div className="ql-field-control">
                  <textarea
                    rows={2}
                    value={deXuatKhuyenCao}
                    onChange={(e) => setDeXuatKhuyenCao(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Phê duyệt của lãnh đạo */}
          {/* Đánh giá của chuyên gia */}
          <div className="grid grid-cols-12 gap-4 my-6">
            <div className="col-span-12">
              <div className="ql-field">
                <div className="ql-field-label w-[190px]">
                  Đánh giá của chuyên gia:
                </div>
                <div className="ql-field-control">
                  <textarea
                    rows={3}
                    value={danhGiaChuyenGia}
                    onChange={(e) => setDanhGiaChuyenGia(e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Đã thảo luận đưa ra khuyến cáo */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label">
                  Đã thảo luận đưa ra khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <select
                    value={thaoLuan}
                    onChange={(e) => setThaoLuan(e.target.value)}
                    disabled
                  >
                    {THAO_LUAN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* Phù hợp với các khuyến cáo */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Phù hợp với các khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <select
                    value={phuHopVoiKhuyenCao}
                    onChange={(e) => setPhuHopVoiKhuyenCao(e.target.value)}
                    disabled
                  >
                    {PHU_HOP_VOI_KHUYEN_CAO_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* Cụ thể khuyến cáo */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Cụ thể khuyến cáo:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={cuTheKhuyenCao}
                    onChange={(e) => setCuTheKhuyenCao(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Tổn thương trên người bệnh */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field">
                <div className="ql-field-label w-[190px]">
                  Tổn thương trên người bệnh:
                </div>
                <div className="ql-field-control">
                  <input
                    type="checkbox"
                    checked={tonThuongNguoiBenh}
                    onChange={(e) => setTonThuongNguoiBenh(e.target.checked)}
                  />
                  <span className="text-[13px] ml-2">Chưa xảy ra NC0(A)</span>
                </div>
              </div>
            </div>
          </div>
          {/* Tổn thương nhẹ NC1 */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Tổn thương nhẹ NC1:
                </span>
                <div className="ql-field-control">
                  <select
                    value={tonThuongNC1}
                    onChange={(e) => setTonThuongNC1(e.target.value)}
                    disabled
                  >
                    {TON_THUONG_NC1_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tổn thương trung bình NC2 */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Tổn thương trung bình NC2:
                </span>
                <div className="ql-field-control">
                  <select
                    value={tonThuongNC2}
                    onChange={(e) => setTonThuongNC2(e.target.value)}
                    disabled
                  >
                    {TON_THUONG_NC2_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tổn thương nặng NC3 */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Tổn thương nặng NC3:
                </span>
                <div className="ql-field-control">
                  <select
                    value={tonThuongNC3}
                    onChange={(e) => setTonThuongNC3(e.target.value)}
                    disabled
                  >
                    {TON_THUONG_NC3_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tổn thương trên tổ chức */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[190px]">
                  Tổn thương trên tổ chức:
                </span>
                <div className="ql-field-control">
                  <select
                    value={tonThuongToChuc}
                    onChange={(e) => setTonThuongToChuc(e.target.value)}
                    disabled
                  >
                    {TON_THUONG_TO_CHUC_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
