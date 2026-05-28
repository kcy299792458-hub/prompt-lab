import Link from "next/link";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import type { Prompt } from "@/data/prompts";
import {
  getCategoryPath,
  getModelPath,
  getPromptPath,
  getPromptSeoDescription,
  getTagPath,
} from "@/lib/seo";

export function SeoJsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SeoSiteHeader({ label = "AI 이미지 갤러리" }: { label?: string }) {
  return (
    <header className="topbar dc-topbar">
      <Link className="brand dc-brand" href="/">
        <span className="brand-mark">
          <img className="brand-logo" src="/logo.png" alt="" />
        </span>
        <span>
          <strong>프롬프트랩</strong>
          <small>{label}</small>
        </span>
      </Link>
      <nav className="topnav dc-topnav" aria-label="주요 메뉴">
        <Link href="/">이미지</Link>
        <Link href="/boards">게시판</Link>
        <Link href="/saved">저장함</Link>
        <Link href="/upload">업로드</Link>
        <AuthControls />
      </nav>
    </header>
  );
}

export function SeoPromptGrid({ prompts }: { prompts: Prompt[] }) {
  return (
    <div className="gallery-grid dc-gallery-grid seo-prompt-grid">
      {prompts.map((prompt) => (
        <Link key={prompt.id} className="image-card dc-image-card" href={getPromptPath(prompt)}>
          <img src={prompt.image} alt={`${prompt.title} AI 이미지 프롬프트 결과`} />
          <div className="image-card-body">
            <div className="card-meta">
              <span>{prompt.category}</span>
              <span>{prompt.aspectRatio}</span>
            </div>
            <h3>{prompt.title}</h3>
            <p>{getPromptSeoDescription(prompt)}</p>
            <div className="dc-card-info">
              <span>{prompt.model}</span>
              <span>{prompt.language}</span>
              <span>{prompt.style}</span>
            </div>
            <div className="card-author-line dc-card-author-line">
              <span>작성자 @{prompt.authorName || "운영자"}</span>
              <span>예시</span>
            </div>
            <div className="card-reactions" aria-label="프롬프트 반응">
              <span>
                <Heart size={14} aria-hidden="true" /> 0
              </span>
              <span>
                <Bookmark size={14} aria-hidden="true" /> 0
              </span>
              <span>
                <MessageCircle size={14} aria-hidden="true" /> 0
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function RelatedSeoLinks({ prompts }: { prompts: Prompt[] }) {
  const categories = [...new Set(prompts.map((prompt) => prompt.category))];
  const tags = [...new Set(prompts.flatMap((prompt) => prompt.tags))].slice(0, 16);
  const models = [...new Set(prompts.map((prompt) => prompt.model))];

  return (
    <section className="seo-link-section" aria-label="관련 프롬프트 탐색">
      <div>
        <h2>관련 주제로 더 보기</h2>
        <p>카테고리, 모델, 태그별로 비슷한 AI 이미지 프롬프트를 이어서 탐색할 수 있습니다.</p>
      </div>
      <div className="seo-link-groups">
        <div>
          <strong>카테고리</strong>
          <div className="seo-chip-row">
            {categories.map((category) => (
              <Link key={category} href={getCategoryPath(category)}>
                {category}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <strong>모델</strong>
          <div className="seo-chip-row">
            {models.map((model) => (
              <Link key={model} href={getModelPath(model)}>
                {model}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <strong>태그</strong>
          <div className="seo-chip-row">
            {tags.map((tag) => (
              <Link key={tag} href={getTagPath(tag)}>
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
