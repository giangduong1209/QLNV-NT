"use server";

import { getLookupDataFromDB } from "@/app/services/incident/incident.service";

import type { LookupData } from "@/types";

export type {
  LoaiSuCoItem,
  TenSuCoItem,
  HinhThucItem,
  PhaiItem,
  DoiTuongItem,
  PhongItem,
  PhongNoiItem,
  PhanLoaiBanDauItem,
  DanhGiaBanDauItem,
  LookupData,
} from "@/types";

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
      phong: [],
      phongNoi: [],
      phanLoaiBanDau: [],
      danhGiaBanDau: [],
    };
  }
}

