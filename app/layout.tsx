import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://prompt-lab-drab-xi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "프롬프트랩 - AI 이미지 갤러리",
    template: "%s | 프롬프트랩",
  },
  description:
    "결과 이미지와 프롬프트 원문을 함께 보고, 저장하고, 공유하는 AI 이미지 커뮤니티.",
  keywords: [
    "이미지 프롬프트",
    "AI 이미지",
    "프롬프트 공유",
    "프롬프트랩",
    "Midjourney",
    "GPT Image",
    "AI 커뮤니티",
  ],
  openGraph: {
    title: "프롬프트랩",
    description: "결과로 검증된 이미지 프롬프트 모음",
    url: siteUrl,
    siteName: "프롬프트랩",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "프롬프트랩 대표 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "프롬프트랩",
    description: "결과 이미지와 프롬프트 원문을 함께 보는 AI 이미지 커뮤니티.",
    images: ["/og-image.png"],
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
