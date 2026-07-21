import { getIncidentDetail } from "@/app/services/incident/incident.service";
import { NextResponse } from "next/server";
import { handleError } from "@/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard?masuco=<id>
 * Returns incident detail for the provided masuco query parameter.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const masuco = searchParams.get("masuco");

  if (!masuco) {
    return handleError("Missing 'masuco' query parameter", 400);
  }

  try {
    const detail = await getIncidentDetail(parseInt(masuco, 10));
    return NextResponse.json(detail);
  } catch (error) {
    return handleError("Internal Server Error", 500);
  }
}
