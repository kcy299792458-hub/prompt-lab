import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 프롬프트 업로드",
  alternates: {
    canonical: "/upload",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
