import { NextRequest, NextResponse } from "next/server";

/**
 * Tra response lỗi JSON chuẩn cho Next.js API Routes
 */
export function handleError(message: string, status: number = 500) {
  console.error(`[API Error ${status}]:`, message);
  return NextResponse.json({ error: message }, { status });
}

/**
 * Helper trích xuất và validate `masuco` từ params URL, query string (?masuco=) hoặc JSON body
 */
export async function parseMasucoFromRequest(
  request: NextRequest,
  params?: { masuco?: string } | Promise<{ masuco?: string }>,
): Promise<number | null> {
  if (params) {
    const resolvedParams = await params;
    if (resolvedParams?.masuco) {
      const parsed = parseInt(resolvedParams.masuco, 10);
      return isNaN(parsed) ? null : parsed;
    }
  }

  const searchParams = request.nextUrl.searchParams;
  const masucoQuery = searchParams.get("masuco");
  if (masucoQuery) {
    const parsed = parseInt(masucoQuery, 10);
    return isNaN(parsed) ? null : parsed;
  }

  try {
    const cloned = request.clone();
    const body = await cloned.json();
    if (body && body.masuco) {
      const parsed = parseInt(String(body.masuco), 10);
      return isNaN(parsed) ? null : parsed;
    }
  } catch {
    // Body rỗng hoặc không phải JSON
  }

  return null;
}
