import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getIncidentDetail,
  saveIncidentToDB,
  deleteIncidentFromDB,
} from "@/app/services/incident/incident.service";
import { handleError, parseMasucoFromRequest } from "@/utils";
import { IncidentSavePayloadSchema } from "@/types";

export const dynamic = "force-dynamic";

// ============================================================
// GET /api/incidents/[masuco]
// Lấy chi tiết sự cố theo ID trên đường dẫn URL Postman
// ============================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ masuco: string }> | { masuco: string } },
) {
  try {
    const masuco = await parseMasucoFromRequest(request, params);
    if (!masuco) {
      return handleError("Mã sự cố không hợp lệ", 400);
    }

    const detail = await getIncidentDetail(masuco);
    if (!detail) {
      return handleError("Không tìm thấy sự cố yêu cầu", 404);
    }

    return NextResponse.json(
      { success: true, data: detail },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("[API GET /api/incidents/[masuco]] Error:", error);
    return handleError("Internal Server Error", 500);
  }
}

// ============================================================
// PUT /api/incidents/[masuco]
// Cập nhật sự cố theo ID trên đường dẫn URL Postman
// ============================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ masuco: string }> | { masuco: string } },
) {
  try {
    const masuco = await parseMasucoFromRequest(request, params);
    if (!masuco) {
      return handleError("Mã sự cố không hợp lệ", 400);
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = IncidentSavePayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return handleError("Dữ liệu sự cố không đúng cấu trúc schema", 400);
    }

    const result = await saveIncidentToDB(masuco, parseResult.data);
    if (!result.success) {
      return handleError(result.error || "Cập nhật sự cố thất bại", 400);
    }

    revalidatePath("/dashboard");
    revalidatePath("/incidents");

    return NextResponse.json({
      success: true,
      message: "Cập nhật sự cố thành công",
      data: { masuco },
    });
  } catch (error) {
    console.error("[API PUT /api/incidents/[masuco]] Error:", error);
    return handleError("Internal Server Error", 500);
  }
}

// ============================================================
// DELETE /api/incidents/[masuco]
// Xóa sự cố theo ID trên đường dẫn URL Postman
// ============================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ masuco: string }> | { masuco: string } },
) {
  try {
    const masuco = await parseMasucoFromRequest(request, params);
    if (!masuco) {
      return handleError("Mã sự cố không hợp lệ", 400);
    }

    const result = await deleteIncidentFromDB(masuco);
    if (!result.success) {
      return handleError(result.error || "Xóa sự cố thất bại", 400);
    }

    revalidatePath("/dashboard");
    revalidatePath("/incidents");

    return NextResponse.json({
      success: true,
      message: "Xóa sự cố thành công",
      data: { masuco },
    });
  } catch (error) {
    console.error("[API DELETE /api/incidents/[masuco]] Error:", error);
    return handleError("Internal Server Error", 500);
  }
}
