"use server";

import { cacheLife, cacheTag } from "next/cache";
import { getLookupDataFromDB } from "@/app/services/lookup/lookup.service";
import { DANH_MUC_PHAI } from "@/constants/department";

import type { LookupData } from "@/types";

// ─── Fetch lookup tables từ DB qua service (dùng 'use cache' directive) ───────

export async function getLookupData(): Promise<LookupData> {
  "use cache";
  cacheLife("days");
  cacheTag("lookup-data");

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
