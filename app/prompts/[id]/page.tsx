import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PromptDetailClient from "./PromptDetailClient";
import { prompts } from "@/data/prompts";
import {
  absoluteUrl,
  findPromptByParam,
  getBreadcrumbJsonLd,
  getCategoryPath,
  getPromptPath,
  getPromptJsonLd,
  getPromptKeywords,
  getPromptSeoDescription,
  getPromptSeoTitle,
} from "@/lib/seo";
import { SeoJsonLd } from "@/app/components/SeoLanding";

type PromptPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return prompts.map((prompt) => ({
    id: getPromptPath(prompt).split("/").pop() || String(prompt.id),
  }));
}

export async function generateMetadata({
  params,
}: PromptPageProps): Promise<Metadata> {
  const { id } = await params;
  const prompt = findPromptByParam(id);

  if (!prompt) {
    return {
      title: "게시물을 찾을 수 없습니다",
    };
  }

  const imageUrl = absoluteUrl(prompt.image);
  const pageUrl = absoluteUrl(getPromptPath(prompt));
  const title = getPromptSeoTitle(prompt);
  const description = getPromptSeoDescription(prompt);

  return {
    title,
    description,
    keywords: getPromptKeywords(prompt),
    alternates: {
      canonical: getPromptPath(prompt),
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "프롬프트랩",
      locale: "ko_KR",
      type: "article",
      images: [
        {
          url: imageUrl,
          alt: `${prompt.title} 결과 이미지`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PromptDetailPage({ params }: PromptPageProps) {
  const { id } = await params;
  const prompt = findPromptByParam(id);

  if (!prompt) {
    notFound();
  }

  return (
    <>
      <SeoJsonLd data={getPromptJsonLd(prompt)} />
      <SeoJsonLd
        data={getBreadcrumbJsonLd([
          { name: "프롬프트랩", path: "/" },
          { name: prompt.category, path: getCategoryPath(prompt.category) },
          { name: prompt.title, path: getPromptPath(prompt) },
        ])}
      />
      <PromptDetailClient />
    </>
  );
}
