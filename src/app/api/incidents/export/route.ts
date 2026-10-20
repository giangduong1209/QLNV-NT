import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getComprehensiveIncidentExportData } from "@/app/services/incident/incident.service";
import type { AnalysisStatus } from "@/types";
import { todayStr } from "@/utils";

export const dynamic = "force-dynamic";

// Định nghĩa cột cho Biểu mẫu 1: Thông báo sự cố y khoa (19 trường)
const notificationColumns = [
  { key: "masuco", header: "Mã sự cố", width: 14, align: "center" as const },
  {
    key: "khoaPhongBaoCao",
    header: "1. Khoa/phòng báo cáo sự cố?",
    width: 24,
    align: "left" as const,
  },
  {
    key: "loaiBaoCao",
    header: "2. Loại báo cáo?",
    width: 14,
    align: "center" as const,
  },
  {
    key: "phanLoaiSuCo",
    header: "3. Phân loại sự cố?",
    width: 20,
    align: "left" as const,
  },
  {
    key: "ngayGioXayRa",
    header: "4. Ngày, giờ xảy ra (phát hiện) sự cố?",
    width: 18,
    align: "center" as const,
  },
  {
    key: "doiTuong",
    header: "5. Đối tượng xảy ra sự cố?",
    width: 18,
    align: "left" as const,
  },
  {
    key: "thongTinNguoiBenh",
    header:
      "6. Thông tin người bệnh (Họ tên, ngày sinh, giới tính, số bệnh án, khoa/phòng)",
    width: 36,
    align: "left" as const,
  },
  {
    key: "viTri",
    header:
      "7. Vị trí xảy ra sự cố (khoa/phòng; nhà vệ sinh, hành lang, cầu thang khu vực nào; bãi giữ xe;...)",
    width: 30,
    align: "left" as const,
  },
  {
    key: "moTa",
    header: "8. Mô tả ngắn gọn nội dung sự cố",
    width: 38,
    align: "left" as const,
  },
  {
    key: "dieuTriBanDau",
    header: "9. Điều trị/Xử trí ban đầu đã thực hiện",
    width: 32,
    align: "left" as const,
  },
  {
    key: "ghiNhanHSBA",
    header: "10. Ghi nhận vào hồ sơ bệnh án/giấy tờ liên quan",
    width: 15,
    align: "center" as const,
  },
  {
    key: "thongBaoBacSy",
    header:
      "11. Thông báo về sự cố cho: [Bác sỹ điều trị/ người có trách nhiệm]",
    width: 16,
    align: "center" as const,
  },
  {
    key: "thongBaoNguoiNha",
    header: "11. Thông báo về sự cố cho: [Người nhà người bệnh/ người bảo hộ]",
    width: 16,
    align: "center" as const,
  },
  {
    key: "thongBaoNguoiBenh",
    header: "11. Thông báo về sự cố cho: [Người bệnh]",
    width: 16,
    align: "center" as const,
  },
  {
    key: "deXuatBanDau",
    header: "12. Đề xuất giải pháp ban đầu",
    width: 30,
    align: "left" as const,
  },
  {
    key: "nguoiChungKien",
    header: "13. Thông tin người chứng kiến",
    width: 24,
    align: "left" as const,
  },
  {
    key: "nguoiBaoCao",
    header:
      "14. Thông tin người báo cáo (Họ tên, SĐT/Email) - Căn cứ xét chế độ khuyến khích khen thưởng",
    width: 34,
    align: "left" as const,
  },
  {
    key: "ngayBaoCao",
    header: "15. Ngày báo cáo sự cố",
    width: 18,
    align: "center" as const,
  },
  {
    key: "trangThai",
    header: "Trạng thái",
    width: 16,
    align: "center" as const,
  },
];

