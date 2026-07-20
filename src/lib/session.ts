import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload, UserRole } from "@/types";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// ============================================================
// Encrypt: Tạo JWT token từ session payload
// ============================================================
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

// ============================================================
// Decrypt: Verify & giải mã JWT token
// ============================================================
export async function decrypt(
  session: string | undefined = "",
): Promise<SessionPayload | undefined> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    console.log("Failed to verify session");
    return undefined;
  }
}

// ============================================================
// Create Session: Tạo session mới và set cookie
// ============================================================
export async function createSession(userId: string, role: UserRole) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

// ============================================================
// Update Session: Gia hạn session (refresh)
// ============================================================
export async function updateSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

// ============================================================
// Delete Session: Xóa session cookie (logout)
// ============================================================
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// ============================================================
// Verify Session: Kiểm tra session hiện tại
// ============================================================
export async function verifySession(): Promise<{
  isAuth: boolean;
  userId: string;
  role: UserRole;
} | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  return {
    isAuth: true,
    userId: session.userId as string,
    role: session.role as UserRole,
  };
}
