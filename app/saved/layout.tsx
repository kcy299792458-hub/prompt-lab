import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "저장한 프롬프트",
  alternates: {
    canonical: "/saved",
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

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