// Định nghĩa cột cho Biểu mẫu 2: Phân tích sự cố y khoa (20 trường)
const analysisColumns = [
  { key: "masuco", header: "Mã sự cố", width: 14, align: "center" as const },
  {
    key: "khoaPhongBaoCao",
    header: "1. Khoa/phòng báo cáo sự cố?",
    width: 24,
    align: "left" as const,
  },
  {
    key: "loaiBaoCao",
    header: "2. Loại báo cáo?",
    width: 14,
    align: "center" as const,
  },
  {
    key: "phanLoaiSuCo",
    header: "3. Phân loại sự cố?",
    width: 20,
    align: "left" as const,
  },
  {
    key: "ngayGioXayRa",
    header: "4. Ngày, giờ xảy ra (phát hiện) sự cố?",
    width: 18,
    align: "center" as const,
  },
  {
    key: "doiTuong",
    header: "5. Đối tượng xảy ra sự cố?",
    width: 18,
    align: "left" as const,
  },
  {
    key: "thongTinNguoiBenh",
    header:
      "6. Thông tin người bệnh (Họ tên, ngày sinh, giới tính, số bệnh án, khoa/phòng)",
    width: 36,
    align: "left" as const,
  },
  {
    key: "viTri",
    header:
      "7. Vị trí xảy ra sự cố (khoa/phòng; nhà vệ sinh, hành lang, cầu thang khu vực nào; bãi giữ xe;...)",
    width: 30,
    align: "left" as const,
  },
  {
    key: "moTa",
    header: "8. Mô tả ngắn gọn nội dung sự cố",
    width: 38,
    align: "left" as const,
  },
  {
    key: "nhomSuCo",
    header: "9. Phân loại sự cố theo nhóm sự cố",
    width: 26,
    align: "left" as const,
  },
  {
    key: "moTaDieuTriYLenh",
    header: "10.Mô tả Điều trị/y lệnh đã được thực hiện",
    width: 32,
    align: "left" as const,
  },
  {
    key: "nhomNguyenNhan",
    header: "11. Phân loại sự cố theo nhóm nguyên nhân gây ra sự cố",
    width: 38,
    align: "left" as const,
  },
  {
    key: "hanhDongXuLy",
    header: "12. Mô tả hành động xử lý sự cố",
    width: 32,
    align: "left" as const,
  },
  {
    key: "deXuatKhuyenCao",
    header:
      "13. Đề xuất khuyến cáo phòng ngừa sự cố (Ghi đề xuất khuyến cáo phòng ngừa)",
    width: 34,
    align: "left" as const,
  },
  {
    key: "ketQuaPhatHien",
    header: "14. Mô tả kết quả phát hiện được (không lặp lại các mô tả sự cố)",
    width: 32,
    align: "left" as const,
  },
  {
    key: "daThaoLuan",
    header: "15. Đã thảo luận đưa khuyến cáo/hướng xử lý với người báo cáo",
    width: 26,
    align: "left" as const,
  },
  {
    key: "phuHopKhuyenCao",
    header:
      "16. Phù hợp với các khuyến cáo chính thức được ban hành Ghi cụ thể khuyến cáo",
    width: 32,
    align: "left" as const,
  },
  {
    key: "mucDoTonThuongNguoiBenh",
    header: "17.Mức độ tổn thương Trên người bệnh",
    width: 26,
    align: "left" as const,
  },
  {
    key: "mucDoAnhHuongToChuc",
    header: "18.Mức độ ảnh hưởng Trên tổ chức",
    width: 24,
    align: "left" as const,
  },
  {
    key: "trangThaiPt",
    header: "19.Trạng thái pt",
    width: 16,
    align: "center" as const,
  },
];

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "000000" } },
  left: { style: "thin", color: { argb: "000000" } },
  bottom: { style: "thin", color: { argb: "000000" } },
  right: { style: "thin", color: { argb: "000000" } },
};

