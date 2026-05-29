import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SeoJsonLd, SeoPromptGrid, SeoSiteHeader, RelatedSeoLinks } from "@/app/components/SeoLanding";
import {
  absoluteUrl,
  getAllTags,
  getBreadcrumbJsonLd,
  getCollectionJsonLd,
  getPromptsByTag,
  getTagPath,
  isIndexableTag,
} from "@/lib/seo";

type TagPageProps = {
  params: Promise<{
    tag: string;
  }>;
};

function normalizeParamTag(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({
    tag,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = normalizeParamTag(rawTag);
  const taggedPrompts = getPromptsByTag(tag);

  if (taggedPrompts.length === 0) {
    return {
      title: "태그를 찾을 수 없습니다",
    };
  }

  const path = getTagPath(tag);
  const title = `#${tag} AI 이미지 프롬프트 모음`;
  const description = `#${tag} 태그가 붙은 AI 이미지 프롬프트와 결과 예시를 모았습니다. GPT Image, Midjourney, Stable Diffusion 프롬프트를 함께 확인하세요.`;
  const shouldIndex = isIndexableTag(tag);

  return {
    title,
    description,
    keywords: [`${tag} 프롬프트`, `${tag} AI 이미지`, `AI 이미지 프롬프트`],
    alternates: {
      canonical: path,
    },
    robots: shouldIndex
      ? { index: true, follow: true }
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "프롬프트랩",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: "/og-image-v2.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image-v2.png"],
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: rawTag } = await params;
  const tag = normalizeParamTag(rawTag);
  const taggedPrompts = getPromptsByTag(tag);

  if (taggedPrompts.length === 0) {
    notFound();
  }

  const path = getTagPath(tag);
  const title = `#${tag} AI 이미지 프롬프트`;
  const description = `#${tag} 태그로 분류된 AI 이미지 프롬프트 예시입니다. 결과 이미지, 모델, 스타일, 실제 프롬프트 원문을 함께 확인할 수 있습니다.`;

  return (
    <main className="site-shell dc-shell">
      <SeoJsonLd
        data={getCollectionJsonLd({
          name: title,
          description,
          path,
          items: taggedPrompts,
        })}
      />
      <SeoJsonLd
        data={getBreadcrumbJsonLd([
          { name: "프롬프트랩", path: "/" },
          { name: "태그", path: "/#gallery" },
          { name: `#${tag}`, path },
        ])}
      />
      <SeoSiteHeader label="태그" />

      <section className="seo-landing-page">
        <Link href="/" className="back-link dc-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          갤러리로
        </Link>

        <section className="dc-headline seo-headline">
          <div>
            <p className="section-kicker">Tag</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="seo-count-box">
            <strong>{taggedPrompts.length}</strong>
            <span>프롬프트</span>
          </div>
        </section>

        <section className="seo-intro-section">
          <p>
            같은 태그의 프롬프트를 모아 보면 어떤 키워드와 이미지 결과가 반복적으로 잘 작동하는지
            비교하기 쉽습니다. 마음에 드는 예시를 열어 실제 프롬프트 원문과 모델 정보를 확인하세요.
          </p>
        </section>

        <section className="creator-section">
          <div className="section-heading">
            <h2>#{tag} 프롬프트</h2>
            <span>{taggedPrompts.length}개</span>
          </div>
          <SeoPromptGrid prompts={taggedPrompts} />
        </section>

        <RelatedSeoLinks prompts={taggedPrompts} />
      </section>
    </main>
  );
}
