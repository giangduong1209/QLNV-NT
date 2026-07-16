import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QLSCYK — Quản lý Sự cố Y khoa",
  description:
    "Hệ thống Quản lý và Báo cáo Sự cố Y khoa — Nội bộ Bệnh viện",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( 
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning 
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
