import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { toDate } from "@/utils";
import type { FilterParams } from "@/types";

export async function getCandidateDepartmentIds(selectedId: number): Promise<{
  maphongIds: number[];
  maphongnoiIds: number[];
}> {
  const subRooms = await prisma.dmphongnoi_scyk.findMany({
    where: { maphong: selectedId },
    select: { maphongnoi: true },
  });

  return {
    maphongIds: [selectedId],
    maphongnoiIds: subRooms.map((room) => room.maphongnoi),
  };
}

function isFilterParams(arg: any): arg is FilterParams {
  return (
    arg && typeof arg === "object" && ("trangThai" in arg || "tuNgay" in arg)
  );
}

export async function getIncidentList(
  params?: FilterParams | Prisma.dangky_sucoykhoaWhereInput,
) {
  if (!params) {
    return prisma.dangky_sucoykhoa.findMany({
      orderBy: { ngaysuco: "desc" },
    });
  }

  if (!isFilterParams(params)) {
    return prisma.dangky_sucoykhoa.findMany({
      where: params,
      orderBy: { ngaysuco: "desc" },
    });
  }

  const { trangThai, tuNgay, tuNgayTime, denNgay, denNgayTime, maphong } =
    params;

  const startDate = tuNgay ? toDate(tuNgay, tuNgayTime || "00:00") : null;
  const endDate = denNgay ? toDate(denNgay, denNgayTime || "23:59") : null;

  const conditions: Prisma.dangky_sucoykhoaWhereInput[] = [];

  if (startDate || endDate) {
    conditions.push({
      ngaysuco: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    });
  }

  if (trangThai === "DA_PHAN_TICH") {
    conditions.push({ daphantich: true });
  } else if (trangThai === "CHUA_PHAN_TICH") {
    conditions.push({ daphantich: false });
  }

  if (maphong) {
    const { maphongIds, maphongnoiIds } =
      await getCandidateDepartmentIds(maphong);
    const orConditions: Prisma.dangky_sucoykhoaWhereInput[] = [
      { maphong: { in: maphongIds } },
      { makkbaocao: { in: maphongIds } },
    ];
    if (maphongnoiIds.length > 0) {
      orConditions.push({ maphongnoi: { in: maphongnoiIds } });
    }
    conditions.push({ OR: orConditions });
  }

  const where: Prisma.dangky_sucoykhoaWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  return prisma.dangky_sucoykhoa.findMany({
    where,
    orderBy: { ngaysuco: "desc" },
  });
}

export async function getIncidentDetail(masuco: number) {
  // Dùng $queryRaw + findUnique riêng để tránh Prisma 1-1 relation type conflict
  const sucoykhoa = await prisma.dangky_sucoykhoa.findUnique({
    where: { masuco },
  });

  if (!sucoykhoa) return null;

  const phantichsuco = await prisma.dangky_phantichsuco.findUnique({
    where: { masuco },
  });

  return { ...sucoykhoa, phantichsuco: phantichsuco ?? null };
}

export async function saveIncidentToDB(
  masuco: number | null,
  payload: any,
): Promise<{ success: boolean; masuco?: number; error?: string }> {
  console.log({ payload });
  try {
    if (masuco) {
      await prisma.dangky_sucoykhoa.update({
        where: { masuco },
        data: payload,
      });
      return { success: true, masuco };
    } else {
      const lastRecord = await prisma.dangky_sucoykhoa.findFirst({
        orderBy: { masuco: "desc" },
        select: { masuco: true },
      });
      const newMasuco = (lastRecord?.masuco ?? 0) + 1;
      const year = new Date().getFullYear().toString().slice(-2);
      const sosuco = `SC${year}${String(newMasuco).padStart(6, "0")}`;

      await prisma.dangky_sucoykhoa.create({
        data: {
          masuco: newMasuco,
          sosuco,
          daphantich: false,
          ...payload,
        },
      });
      return { success: true, masuco: newMasuco };
    }
  } catch (error) {
    console.error("saveIncidentToDB error:", error);
    throw error;
  }
}

export async function getLookupDataFromDB() {
  const [
    loaiSuCo,
    tenSuCo,
    hinhThuc,
    phai,
    doiTuong,
    phong,
    phongNoi,
    phanLoaiBanDau,
    danhGiaBanDau,
  ] = await Promise.all([
    prisma.dmloaisuco.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maloaiscyk: true, tenloaiscyk: true },
    }),
    prisma.dmtensucoyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { idscyk: true, maloaiscyk: true, tensucoyk: true },
    }),
    prisma.dmhinhthuc_scyk.findMany({
      select: { mahinhthuc: true, tenhinhthuc: true },
    }),
    prisma.dmphai_scyk.findMany({
      select: { maphai: true, phai: true },
    }),
    prisma.dmdoituongsc_scyk.findMany({
      select: { madoituongsc: true, doituongsc: true },
    }),
    prisma.dmphong_scyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maphong: true, tenphong: true, loai: true, sapxep: true },
    }),
    prisma.dmphongnoi_scyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: {
        maphongnoi: true,
        maphong: true,
        tenphongnoi: true,
        sapxep: true,
      },
    }),
    prisma.dmphanloaibandau.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maphanloai: true, tenphanloai: true },
    }),
    prisma.dmdanhgiabandau.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { madanhgia: true, mamucdo: true, tendanhgia: true },
    }),
  ]);

  return {
    loaiSuCo,
    tenSuCo,
    hinhThuc,
    phai,
    doiTuong,
    phong,
    phongNoi,
    phanLoaiBanDau,
    danhGiaBanDau,
  };
}

export async function deleteIncidentFromDB(
  masuco: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.dangky_phantichsuco.deleteMany({
      where: { masuco },
    });

    await prisma.dangky_sucoykhoa.delete({
      where: { masuco },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteIncidentFromDB error:", error);
    return {
      success: false,
      error: "Không thể xóa sự cố khỏi CSDL. Vui lòng thử lại sau.",
    };
  }
}
