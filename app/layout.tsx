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
    "AI 이미지 예시와 프롬프트 원문, 모델 정보를 함께 확인하는 이미지 프롬프트 갤러리.",
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
    description: "이미지, 원문, 모델까지 한 번에 확인",
    url: siteUrl,
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
    description: "AI 이미지 예시와 프롬프트 원문, 모델 정보를 함께 확인하는 이미지 프롬프트 갤러리.",
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
