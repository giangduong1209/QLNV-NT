import { NextResponse } from "next/server";
import { getIncidentList } from "@/app/services/incident/incident.service";
import { handleError } from "@/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getIncidentList();
    return NextResponse.json(list);
  } catch (error) {
    return handleError("Internal Server Error", 500);
  }
}
