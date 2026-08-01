import { prisma } from "@/lib/prisma";
import { DANH_MUC_PHAI } from "@/constants/department";

export async function getLookupDataFromDB() {
  const phai = DANH_MUC_PHAI;
  const [
    loaiSuCo,
    tenSuCo,
    hinhThuc,
    doiTuong,
    phong,
    phongNoi,
    phanLoaiBanDau,
    danhGiaBanDau,
    listKyThuat,
    listNhiemKhuan,
    listThuoc,
    listMau,
    listThietBiYTe,
    listHanhVi,
    listTaiNan,
    listHaTang,
    listNguonLuc,
    listTaiLieu,
    listNhanVien,
    listNguoiBenh,
    listMoiTruong,
    listToChuc,
    listYeuToBenNgoai,
    tonThuongNguoiBenh,
    tonThuongToChuc,
  ] = await Promise.all([
    prisma.dmloaisuco.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maloaiscyk: true, tenloaiscyk: true },
    }),
    prisma.dmtensucoyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { idscyk: true, maloaiscyk: true, tensucoyk: true },
    }),
    prisma.dmhinhthuc_scyk.findMany({
      select: { mahinhthuc: true, tenhinhthuc: true },
    }),
    prisma.dmdoituongsc_scyk.findMany({
      select: { madoituongsc: true, doituongsc: true },
    }),
    prisma.dmphong_scyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maphong: true, tenphong: true, loai: true, sapxep: true },
    }),
    prisma.dmphongnoi_scyk.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: {
        maphongnoi: true,
        maphong: true,
        tenphongnoi: true,
        sapxep: true,
      },
    }),
    prisma.dmphanloaibandau.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { maphanloai: true, tenphanloai: true },
    }),
    prisma.dmdanhgiabandau.findMany({
      where: { ksd: false },
      orderBy: { sapxep: "asc" },
      select: { madanhgia: true, mamucdo: true, tendanhgia: true },
    }),
    prisma.dmkythuat_scyk.findMany({
      select: { makythuat: true, tenkythuat: true },
    }),
    prisma.dmnhiemkhuan_scyk.findMany({
      select: { manhiemkhuan: true, tennhiemkhuan: true },
    }),
    prisma.dmthuoc_scyk.findMany({
      select: { mathuoc: true, tenthuoc: true },
    }),
    prisma.dmmau_scyk.findMany({
      select: { mamau: true, tenmau: true },
    }),
    prisma.dmthietbiyte_scyk.findMany({
      select: { mathietbiyte: true, tenthietbiyte: true },
    }),
    prisma.dmhanhvi_scyk.findMany({
      select: { mahanhvi: true, tenhanhvi: true },
    }),
    prisma.dmtainan_scyk.findMany({
      select: { matainan: true, tentainan: true },
    }),
    prisma.dmhatang_scyk.findMany({
      select: { mahatang: true, tenhatang: true },
    }),
    prisma.dmnguonluc_scyk.findMany({
      select: { manguonluc: true, tennguonluc: true },
    }),
    prisma.dmtailieu_scyk.findMany({
      select: { matailieu: true, tentailieu: true },
    }),
    prisma.dmnhanvien_scyk.findMany({
      select: { manhanvien: true, tennhanvien: true },
    }),
    prisma.dmnguoibenh_scyk.findMany({
      select: { manguoibenh: true, tennguoibenh: true },
    }),
    prisma.dmmoitruong_scyk.findMany({
      select: { mamoitruong: true, tenmoitruong: true },
    }),
    prisma.dmtochuc_scyk.findMany({
      select: { matochuc: true, tentochuc: true },
    }),
    prisma.dmyeutobenngoai_scyk.findMany({
      select: { mayeutobenngoai: true, tenyeutobenngoai: true },
    }),
    prisma.dmtonthuongnguoibenh_scyk.findMany({
      select: {
        maphanloai: true,
        macapdotonthuong: true,
        capdotonthuong: true,
        motasucoykhoa: true,
      },
      orderBy: { sapxep: "asc" },
    }),
    prisma.dmtonthuongtrentochuc_scyk.findMany({
      select: { matonthuong: true, tentonthuong: true },
      orderBy: { matonthuong: "asc" },
    }),
  ]);

  const causeSubItemsMap = {
    kythuat: listKyThuat.map((x) => ({
      id: x.makythuat,
      name: x.tenkythuat ?? `Mục ${x.makythuat}`,
    })),
    nhiemkhuan: listNhiemKhuan.map((x) => ({
      id: x.manhiemkhuan,
      name: x.tennhiemkhuan ?? `Mục ${x.manhiemkhuan}`,
    })),
    thuoc: listThuoc.map((x) => ({
      id: x.mathuoc,
      name: x.tenthuoc ?? `Mục ${x.mathuoc}`,
    })),
    mau: listMau.map((x) => ({
      id: x.mamau,
      name: x.tenmau ?? `Mục ${x.mamau}`,
    })),
    thietbiyte: listThietBiYTe.map((x) => ({
      id: x.mathietbiyte,
      name: x.tenthietbiyte ?? `Mục ${x.mathietbiyte}`,
    })),
    hanhvi: listHanhVi.map((x) => ({
      id: x.mahanhvi,
      name: x.tenhanhvi ?? `Mục ${x.mahanhvi}`,
    })),
    tainan: listTaiNan.map((x) => ({
      id: x.matainan,
      name: x.tentainan ?? `Mục ${x.matainan}`,
    })),
    hatang: listHaTang.map((x) => ({
      id: x.mahatang,
      name: x.tenhatang ?? `Mục ${x.mahatang}`,
    })),
    nguonluc: listNguonLuc.map((x) => ({
      id: x.manguonluc,
      name: x.tennguonluc ?? `Mục ${x.manguonluc}`,
    })),
    tailieu: listTaiLieu.map((x) => ({
      id: x.matailieu,
      name: x.tentailieu ?? `Mục ${x.matailieu}`,
    })),
    nnnnhanvien: listNhanVien.map((x) => ({
      id: x.manhanvien,
      name: x.tennhanvien ?? `Mục ${x.manhanvien}`,
    })),
    nnnnguoibenh: listNguoiBenh.map((x) => ({
      id: x.manguoibenh,
      name: x.tennguoibenh ?? `Mục ${x.manguoibenh}`,
    })),
    nnnmoitruong: listMoiTruong.map((x) => ({
      id: x.mamoitruong,
      name: x.tenmoitruong ?? `Mục ${x.mamoitruong}`,
    })),
    nnntochuc: listToChuc.map((x) => ({
      id: x.matochuc,
      name: x.tentochuc ?? `Mục ${x.matochuc}`,
    })),
    nnnbenngoai: listYeuToBenNgoai.map((x) => ({
      id: x.mayeutobenngoai,
      name: x.tenyeutobenngoai ?? `Mục ${x.mayeutobenngoai}`,
    })),
  };

  const causeMaxOptionsMap: Record<string, number> = {};
  for (const [causeKey, subItemList] of Object.entries(causeSubItemsMap)) {
    causeMaxOptionsMap[causeKey] = subItemList.length;
  }

  return {
    loaiSuCo,
    tenSuCo,
    hinhThuc,
    phai,
    doiTuong,
    phong,
    phongNoi,
    phanLoaiBanDau,
    danhGiaBanDau,
    tonThuongNguoiBenh,
    tonThuongToChuc,
    causeMaxOptionsMap,
    causeSubItemsMap,
  };
}
