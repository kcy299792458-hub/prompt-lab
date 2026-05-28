import type { Metadata } from "next";
import { SeoJsonLd } from "@/app/components/SeoLanding";
import {
  fetchSeoImagePost,
  getImagePostJsonLd,
  getImagePostMetadata,
  noindexMetadata,
} from "@/lib/seo-dynamic";

type ImagePostLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ImagePostLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchSeoImagePost(id);

  if (!data) {
    return noindexMetadata("이미지 게시글을 찾을 수 없습니다");
  }

  return getImagePostMetadata(data.post);
}

export default async function ImagePostLayout({
  children,
  params,
}: ImagePostLayoutProps) {
  const { id } = await params;
  const data = await fetchSeoImagePost(id);

  return (
    <>
      {data && <SeoJsonLd data={getImagePostJsonLd(data.post, data.versions)} />}
      {children}
    </>
  );
}
