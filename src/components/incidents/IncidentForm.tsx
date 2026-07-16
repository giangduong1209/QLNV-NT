"use client";

import { useState, useEffect } from "react";
import { TimePicker } from "@/components/ui/TimePicker";

export function IncidentForm() {
  // General Info
  const [maSuCo, setMaSuCo] = useState("SC26000001");
  const [ngayLapDate, setNgayLapDate] = useState("");
  const [ngayLapTime, setNgayLapTime] = useState("");
  const [hinhThuc, setHinhThuc] = useState("Tự nguyện");
  const [loaiSuCo, setLoaiSuCo] = useState("");

  // Incident Location & Details
  const [tenSuCo, setTenSuCo] = useState("");
  const [ngaySuCoDate, setNgaySuCoDate] = useState("");
  const [ngaySuCoTime, setNgaySuCoTime] = useState("");
  const [maKCB, setMaKCB] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [khoaPhongBN, setKhoaPhongBN] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [soBenhAn, setSoBenhAn] = useState("");
  const [gioiTinh, setGioiTinh] = useState("");
  const [doiTuong, setDoiTuong] = useState("");

  // Patient Info
  const [khoaPhongSC, setKhoaPhongSC] = useState("");
  const [viTriCuThe, setViTriCuThe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [deXuatGiaiPhap, setDeXuatGiaiPhap] = useState("");
  const [xuLyBanDau, setXuLyBanDau] = useState("");
  const [nguyenNhanGoc, setNguyenNhanGoc] = useState("");
  const [giaiPhapTranhLap, setGiaiPhapTranhLap] = useState("");

  // Notifications & Confirmations
  const [tbBacSi, setTbBacSi] = useState("");
  const [tbNguoiNha, setTbNguoiNha] = useState("");
  const [ghiNhanHoSo, setGhiNhanHoSo] = useState("");
  const [tbNguoiBenh, setTbNguoiBenh] = useState("");
  const [phanLoaiBanDau, setPhanLoaiBanDau] = useState("");
  const [danhGiaAnhHuong, setDanhGiaAnhHuong] = useState("");

  // Populate date/time defaults on client only to avoid hydration mismatch
  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setNgayLapDate(today);
    setNgayLapTime(time);
    setNgaySuCoDate(today);
    setNgaySuCoTime(time);
  }, []);

  const [nguoiBaoCao, setNguoiBaoCao] = useState("");
  const [hoTenBC, setHoTenBC] = useState("Admin");
  const [sdtBC, setSdtBC] = useState("");
  const [emailBC, setEmailBC] = useState("");
  const [chungKien1, setChungKien1] = useState("");
  const [chungKien2, setChungKien2] = useState("");

  return (
    <div className="ql-form-container">
      {/* Header bar of the form */}
      <div className="ql-form-header-line">
        <div className="ql-form-header-field">
          <span className="ql-field-label">Mã sự cố:</span>
          <input
            type="text"
            value={maSuCo}
            readOnly
            className="w-[110px] text-center text-primary-dark font-bold bg-primary-light border border-[rgba(220,38,38,0.2)]"
          />
        </div>
        <div className="ql-form-header-field">
          <span className="ql-field-label">Ngày lập:</span>
          <div className="flex gap-1.5 items-center">
            <input
              type="date"
              value={ngayLapDate}
              onChange={(e) => setNgayLapDate(e.target.value)}
              className="w-[130px] text-center text-[(--color-text-secondary)] bg-primary-light border border-[rgba(220,38,38,0.15)]"
            />
            <TimePicker
              value={ngayLapTime}
              onChange={setNgayLapTime}
              size="sm"
            />
          </div>
        </div>
        <div className="ql-form-header-field">
          <span className="ql-field-label">Hình thức:</span>
          <select
            value={hinhThuc}
            onChange={(e) => setHinhThuc(e.target.value)}
            className="w-[120px]"
          >
            <option value="Tự nguyện">Tự nguyện</option>
            <option value="Bắt buộc">Bắt buộc</option>
          </select>
        </div>
        <div className="ql-form-header-field">
          <span className="ql-field-label">Loại sự cố:</span>
          <select
            value={loaiSuCo}
            onChange={(e) => setLoaiSuCo(e.target.value)}
            className="w-[200px]"
          >
            <option value=""></option>
            <option value="Lâm sàng">Sự cố lâm sàng</option>
            <option value="Cận lâm sàng">Sự cố cận lâm sàng</option>
            <option value="Dược">Sự cố liên quan đến thuốc</option>
            <option value="Trang thiết bị">Sự cố trang thiết bị y tế</option>
            <option value="Hành chính">Sự cố hành chính</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: THÔNG TIN NGƯỜI BỆNH */}
      <div className="ql-form-section">
        <div className="ql-form-section-header">
          <span>THÔNG TIN NGƯỜI BỆNH</span>
          <span className="text-primary cursor-pointer text-xs font-bold">
            + Thêm mới
          </span>
        </div>
        <div className="ql-form-section-body">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[60px]">Mã KCB:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={maKCB}
                    onChange={(e) => setMaKCB(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-6">
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
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select
                    value={khoaPhongBN}
                    onChange={(e) => setKhoaPhongBN(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Cấp cứu">Khoa Cấp cứu</option>
                    <option value="Nội tổng hợp">Khoa Nội tổng hợp</option>
                    <option value="Ngoại tổng hợp">Khoa Ngoại tổng hợp</option>
                    <option value="Sản">Khoa Sản</option>
                    <option value="Nhi">Khoa Nhi</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[60px]">Ngày sinh:</span>
                <div className="ql-field-control">
                  <input
                    type="date"
                    value={ngaySinh}
                    onChange={(e) => setNgaySinh(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="ql-field">
                <span className="ql-field-label w-[70px]">Số bệnh án:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={soBenhAn}
                    onChange={(e) => setSoBenhAn(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Giới tính:</span>
                <div className="ql-field-control">
                  <select
                    value={gioiTinh}
                    onChange={(e) => setGioiTinh(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <div className="ql-field">
                <span className="ql-field-label w-[60px]">Đối tượng:</span>
                <div className="ql-field-control">
                  <select
                    value={doiTuong}
                    onChange={(e) => setDoiTuong(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Bảo hiểm y tế">Bảo hiểm y tế</option>
                    <option value="Viện phí">Viện phí</option>
                    <option value="Miễn phí">Miễn phí</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: NƠI XẢY RA SỰ CỐ */}
      <div className="ql-form-section">
        <div className="ql-form-section-header">
          <span>NƠI XẢY RA SỰ CỐ</span>
        </div>
        <div className="ql-form-section-body">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[70px]">Tên sự cố:</span>
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

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <div className="ql-field">
                <span className="ql-field-label w-[70px]">Khoa/phòng:</span>
                <div className="ql-field-control">
                  <select
                    value={khoaPhongSC}
                    onChange={(e) => setKhoaPhongSC(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Cấp cứu">Khoa Cấp cứu</option>
                    <option value="Nội tổng hợp">Khoa Nội tổng hợp</option>
                    <option value="Ngoại tổng hợp">Khoa Ngoại tổng hợp</option>
                    <option value="Sản">Khoa Sản</option>
                    <option value="Nhi">Khoa Nhi</option>
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

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-6">
              <div className="ql-field-label mb-1">Mô tả:</div>
              <div className="ql-field-control">
                <textarea
                  rows={3}
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                />
              </div>
            </div>
            <div className="col-span-6">
              <div className="ql-field-label mb-1">Đề xuất giải pháp:</div>
              <div className="ql-field-control">
                <textarea
                  rows={3}
                  value={deXuatGiaiPhap}
                  onChange={(e) => setDeXuatGiaiPhap(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field-label mb-1">Xử lý ban đầu:</div>
              <div className="ql-field-control">
                <textarea
                  rows={2}
                  value={xuLyBanDau}
                  onChange={(e) => setXuLyBanDau(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12">
              <div className="ql-field">
                <span className="ql-field-label w-[110px]">
                  Nguyên nhân gốc:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={nguyenNhanGoc}
                    onChange={(e) => setNguyenNhanGoc(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <div className="ql-field">
                <span className="ql-field-label w-[230px]">
                  Giải pháp tránh lặp lại sai sót, sự cố:
                </span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={giaiPhapTranhLap}
                    onChange={(e) => setGiaiPhapTranhLap(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: THÔNG BÁO & XÁC NHẬN */}
      <div className="ql-form-section mb-0">
        <div className="ql-form-section-header">
          <span>THÔNG BÁO & XÁC NHẬN</span>
        </div>
        <div className="ql-form-section-body">
          <div className="grid grid-cols-12 gap-6">
            {/* Left columns - dropdowns */}
            <div className="col-span-7 flex flex-col gap-3">
              <div className="ql-field">
                <span className="ql-field-label w-[340px] text-xs">
                  Thông báo cho Bác sĩ điều trị/người có trách nhiệm:
                </span>
                <div className="ql-field-control">
                  <select
                    value={tbBacSi}
                    onChange={(e) => setTbBacSi(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Có">Có</option>
                    <option value="Không">Không</option>
                  </select>
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[340px] text-xs">
                  Thông báo cho người nhà/người bảo hộ:
                </span>
                <div className="ql-field-control">
                  <select
                    value={tbNguoiNha}
                    onChange={(e) => setTbNguoiNha(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Có">Có</option>
                    <option value="Không">Không</option>
                  </select>
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[340px] text-xs">
                  Ghi nhận vào hồ sơ bệnh án/giấy tờ liên quan:
                </span>
                <div className="ql-field-control">
                  <select
                    value={ghiNhanHoSo}
                    onChange={(e) => setGhiNhanHoSo(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Có">Có</option>
                    <option value="Không">Không</option>
                  </select>
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[340px] text-xs">
                  Thông báo cho người bệnh:
                </span>
                <div className="ql-field-control">
                  <select
                    value={tbNguoiBenh}
                    onChange={(e) => setTbNguoiBenh(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Có">Có</option>
                    <option value="Không">Không</option>
                  </select>
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[340px] text-xs">
                  Phân loại ban đầu về sự cố (**):
                </span>
                <div className="ql-field-control">
                  <select
                    value={phanLoaiBanDau}
                    onChange={(e) => setPhanLoaiBanDau(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Nặng">Nặng</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Nhẹ">Nhẹ</option>
                  </select>
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[340px] text-xs">
                  Đánh giá ban đầu về mức độ ảnh hưởng của sự cố (**):
                </span>
                <div className="ql-field-control">
                  <select
                    value={danhGiaAnhHuong}
                    onChange={(e) => setDanhGiaAnhHuong(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Mức độ 1">Mức độ 1</option>
                    <option value="Mức độ 2">Mức độ 2</option>
                    <option value="Mức độ 3">Mức độ 3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right columns - reporters details */}
            <div className="col-span-5 bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col gap-3">
              <div className="ql-field">
                <span className="ql-field-label w-[90px]">Người báo cáo:</span>
                <div className="ql-field-control">
                  <select
                    value={nguoiBaoCao}
                    onChange={(e) => setNguoiBaoCao(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Điều dưỡng">Điều dưỡng</option>
                    <option value="Bác sĩ">Bác sĩ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7">
                  <div className="ql-field">
                    <span className="ql-field-label w-[45px]">Họ tên:</span>
                    <div className="ql-field-control">
                      <select
                        value={hoTenBC}
                        onChange={(e) => setHoTenBC(e.target.value)}
                      >
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="ql-field">
                    <span className="ql-field-label w-[28px]">SĐT:</span>
                    <div className="ql-field-control">
                      <input
                        type="text"
                        value={sdtBC}
                        onChange={(e) => setSdtBC(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Email:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={emailBC}
                    onChange={(e) => setEmailBC(e.target.value)}
                  />
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Chứng kiến 1:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={chungKien1}
                    onChange={(e) => setChungKien1(e.target.value)}
                  />
                </div>
              </div>
              <div className="ql-field">
                <span className="ql-field-label w-[80px]">Chứng kiến 2:</span>
                <div className="ql-field-control">
                  <input
                    type="text"
                    value={chungKien2}
                    onChange={(e) => setChungKien2(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
