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
  return prisma.dangky_sucoykhoa.findUnique({
    where: {
      masuco,
    },
    include: {
      phantichsuco: true,
    },
  });
}
