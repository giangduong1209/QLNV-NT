import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/definitions";

// ============================================================
// Verify & Get Session (cached per request)
// ============================================================
export const getSession = cache(async () => {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return session;
});

// ============================================================
// Get Current User from DB (cached per request)
// ============================================================
export const getCurrentUser = cache(async () => {
  const session = await getSession();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      redirect("/login");
    }

    return user as typeof user & { role: UserRole };
  } catch (error) {
    console.log("Failed to fetch user:", error);
    return null;
  }
});
