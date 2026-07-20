import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getIncidentList(
  where?: Prisma.dangky_sucoykhoaWhereInput,
) {
  return prisma.dangky_sucoykhoa.findMany({
    where,
    // include: {
    //   phantichsuco: {
    //     select: {
    //       masuco: true,
    //     },
    //   },
    // },
    orderBy: {
      ngaysuco: "desc",
    },
  });
}
