import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getIncidentList,
  getIncidentDetail,
  saveIncidentToDB,
  deleteIncidentFromDB,
} from "@/app/services/incident/incident.service";
import { handleError } from "@/utils";

export const dynamic = "force-dynamic";

// ============================================================
// GET /api/incidents
// Lấy danh sách sự cố (nếu không có masuco) hoặc Chi tiết sự cố (nếu có ?masuco=id)
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const masucoParam = searchParams.get("masuco");

    if (masucoParam) {
      const masuco = parseInt(masucoParam, 10);
      if (isNaN(masuco)) {
        return handleError("Mã sự cố ('masuco') không hợp lệ", 400);
      }
      const detail = await getIncidentDetail(masuco);
      if (!detail) {
        return handleError("Không tìm thấy sự cố yêu cầu", 404);
      }
      return NextResponse.json({ success: true, data: detail });
    }

    const trangThai = searchParams.get("trangThai") || undefined;
    const tuNgay = searchParams.get("tuNgay") || undefined;
    const denNgay = searchParams.get("denNgay") || undefined;
    const maphongParam = searchParams.get("maphong");
    const maphong = maphongParam ? parseInt(maphongParam, 10) : undefined;

    const filterParams =
      trangThai || tuNgay || denNgay || maphong
        ? { trangThai, tuNgay, denNgay, maphong }
        : undefined;

    const list = await getIncidentList(filterParams);
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("[API GET /api/incidents] Error:", error);
    return handleError("Internal Server Error", 500);
  }
}

// ============================================================
// POST /api/incidents
// Thêm mới sự cố y khoa từ Postman (JSON Body)
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return handleError("Dữ liệu gửi lên không hợp lệ (cần JSON body)", 400);
    }

    const result = await saveIncidentToDB(null, body);
    if (!result.success) {
      return handleError(result.error || "Không thể tạo sự cố mới", 400);
    }

    revalidatePath("/dashboard");
    revalidatePath("/incidents");

    return NextResponse.json(
      {
        success: true,
        message: "Tạo mới sự cố thành công",
        data: { masuco: result.masuco },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API POST /api/incidents] Error:", error);
    return handleError("Internal Server Error", 500);
  }
}

// ============================================================
// PUT /api/incidents
// Cập nhật sự cố y khoa từ Postman (Query ?masuco=id hoặc JSON body masuco)
// ============================================================
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const body = await request.json().catch(() => ({}));

    const masucoQuery = searchParams.get("masuco");
    const masucoVal = masucoQuery
      ? parseInt(masucoQuery, 10)
      : body.masuco
        ? parseInt(String(body.masuco), 10)
        : null;

    if (!masucoVal || isNaN(masucoVal)) {
      return handleError(
        "Thiếu hoặc sai tham số 'masuco' để cập nhật sự cố",
        400,
      );
    }

    const result = await saveIncidentToDB(masucoVal, body);
    if (!result.success) {
      return handleError(result.error || "Cập nhật sự cố thất bại", 400);
    }

    revalidatePath("/dashboard");
    revalidatePath("/incidents");

    return NextResponse.json({
      success: true,
      message: "Cập nhật sự cố thành công",
      data: { masuco: masucoVal },
    });
  } catch (error) {
    console.error("[API PUT /api/incidents] Error:", error);
    return handleError("Internal Server Error", 500);
  }
}

// ============================================================
// DELETE /api/incidents
// Xóa sự cố y khoa từ Postman (Query ?masuco=id hoặc JSON body masuco)
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let masucoVal: number | null = null;

    const masucoQuery = searchParams.get("masuco");
    if (masucoQuery) {
      masucoVal = parseInt(masucoQuery, 10);
    } else {
      const body = await request.json().catch(() => ({}));
      if (body && body.masuco) {
        masucoVal = parseInt(String(body.masuco), 10);
      }
    }

    if (!masucoVal || isNaN(masucoVal)) {
      return handleError(
        "Thiếu hoặc sai tham số 'masuco' để thực hiện xóa sự cố",
        400,
      );
    }

    const result = await deleteIncidentFromDB(masucoVal);
    if (!result.success) {
      return handleError(result.error || "Xóa sự cố thất bại", 400);
    }

    revalidatePath("/dashboard");
    revalidatePath("/incidents");

    return NextResponse.json({
      success: true,
      message: "Xóa sự cố thành công",
      data: { masuco: masucoVal },
    });
  } catch (error) {
    console.error("[API DELETE /api/incidents] Error:", error);
    return handleError("Internal Server Error", 500);
  }
}
