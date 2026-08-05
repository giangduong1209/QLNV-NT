"use server";

import { getLookupDataFromDB } from "@/app/services/lookup/lookup.service";
import { DANH_MUC_PHAI } from "@/constants/department";

import type { LookupData } from "@/types";

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
      phai: DANH_MUC_PHAI,
      doiTuong: [],
      phong: [],
      phongNoi: [],
      phanLoaiBanDau: [],
      danhGiaBanDau: [],
    };
  }
}