function buildSheetHeader(
  worksheet: ExcelJS.Worksheet,
  title: string,
  filterInfo: string,
  colCount: number,
) {
  // Dòng 1: Tên cơ sở y tế
  const hospitalRow = worksheet.addRow(["SỞ Y TẾ AN GIANG"]);
  worksheet.mergeCells("A1:C1");
  hospitalRow.getCell(1).font = {
    name: "Times New Roman",
    size: 11,
    bold: true,
    color: { argb: "000000" },
  };
  hospitalRow.alignment = { horizontal: "center", vertical: "middle" };

  // Dòng 2: Phụ đề hệ thống
  const subTitleRow = worksheet.addRow(["BỆNH VIỆN ĐA KHOA NHẬT TÂN"]);
  worksheet.mergeCells("A2:C2");
  subTitleRow.getCell(1).font = {
    name: "Times New Roman",
    size: 11,
    bold: true,
    color: { argb: "000000" },
  };
  subTitleRow.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]); // Dòng trống 3

  // Dòng 4: Tiêu đề chính
  const mainTitleRow = worksheet.addRow([title]);
  const endColLetter = worksheet.getColumn(colCount).letter;
  worksheet.mergeCells(`A4:${endColLetter}4`);
  const titleCell = mainTitleRow.getCell(1);
  titleCell.font = {
    name: "Times New Roman",
    size: 15,
    bold: true,
    color: { argb: "000000" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  mainTitleRow.height = 28;

  // Dòng 5: Căn cứ thông tư 43
  const circularRow = worksheet.addRow([
    "(Theo hướng dẫn tại Thông tư số 43/2018/TT-BYT của Bộ Y tế)",
  ]);
  worksheet.mergeCells(`A5:${endColLetter}5`);
  const circularCell = circularRow.getCell(1);
  circularCell.font = {
    name: "Times New Roman",
    size: 10,
    italic: true,
    color: { argb: "FF475569" },
  };
  circularCell.alignment = { horizontal: "center", vertical: "middle" };

  // Dòng 6: Thông tin lọc thời gian
  const filterRow = worksheet.addRow([filterInfo]);
  worksheet.mergeCells(`A6:${endColLetter}6`);
  const filterCell = filterRow.getCell(1);
  filterCell.font = {
    name: "Times New Roman",
    size: 10,
    italic: true,
    color: { argb: "FF334155" },
  };
  filterCell.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]); // Dòng trống 7
}

