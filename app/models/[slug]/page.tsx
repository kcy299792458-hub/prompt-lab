import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SeoJsonLd, SeoPromptGrid, SeoSiteHeader, RelatedSeoLinks } from "@/app/components/SeoLanding";
import { prompts } from "@/data/prompts";
import {
  absoluteUrl,
  getBreadcrumbJsonLd,
  getCollectionJsonLd,
  getModelConfigBySlug,
  modelLandingPages,
} from "@/lib/seo";

type ModelPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return modelLandingPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getModelConfigBySlug(slug);

  if (!page) {
    return {
      title: "모델을 찾을 수 없습니다",
    };
  }

  const path = `/models/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(path),
      siteName: "프롬프트랩",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: "/og-image-v2.png",
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/og-image-v2.png"],
    },
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params;
  const page = getModelConfigBySlug(slug);

  if (!page) {
    notFound();
  }

  const modelPrompts = prompts.filter((prompt) => page.matches(prompt.model));
  const path = `/models/${page.slug}`;

  return (
    <main className="site-shell dc-shell">
      <SeoJsonLd
        data={getCollectionJsonLd({
          name: page.title,
          description: page.description,
          path,
          items: modelPrompts,
        })}
      />
      <SeoJsonLd
        data={getBreadcrumbJsonLd([
          { name: "프롬프트랩", path: "/" },
          { name: "모델", path: "/#gallery" },
          { name: page.label, path },
        ])}
      />
      <SeoSiteHeader label="모델" />

      <section className="seo-landing-page">
        <Link href="/" className="back-link dc-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          갤러리로
        </Link>

        <section className="dc-headline seo-headline">
          <div>
            <p className="section-kicker">Model</p>
            <h1>{page.h1}</h1>
            <p>{page.description}</p>
          </div>
          <div className="seo-count-box">
            <strong>{modelPrompts.length}</strong>
            <span>프롬프트</span>
          </div>
        </section>

        <section className="seo-intro-section">
          <p>{page.intro}</p>
        </section>

        <section className="creator-section">
          <div className="section-heading">
            <h2>{page.label} 프롬프트</h2>
            <span>{modelPrompts.length}개</span>
          </div>
          <SeoPromptGrid prompts={modelPrompts} />
        </section>

        <RelatedSeoLinks prompts={modelPrompts} />
      </section>
    </main>
  );
}
