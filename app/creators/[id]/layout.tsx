import type { Metadata } from "next";
import { SeoJsonLd } from "@/app/components/SeoLanding";
import {
  fetchSeoCreator,
  getCreatorMetadata,
  getCreatorProfileJsonLd,
  noindexMetadata,
} from "@/lib/seo-dynamic";

type CreatorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: CreatorLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchSeoCreator(id);

  if (!data) {
    return noindexMetadata("크리에이터를 찾을 수 없습니다");
  }

  return getCreatorMetadata(data.profile, data.posts);
}

export default async function CreatorLayout({
  children,
  params,
}: CreatorLayoutProps) {
  const { id } = await params;
  const data = await fetchSeoCreator(id);

  return (
    <>
      {data && data.posts.length > 0 && (
        <SeoJsonLd data={getCreatorProfileJsonLd(data.profile, data.posts)} />
      )}
      {children}
    </>
  );
}
