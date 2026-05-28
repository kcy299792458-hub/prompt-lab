import type { Metadata } from "next";
import { SeoJsonLd } from "@/app/components/SeoLanding";
import {
  fetchSeoPromptRequest,
  getPromptRequestJsonLd,
  getPromptRequestMetadata,
  noindexMetadata,
} from "@/lib/seo-dynamic";

type PromptRequestLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PromptRequestLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchSeoPromptRequest(id);

  if (!data) {
    return noindexMetadata("프롬프트 요청을 찾을 수 없습니다");
  }

  return getPromptRequestMetadata(data.request, data.answers);
}

export default async function PromptRequestLayout({
  children,
  params,
}: PromptRequestLayoutProps) {
  const { id } = await params;
  const data = await fetchSeoPromptRequest(id);
  const shouldExposeJsonLd = data && data.request.status === "resolved" && data.answers.length > 0;

  return (
    <>
      {shouldExposeJsonLd && (
        <SeoJsonLd data={getPromptRequestJsonLd(data.request, data.answers)} />
      )}
      {children}
    </>
  );
}
