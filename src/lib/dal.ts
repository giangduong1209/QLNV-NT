import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";

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
    const user = await prisma.users.findUnique({
      where: { id: session.userId },
    });

    if (user && user.active) {
      return user as typeof user & { role: UserRole };
    }

    // Nếu user không tồn tại hoặc đã bị khóa tài khoản (active = false)
    console.warn(`User ${session.userId} không tồn tại hoặc đã bị khóa.`);
    redirect("/login");
  } catch (error) {
    // Nếu là ngoại lệ redirect của Next.js (NEXT_REDIRECT), rethrow để thực hiện redirect
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Failed to fetch user from DB:", error);
    redirect("/login");
  }
});
