import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Routes that require authentication
const protectedRoutes = ["/dashboard"];
// Routes accessible only when NOT authenticated
const publicOnlyRoutes = ["/login"];

async function decryptSession(session: string | undefined) {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if route is protected or public-only
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  const isPublicOnlyRoute = publicOnlyRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  // Only decrypt session if needed
  if (!isProtectedRoute && !isPublicOnlyRoute) {
    return NextResponse.next();
  }

  // Decrypt session from cookie
  const cookie = request.cookies.get("session")?.value;
  const session = await decryptSession(cookie);

  // Redirect unauthenticated users away from protected routes

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Redirect authenticated users away from login page
  if (isPublicOnlyRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

// Matcher: exclude static files, images, and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
