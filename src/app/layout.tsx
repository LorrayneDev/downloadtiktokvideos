import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TikTok Video Downloader - Baixe vídeos em MP4",
  description: "Baixe vídeos do TikTok em MP4 de forma rápida e gratuita. Interface moderna e intuitiva.",
  keywords: ["TikTok", "video downloader", "MP4", "TikTok downloader", "baixar vídeo"],
  authors: [{ name: "TikTok Downloader Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TikTok Video Downloader",
    description: "Baixe vídeos do TikTok em MP4",
    url: "https://chat.z.ai",
    siteName: "TikTok Downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Video Downloader",
    description: "Baixe vídeos do TikTok em MP4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
