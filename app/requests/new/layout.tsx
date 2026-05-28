import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프롬프트 요청 작성",
  alternates: {
    canonical: "/requests/new",
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

export default function RequestWriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
