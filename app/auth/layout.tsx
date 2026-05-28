import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인증",
  alternates: {
    canonical: "/auth/callback",
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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
