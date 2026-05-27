import type { Metadata } from "next";
import PromptDetailClient from "./PromptDetailClient";
import { prompts } from "@/data/prompts";

const siteUrl = "https://prompt-lab-drab-xi.vercel.app";

type PromptPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return prompts.map((prompt) => ({
    id: String(prompt.id),
  }));
}

export async function generateMetadata({
  params,
}: PromptPageProps): Promise<Metadata> {
  const { id } = await params;
  const prompt = prompts.find((item) => item.id === Number(id));

  if (!prompt) {
    return {
      title: "게시물을 찾을 수 없습니다",
    };
  }

  const imageUrl = new URL(prompt.image, siteUrl).toString();
  const pageUrl = `${siteUrl}/prompts/${prompt.id}`;

  return {
    title: `${prompt.title} - 프롬프트랩`,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
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
      title: prompt.title,
      description: prompt.description,
      images: [imageUrl],
    },
  };
}

export default function PromptDetailPage() {
  return <PromptDetailClient />;
}
