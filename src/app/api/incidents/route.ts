import { NextResponse } from "next/server";
import { getIncidentList } from "@/services/incident.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getIncidentList();
    return NextResponse.json(list);
  } catch (error) {
    console.error("GET /api/incidents error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
