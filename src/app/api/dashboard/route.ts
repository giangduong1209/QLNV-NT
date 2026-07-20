import { getIncidentDetail } from "@/services/incident.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard?masuco=<id>
 * Returns incident detail for the provided masuco query parameter.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const masuco = searchParams.get("masuco");

  if (!masuco) {
    return NextResponse.json(
      { error: "Missing 'masuco' query parameter" },
      { status: 400 }
    );
  }

  try {
    const detail = await getIncidentDetail(parseInt(masuco, 10));
    return NextResponse.json(detail);
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
