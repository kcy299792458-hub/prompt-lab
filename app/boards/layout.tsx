import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프롬프트 게시판",
  alternates: {
    canonical: "/boards",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
