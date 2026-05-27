import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://prompt-lab-drab-xi.vercel.app"),
  title: {
    default: "프롬포트랩 - 이미지 프롬프트 커뮤니티",
    template: "%s | 프롬포트랩",
  },
  description:
    "결과 이미지와 프롬프트 원문을 함께 보고, 저장하고, 공유하는 이미지 프롬프트 커뮤니티.",
  keywords: [
    "이미지 프롬프트",
    "AI 이미지",
    "프롬프트 공유",
    "프롬포트랩",
    "Midjourney",
    "GPT Image",
    "AI 커뮤니티",
  ],
  openGraph: {
    title: "프롬포트랩",
    description: "결과로 검증된 이미지 프롬포트 모음",
    url: "https://prompt-lab-drab-xi.vercel.app",
    siteName: "프롬포트랩",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "프롬포트랩",
    description: "결과 이미지와 프롬프트 원문을 함께 보는 이미지 프롬프트 커뮤니티.",
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