function buildSheetFooter(
  worksheet: ExcelJS.Worksheet,
  rowCount: number,
  colCount: number,
  isAnalysis: boolean = false,
) {
  worksheet.addRow([]); // Dòng trống

  const summaryRow = worksheet.addRow([
    `Tổng cộng: ${rowCount} sự cố y khoa được ghi nhận.`,
  ]);
  const endColLetter = worksheet.getColumn(colCount).letter;
  worksheet.mergeCells(
    `A${summaryRow.number}:${endColLetter}${summaryRow.number}`,
  );
  summaryRow.getCell(1).font = {
    name: "Times New Roman",
    size: 10.5,
    bold: true,
    color: { argb: "000000" },
  };

  worksheet.addRow([]); // Dòng trống

  const signDateRow = worksheet.addRow([]);
  const dateColIdx = colCount - 2;
  signDateRow.getCell(dateColIdx).value = "Ngày ...... tháng ...... năm 20...";
  worksheet.mergeCells(
    `${worksheet.getColumn(dateColIdx).letter}${signDateRow.number}:${endColLetter}${signDateRow.number}`,
  );
  signDateRow.getCell(dateColIdx).alignment = { horizontal: "center" };
  signDateRow.getCell(dateColIdx).font = {
    name: "Times New Roman",
    size: 10,
    italic: true,
  };

  const signTitleRow = worksheet.addRow([]);
  signTitleRow.getCell(2).value = "NGƯỜI LẬP BIỂU";
  worksheet.mergeCells(`B${signTitleRow.number}:D${signTitleRow.number}`);
  signTitleRow.getCell(2).alignment = { horizontal: "center" };
  signTitleRow.getCell(2).font = {
    name: "Times New Roman",
    size: 10.5,
    bold: true,
  };

  if (isAnalysis) {
    const midCol = Math.floor(colCount / 2);
    signTitleRow.getCell(midCol).value = "TRƯỞNG PHÒNG QLCL";
    worksheet.mergeCells(
      `${worksheet.getColumn(midCol).letter}${signTitleRow.number}:${worksheet.getColumn(midCol + 2).letter}${signTitleRow.number}`,
    );
    signTitleRow.getCell(midCol).alignment = { horizontal: "center" };
    signTitleRow.getCell(midCol).font = {
      name: "Times New Roman",
      size: 10.5,
      bold: true,
    };

    signTitleRow.getCell(dateColIdx).value = "GIÁM ĐỐC BỆNH VIỆN";
    worksheet.mergeCells(
      `${worksheet.getColumn(dateColIdx).letter}${signTitleRow.number}:${endColLetter}${signTitleRow.number}`,
    );
    signTitleRow.getCell(dateColIdx).alignment = { horizontal: "center" };
    signTitleRow.getCell(dateColIdx).font = {
      name: "Times New Roman",
      size: 10.5,
      bold: true,
    };
  } else {
    signTitleRow.getCell(dateColIdx).value = "TRƯỞNG PHÒNG QUẢN LÝ CHẤT LƯỢNG";
    worksheet.mergeCells(
      `${worksheet.getColumn(dateColIdx).letter}${signTitleRow.number}:${endColLetter}${signTitleRow.number}`,
    );
    signTitleRow.getCell(dateColIdx).alignment = { horizontal: "center" };
    signTitleRow.getCell(dateColIdx).font = {
      name: "Times New Roman",
      size: 10.5,
      bold: true,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const mode = searchParams.get("mode") || "full"; // "notification" | "analysis" | "full"
    const masucoParam = searchParams.get("masuco");
    const activeMasuco = masucoParam ? parseInt(masucoParam, 10) : undefined;

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

    const { notificationRows, analysisRows } =
      await getComprehensiveIncidentExportData(filterParams);

    // Lọc theo sự cố cụ thể nếu có truyền masuco
    const filteredNotificationRows = activeMasuco
      ? notificationRows.filter(
          (r) =>
            r.masuco === String(activeMasuco) ||
            r.masuco === `SC${activeMasuco}`,
        )
      : notificationRows;

    const filteredAnalysisRows = activeMasuco
      ? analysisRows.filter(
          (r) =>
            r.masuco === String(activeMasuco) ||
            r.masuco === `SC${activeMasuco}`,
        )
      : analysisRows;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hệ thống QLSCYK - Bệnh viện Đa khoa Nhật Tân";
    workbook.created = new Date();

    const filterInfo = `Thời gian xuất: ${todayStr()} | Khoảng thời gian: ${
      tuNgay ? `${tuNgayTime} ${tuNgay}` : "Đầu"
    } — ${denNgay ? `${denNgayTime} ${denNgay}` : "Hiện tại"}`;

    // ─────────────────────────────────────────────────────────────────
    // SHEET 1: Thông báo sự cố y khoa (19 trường)
    // ─────────────────────────────────────────────────────────────────
    if (mode === "notification" || mode === "full") {
      const ws1 = workbook.addWorksheet("Thông báo sự cố", {
        pageSetup: {
          orientation: "landscape",
          paperSize: 9, // A4
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
        views: [{ showGridLines: true }],
      });

      buildSheetHeader(
        ws1,
        "DANH SÁCH BÁO CÁO SỰ CỐ Y KHOA",
        filterInfo,
        notificationColumns.length,
      );

      // Header row
      const headerValues = notificationColumns.map((col) => col.header);
      const headerRow = ws1.addRow(headerValues);
      headerRow.height = 36;

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        };
        cell.font = {
          name: "Times New Roman",
          size: 10.5,
          bold: true,
          color: { argb: "000000" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
      });

      // Data rows
      filteredNotificationRows.forEach((row) => {
        const dataValues = [
          row.masuco,
          row.khoaPhongBaoCao,
          row.loaiBaoCao,
          row.phanLoaiSuCo,
          row.ngayGioXayRa,
          row.doiTuong,
          row.thongTinNguoiBenh,
          row.viTri,
          row.moTa,
          row.dieuTriBanDau,
          row.ghiNhanHSBA,
          row.thongBaoBacSy,
          row.thongBaoNguoiNha,
          row.thongBaoNguoiBenh,
          row.deXuatBanDau,
          row.nguoiChungKien,
          row.nguoiBaoCao,
          row.ngayBaoCao,
          row.trangThai,
        ];

        const dataRow = ws1.addRow(dataValues);

        dataRow.eachCell((cell, colNumber) => {
          const colDef = notificationColumns[colNumber - 1];
          cell.font = {
            name: "Times New Roman",
            size: 10,
            color: { argb: "000000" },
          };
          cell.alignment = {
            vertical: "top",
            horizontal: colDef ? colDef.align : "left",
            wrapText: true,
          };
          cell.border = thinBorder;
        });
      });

      notificationColumns.forEach((col, idx) => {
        ws1.getColumn(idx + 1).width = col.width;
      });

      buildSheetFooter(
        ws1,
        filteredNotificationRows.length,
        notificationColumns.length,
        false,
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // SHEET 2: Phân tích sự cố y khoa (20 trường)
    // ─────────────────────────────────────────────────────────────────
    if (mode === "analysis" || mode === "full") {
      const ws2 = workbook.addWorksheet("Phân tích sự cố", {
        pageSetup: {
          orientation: "landscape",
          paperSize: 9, // A4
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
        views: [{ showGridLines: true }],
      });

      buildSheetHeader(
        ws2,
        "DANH SÁCH BÁO CÁO PHÂN TÍCH SỰ CỐ Y KHOA",
        filterInfo,
        analysisColumns.length,
      );

      // Header row
      const headerValues = analysisColumns.map((col) => col.header);
      const headerRow = ws2.addRow(headerValues);
      headerRow.height = 36;

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        };
        cell.font = {
          name: "Times New Roman",
          size: 10.5,
          bold: true,
          color: { argb: "000000" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = thinBorder;
      });

      // Data rows
      filteredAnalysisRows.forEach((row) => {
        const dataValues = [
          row.masuco,
          row.khoaPhongBaoCao,
          row.loaiBaoCao,
          row.phanLoaiSuCo,
          row.ngayGioXayRa,
          row.doiTuong,
          row.thongTinNguoiBenh,
          row.viTri,
          row.moTa,
          row.nhomSuCo,
          row.moTaDieuTriYLenh,
          row.nhomNguyenNhan,
          row.hanhDongXuLy,
          row.deXuatKhuyenCao,
          row.ketQuaPhatHien,
          row.daThaoLuan,
          row.phuHopKhuyenCao,
          row.mucDoTonThuongNguoiBenh,
          row.mucDoAnhHuongToChuc,
          row.trangThaiPt,
        ];

        const dataRow = ws2.addRow(dataValues);

        dataRow.eachCell((cell, colNumber) => {
          const colDef = analysisColumns[colNumber - 1];
          cell.font = {
            name: "Times New Roman",
            size: 10,
            color: { argb: "000000" },
          };
          cell.alignment = {
            vertical: "top",
            horizontal: colDef ? colDef.align : "left",
            wrapText: true,
          };
          cell.border = thinBorder;
        });
      });

      analysisColumns.forEach((col, idx) => {
        ws2.getColumn(idx + 1).width = col.width;
      });

      buildSheetFooter(
        ws2,
        filteredAnalysisRows.length,
        analysisColumns.length,
        true,
      );
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const dateFormatted = todayStr().replace(/\//g, "-");

    let filename = `Bao_cao_SCYK_${dateFormatted}.xlsx`;
    if (mode === "analysis") {
      filename = `Bao_cao_phan_tich_SCYK_${dateFormatted}.xlsx`;
    } else if (mode === "full") {
      filename = `Tong_hop_SCYK_toan_dien_${dateFormatted}.xlsx`;
    }

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
