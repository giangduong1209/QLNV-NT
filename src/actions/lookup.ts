"use server";

import { getLookupDataFromDB } from "@/app/services/incident/incident.service";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LoaiSuCoItem {
  maloaiscyk: number;
  tenloaiscyk: string | null;
}

export interface TenSuCoItem {
  idscyk: number;
  maloaiscyk?: number | null;
  tensucoyk: string | null;
}

export interface HinhThucItem {
  mahinhthuc: number;
  tenhinhthuc: string | null;
}

export interface PhaiItem {
  maphai: number;
  phai: string | null;
}

export interface DoiTuongItem {
  madoituongsc: number;
  doituongsc: string | null;
}

export interface KhoaItem {
  makhoa: number;
  tenkhoa: string | null;
}

export interface PhongItem {
  maphong: number;
  makhoa: number | null;
  tenphong: string | null;
}

export interface PhanLoaiBanDauItem {
  maphanloai: number;
  tenphanloai: string | null;
}

export interface DanhGiaBanDauItem {
  madanhgia: number;
  mamucdo: string | null;
  tendanhgia: string | null;
}

export interface LookupData {
  loaiSuCo: LoaiSuCoItem[];
  tenSuCo: TenSuCoItem[];
  hinhThuc: HinhThucItem[];
  phai: PhaiItem[];
  doiTuong: DoiTuongItem[];
  khoa: KhoaItem[];
  phong: PhongItem[];
  phanLoaiBanDau: PhanLoaiBanDauItem[];
  danhGiaBanDau: DanhGiaBanDauItem[];
}

// ─── Fetch lookup tables từ DB qua service ────────────────────────────────────

export async function getLookupData(): Promise<LookupData> {
  try {
    return await getLookupDataFromDB();
  } catch (error) {
    console.error("getLookupData error:", error);
    return {
      loaiSuCo: [],
      tenSuCo: [],
      hinhThuc: [],
      phai: [],
      doiTuong: [],
      khoa: [],
      phong: [],
      phanLoaiBanDau: [],
      danhGiaBanDau: [],
    };
  }
}

