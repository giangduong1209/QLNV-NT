import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getIncidentList(
  where?: Prisma.dangky_sucoykhoaWhereInput,
) {
  return prisma.dangky_sucoykhoa.findMany({
    where,
    orderBy: {
      ngaysuco: "desc",
    },
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
  const [loaiSuCo, tenSuCo, hinhThuc, phai, doiTuong] = await Promise.all([
    prisma.dmloaisuco.findMany({
      where: { ksd: true },
      orderBy: { sapxep: "asc" },
      select: { maloaiscyk: true, tenloaiscyk: true },
    }),
    prisma.dmtensucoyk.findMany({
      where: { ksd: true },
      orderBy: { sapxep: "asc" },
      select: { idscyk: true, tensucoyk: true },
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
  ]);

  return { loaiSuCo, tenSuCo, hinhThuc, phai, doiTuong };
}

