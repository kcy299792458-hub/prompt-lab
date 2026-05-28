import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "프롬프트랩 - GPT Image AI 이미지 프롬프트 갤러리",
    template: "%s | 프롬프트랩",
  },
  description:
    "GPT Image, Midjourney, Stable Diffusion용 AI 이미지 프롬프트 예시와 실제 결과 이미지를 함께 확인하는 프롬프트 갤러리.",
  keywords: [
    "이미지 프롬프트",
    "AI 이미지",
    "프롬프트 공유",
    "프롬프트랩",
    "GPT Image 프롬프트",
    "Midjourney 프롬프트",
    "Stable Diffusion 프롬프트",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "7z74D7rzgvjaBFKh61hWa3SNEMTnPt_gKiDlpicDfKY",
  },
  openGraph: {
    title: "프롬프트랩",
    description: "AI 이미지 결과와 실제 프롬프트를 한 번에 확인",
    url: SITE_URL,
    siteName: "프롬프트랩",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image-v2.png",
        width: 1200,
        height: 630,
        alt: "프롬프트랩 대표 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "프롬프트랩",
    description: "GPT Image, Midjourney, Stable Diffusion용 AI 이미지 프롬프트 예시와 결과 이미지를 함께 확인하는 갤러리.",
    images: ["/og-image-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
