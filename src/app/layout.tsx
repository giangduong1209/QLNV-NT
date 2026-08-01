import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BỆNH VIỆN ĐA KHOA NHẬT TÂN — Quản lý sự cố y khoa",
  description: "Quản lý sự cố y khoa — Bệnh viện đa khoa Nhật Tân",
  icons: {
    icon: "/nhat_tan_logo.png",
    shortcut: "/nhat_tan_logo.png",
    apple: "/nhat_tan_logo.png",
  },
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
