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
  } catch (error) {
    console.log("Failed to fetch user from DB:", error);
  }

  // Fallback nếu có session JWT nhưng DB chưa tìm thấy/lỗi connection
  return {
    id: session.userId,
    hovaten: "User",
    sdt: "",
    email: "",
    khoahoacphong: "",
    username: "",
    password: "",
    quyen: session.role || "user",
    role: session.role || ("user" as UserRole),
    active: true,
  };
});
