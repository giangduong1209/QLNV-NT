import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getIncidentExportData } from "@/app/services/incident/incident.service";
import type { AnalysisStatus } from "@/types";
import { todayStr } from "@/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const trangThai =
      (searchParams.get("trangThai") as AnalysisStatus) || undefined;
    const tuNgay = searchParams.get("tuNgay") || undefined;
    const tuNgayTime = searchParams.get("tuNgayTime") || "00:00";
    const denNgay = searchParams.get("denNgay") || undefined;
    const denNgayTime = searchParams.get("denNgayTime") || "23:59";
    const maphongParam = searchParams.get("maphong");
    const maphong = maphongParam ? parseInt(maphongParam, 10) : undefined;

    const filterParams = {
      trangThai,
      tuNgay,
      tuNgayTime,
      denNgay,
      denNgayTime,
      maphong,
    };

    const rows = await getIncidentExportData(filterParams);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hệ thống QLSCYK - Bệnh viện Đa khoa Nhật Tân";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Danh sách sự cố", {
      pageSetup: {
        orientation: "landscape",
        paperSize: 9, // A4
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
      views: [{ showGridLines: true }],
    });

    // ─── PHẦN TIÊU ĐỀ BÁO CÁO ──────────────────────────────────────────
    // Dòng 1: Tên cơ sở y tế
    const hospitalRow = worksheet.addRow(["BỆNH VIỆN ĐA KHOA NHẬT TÂN"]);
    hospitalRow.getCell(1).font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
      color: { argb: "FF0000" },
    };

    // Dòng 2: Phụ đề hệ thống
    const subTitleRow = worksheet.addRow(["HỆ THỐNG QUẢN LÝ SỰ CỐ Y KHOA"]);
    subTitleRow.getCell(1).font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      color: { argb: "FF475569" },
    };

    worksheet.addRow([]); // Dòng trống 3

    // Dòng 4: Tiêu đề chính
    const mainTitleRow = worksheet.addRow(["DANH SÁCH BÁO CÁO SỰ CỐ Y KHOA"]);
    worksheet.mergeCells("A4:O4");
    const titleCell = mainTitleRow.getCell(1);
    titleCell.font = {
      name: "Times New Roman",
      size: 16,
      bold: true,
      color: { argb: "FF0F172A" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    mainTitleRow.height = 28;

    // Dòng 5: Căn cứ thông tư 43
    const circularRow = worksheet.addRow([
      "(Theo hướng dẫn tại Thông tư số 43/2018/TT-BYT của Bộ Y tế)",
    ]);
    worksheet.mergeCells("A5:O5");
    const circularCell = circularRow.getCell(1);
    circularCell.font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      color: { argb: "FF64748B" },
    };
    circularCell.alignment = { horizontal: "center", vertical: "middle" };

    // Dòng 6: Thông tin lọc thời gian
    const filterInfo = `Thời gian xuất: ${todayStr()} | Khoảng thời gian: ${
      tuNgay ? `${tuNgayTime} ${tuNgay}` : "Đầu"
    } — ${denNgay ? `${denNgayTime} ${denNgay}` : "Hiện tại"}${
      trangThai === "DA_PHAN_TICH"
        ? " | Trạng thái: Đã phân tích"
        : trangThai === "CHUA_PHAN_TICH"
          ? " | Trạng thái: Chưa phân tích"
          : " | Trạng thái: Tất cả"
    }`;
    const filterRow = worksheet.addRow([filterInfo]);
    worksheet.mergeCells("A6:O6");
    const filterCell = filterRow.getCell(1);
    filterCell.font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      color: { argb: "FF334155" },
    };
    filterCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.addRow([]); // Dòng trống 7

    // ─── CỘT DỮ LIỆU & TIÊU ĐỀ BẢNG (DÒNG 8) ──────────────────────────
    const columnsDefinition = [
      { key: "stt", header: "TT", width: 6, align: "center" as const },
      {
        key: "sosuco",
        header: "Mã sự cố",
        width: 14,
        align: "center" as const,
      },
      {
        key: "hoten",
        header: "Họ tên người bệnh",
        width: 22,
        align: "left" as const,
      },
      {
        key: "thoidiemXayRa",
        header: "Thời điểm xảy ra",
        width: 17,
        align: "center" as const,
      },
      {
        key: "thoigianBaoCao",
        header: "Thời gian báo cáo",
        width: 17,
        align: "center" as const,
      },
      { key: "diadiem", header: "Địa điểm", width: 24, align: "left" as const },
      {
        key: "vitricuthe",
        header: "Vị trí cụ thể (nơi xảy ra SC)",
        width: 25,
        align: "left" as const,
      },
      {
        key: "tinhchat",
        header: "Tính chất",
        width: 14,
        align: "center" as const,
      },
      {
        key: "nhomSuCo",
        header: "Nhóm sự cố",
        width: 24,
        align: "left" as const,
      },
      {
        key: "nhomNguyenNhan",
        header: "Nhóm nguyên nhân",
        width: 36,
        align: "left" as const,
      },
      {
        key: "mucdoTonThuong",
        header: "Mức độ tổn thương",
        width: 24,
        align: "left" as const,
      },
      { key: "mota", header: "Mô tả sự cố", width: 40, align: "left" as const },
      {
        key: "giaiphapBandau",
        header: "Giải pháp ban đầu đã xử trí",
        width: 35,
        align: "left" as const,
      },
      {
        key: "giaiphapTranhLaplai",
        header: "Gợi ý biện pháp tránh lặp lại sự cố",
        width: 35,
        align: "left" as const,
      },
      {
        key: "trangthai",
        header: "Trạng thái",
        width: 16,
        align: "center" as const,
      },
    ];

    const headerValues = columnsDefinition.map((col) => col.header);
    const headerRow = worksheet.addRow(headerValues);
    headerRow.height = 32;

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007A78" }, // Màu xanh thương hiệu
      };
      cell.font = {
        name: "Times New Roman",
        size: 10.5,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF0F766E" } },
        left: { style: "thin", color: { argb: "FF0F766E" } },
        bottom: { style: "medium", color: { argb: "FF0F766E" } },
        right: { style: "thin", color: { argb: "FF0F766E" } },
      };
    });

    // ─── ĐIỀN DỮ LIỆU TỪNG DÒNG ────────────────────────────────────────
    rows.forEach((row, rowIndex) => {
      const dataValues = [
        row.stt,
        row.sosuco,
        row.hoten,
        row.thoidiemXayRa,
        row.thoigianBaoCao,
        row.diadiem,
        row.vitricuthe,
        row.tinhchat,
        row.nhomSuCo,
        row.nhomNguyenNhan,
        row.mucdoTonThuong,
        row.mota,
        row.giaiphapBandau,
        row.giaiphapTranhLaplai,
        row.trangthai,
      ];

      const dataRow = worksheet.addRow(dataValues);
      const isEven = rowIndex % 2 === 1;

      dataRow.eachCell((cell, colNumber) => {
        const colDef = columnsDefinition[colNumber - 1];
        cell.font = {
          name: "Times New Roman",
          size: 10,
          color: { argb: "FF1E293B" },
        };
        cell.alignment = {
          vertical: "top",
          horizontal: colDef ? colDef.align : "left",
          wrapText: true,
        };
        cell.border = thinBorder;

        // Màu nền xen kẽ để dễ theo dõi dòng
        if (isEven) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }

        // Tô màu nhấn cho cột trạng thái
        if (colNumber === 15) {
          if (row.trangthai === "Đã duyệt") {
            cell.font = {
              name: "Times New Roman",
              size: 10,
              bold: true,
              color: { argb: "FF166534" }, // Xanh lá đậm
            };
          } else if (row.trangthai.includes("Chưa duyệt")) {
            cell.font = {
              name: "Times New Roman",
              size: 10,
              italic: true,
              color: { argb: "FF1E40AF" }, // Xanh dương
            };
          } else {
            cell.font = {
              name: "Times New Roman",
              size: 10,
              italic: true,
              color: { argb: "FFB45309" }, // Hổ phách
            };
          }
        }
      });
    });

    // ─── THIẾT LẬP ĐỘ RỘNG CỘT ─────────────────────────────────────────
    columnsDefinition.forEach((col, idx) => {
      worksheet.getColumn(idx + 1).width = col.width;
    });

    // ─── PHẦN CHÂN TRANG / CHỮ KÝ ───────────────────────────────────────
    worksheet.addRow([]); // Dòng trống
    const summaryRow = worksheet.addRow([
      `Tổng cộng: ${rows.length} sự cố y khoa được ghi nhận.`,
    ]);
    worksheet.mergeCells(`A${summaryRow.number}:O${summaryRow.number}`);
    summaryRow.getCell(1).font = {
      name: "Times New Roman",
      size: 10.5,
      bold: true,
      color: { argb: "FF0F172A" },
    };

    worksheet.addRow([]); // Dòng trống
    const signDateRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Ngày ...... tháng ...... năm 20...",
    ]);
    worksheet.mergeCells(`M${signDateRow.number}:O${signDateRow.number}`);
    signDateRow.getCell(13).alignment = { horizontal: "center" };
    signDateRow.getCell(13).font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
    };

    const signTitleRow = worksheet.addRow([
      "",
      "NGƯỜI LẬP BIỂU",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "TRƯỞNG PHÒNG QUẢN LÝ CHẤT LƯỢNG",
    ]);
    worksheet.mergeCells(`B${signTitleRow.number}:D${signTitleRow.number}`);
    worksheet.mergeCells(`M${signTitleRow.number}:O${signTitleRow.number}`);
    signTitleRow.getCell(2).alignment = { horizontal: "center" };
    signTitleRow.getCell(2).font = {
      name: "Times New Roman",
      size: 10.5,
      bold: true,
    };
    signTitleRow.getCell(13).alignment = { horizontal: "center" };
    signTitleRow.getCell(13).font = {
      name: "Times New Roman",
      size: 10.5,
      bold: true,
    };

    // Buffer và trả về response
    const buffer = await workbook.xlsx.writeBuffer();
    const dateFormatted = todayStr().replace(/\//g, "-");
    const filename = `Danh_sach_su_co_y_khoa_${dateFormatted}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[API GET /api/incidents/export] Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể xuất file Excel. Vui lòng thử lại sau.",
      },
      { status: 500 },
    );
  }
}
