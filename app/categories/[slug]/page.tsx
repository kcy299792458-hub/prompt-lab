import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SeoJsonLd, SeoPromptGrid, SeoSiteHeader, RelatedSeoLinks } from "@/app/components/SeoLanding";
import { prompts } from "@/data/prompts";
import {
  absoluteUrl,
  categoryLandingPages,
  getBreadcrumbJsonLd,
  getCategoryConfigBySlug,
  getCollectionJsonLd,
} from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return categoryLandingPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getCategoryConfigBySlug(slug);

  if (!page) {
    return {
      title: "카테고리를 찾을 수 없습니다",
    };
  }

  const path = `/categories/${page.slug}`;

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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const page = getCategoryConfigBySlug(slug);

  if (!page) {
    notFound();
  }

  const categoryPrompts = prompts.filter((prompt) => prompt.category === page.category);
  const path = `/categories/${page.slug}`;

  return (
    <main className="site-shell dc-shell">
      <SeoJsonLd
        data={getCollectionJsonLd({
          name: page.title,
          description: page.description,
          path,
          items: categoryPrompts,
        })}
      />
      <SeoJsonLd
        data={getBreadcrumbJsonLd([
          { name: "프롬프트랩", path: "/" },
          { name: "카테고리", path: "/#gallery" },
          { name: page.category, path },
        ])}
      />
      <SeoSiteHeader label="카테고리" />

      <section className="seo-landing-page">
        <Link href="/" className="back-link dc-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          갤러리로
        </Link>

        <section className="dc-headline seo-headline">
          <div>
            <p className="section-kicker">Category</p>
            <h1>{page.h1}</h1>
            <p>{page.description}</p>
          </div>
          <div className="seo-count-box">
            <strong>{categoryPrompts.length}</strong>
            <span>프롬프트</span>
          </div>
        </section>

        <section className="seo-intro-section">
          <p>{page.intro}</p>
        </section>

        <section className="creator-section">
          <div className="section-heading">
            <h2>{page.category} 프롬프트</h2>
            <span>{categoryPrompts.length}개</span>
          </div>
          <SeoPromptGrid prompts={categoryPrompts} />
        </section>

        <RelatedSeoLinks prompts={categoryPrompts} />
      </section>
    </main>
  );
}
