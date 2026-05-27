"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Camera,
  FileText,
  Heart,
  Layers,
  MessageCircle,
  Search,
  Upload,
} from "lucide-react";
import { categories, prompts } from "@/data/prompts";
import { AuthControls } from "@/app/components/AuthControls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type FeedTab = "all" | "korean" | "english" | "mixed";
type PromptCounts = Record<number, { likes: number; saves: number; comments: number }>;

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [feedTab, setFeedTab] = useState<FeedTab>("all");
  const [promptCounts, setPromptCounts] = useState<PromptCounts>({});
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const client = supabase;
    const promptIds = prompts.map((prompt) => prompt.id);

    async function loadPromptCounts() {
      const [reactionResult, commentResult] = await Promise.all([
        client
          .from("prompt_reactions")
          .select("prompt_id, kind")
          .in("prompt_id", promptIds),
        client
          .from("prompt_comments")
          .select("prompt_id")
          .eq("is_hidden", false)
          .in("prompt_id", promptIds),
      ]);

      if (!isMounted) return;

      const nextCounts: PromptCounts = {};

      if (!reactionResult.error) {
        reactionResult.data?.forEach((reaction) => {
          const promptId = Number(reaction.prompt_id);
          nextCounts[promptId] ??= { likes: 0, saves: 0, comments: 0 };

          if (reaction.kind === "like") nextCounts[promptId].likes += 1;
          if (reaction.kind === "save") nextCounts[promptId].saves += 1;
        });
      }

      if (!commentResult.error) {
        commentResult.data?.forEach((comment) => {
          const promptId = Number(comment.prompt_id);
          nextCounts[promptId] ??= { likes: 0, saves: 0, comments: 0 };
          nextCounts[promptId].comments += 1;
        });
      }

      setPromptCounts(nextCounts);
    }

    loadPromptCounts();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = prompts.filter((prompt) => {
      const matchesCategory = category === "전체" || prompt.category === category;
      const matchesTab =
        feedTab === "all" ||
        (feedTab === "korean" &&
          (prompt.language === "한국어" ||
            prompt.language === "한영 혼합" ||
            prompt.promptVersions?.some((version) => version.language === "한국어"))) ||
        (feedTab === "english" &&
          (prompt.language === "영어" ||
            prompt.promptVersions?.some((version) => version.language === "영어"))) ||
        (feedTab === "mixed" && prompt.language === "한영 혼합");
      const searchableText = [
        prompt.title,
        prompt.description,
        prompt.category,
        prompt.model,
        prompt.style,
        prompt.language,
        prompt.aspectRatio,
        ...(prompt.promptVersions?.map((version) => version.body) ?? []),
        prompt.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && matchesTab && searchableText.includes(normalizedQuery);
    });

    return [...filtered].sort((a, b) => b.id - a.id);
  }, [category, feedTab, query]);

  return (
    <main className="site-shell dc-shell">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <img className="brand-logo" src="/logo.png" alt="" />
          </span>
          <span>
            <strong>프롬프트랩</strong>
            <small>AI 이미지 갤러리</small>
          </span>
        </Link>
        <nav className="topnav dc-topnav" aria-label="주요 메뉴">
          <a href="#gallery">이미지</a>
          <Link href="/boards">게시판</Link>
          <a href="#submit">등록</a>
          <AuthControls />
        </nav>
      </header>

      <section className="dc-headline">
        <div>
          <h1>잘 뽑힌 프롬프트 모음</h1>
          <p>이미지, 원문, 모델까지 한 번에 확인</p>
        </div>
        <label className="dc-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="프롬프트, 모델, 태그 검색"
            aria-label="이미지 프롬프트 검색"
          />
        </label>
      </section>

      <section className="stats-row dc-stats" aria-label="서비스 지표">
        <div>
          <Camera size={17} aria-hidden="true" />
          <strong>{prompts.length}</strong>
          <span>예시 이미지</span>
        </div>
        <div>
          <Layers size={17} aria-hidden="true" />
          <strong>{categories.length - 1}</strong>
          <span>카테고리</span>
        </div>
        <div>
          <FileText size={17} aria-hidden="true" />
          <strong>포함</strong>
          <span>원문과 모델 정보</span>
        </div>
      </section>

      <section id="gallery" className="dc-board-layout">
        <aside className="filter-panel dc-side">
          <div className="dc-side-title">카테고리</div>
          <div className="category-list dc-category-list" aria-label="카테고리 필터">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={item === category ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                <span>{item}</span>
                <small>
                  {item === "전체"
                    ? prompts.length
                    : prompts.filter((prompt) => prompt.category === item).length}
                </small>
              </button>
            ))}
          </div>
          <Link className="dc-write-link" href="/boards">
            글 게시판 보기
          </Link>
        </aside>

        <div className="gallery-column dc-gallery-column">
          <div className="gallery-toolbar dc-board-toolbar">
            <div>
              <p className="section-kicker">Prompt Gallery</p>
              <h2>{filteredPrompts.length}개의 이미지 글</h2>
            </div>
            <div className="sort-tabs board-tabs" aria-label="게시글 정렬">
              <button
                type="button"
                className={feedTab === "all" ? "active" : ""}
                onClick={() => setFeedTab("all")}
              >
                전체글
              </button>
              <button
                type="button"
                className={feedTab === "korean" ? "active" : ""}
                onClick={() => setFeedTab("korean")}
              >
                한국어 포함
              </button>
              <button
                type="button"
                className={feedTab === "english" ? "active" : ""}
                onClick={() => setFeedTab("english")}
              >
                영어 원문
              </button>
              <button
                type="button"
                className={feedTab === "mixed" ? "active" : ""}
                onClick={() => setFeedTab("mixed")}
              >
                한영 혼합
              </button>
            </div>
          </div>

          <div className="dc-list-head">
            <span>이미지</span>
            <span>제목</span>
            <span>모델</span>
            <span>반응</span>
          </div>

          <div className="gallery-grid dc-gallery-grid">
            {filteredPrompts.map((prompt) => (
              <Link key={prompt.id} className="image-card dc-image-card" href={`/prompts/${prompt.id}`}>
                <img src={prompt.image} alt={`${prompt.title} 결과 이미지`} />
                <div className="image-card-body">
                  <div className="card-meta">
                    <span>{prompt.category}</span>
                    <span>{prompt.aspectRatio}</span>
                  </div>
                  <h3>{prompt.title}</h3>
                  <p>{prompt.description}</p>
                  <div className="dc-card-info">
                    <span>{prompt.model}</span>
                    <span>{prompt.language}</span>
                    <span>{prompt.style}</span>
                  </div>
                  <div className="card-reactions">
                    <span>
                      <Heart size={14} aria-hidden="true" /> {promptCounts[prompt.id]?.likes ?? 0}
                    </span>
                    <span>
                      <Bookmark size={14} aria-hidden="true" /> {promptCounts[prompt.id]?.saves ?? 0}
                    </span>
                    <span>
                      <MessageCircle size={14} aria-hidden="true" /> {promptCounts[prompt.id]?.comments ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="submit" className="submit-section dc-submit">
        <div>
          <p className="section-kicker">Upload</p>
          <h2>이미지 결과와 프롬프트 원문을 같이 올리기</h2>
        </div>
        <form className="submit-form">
          <input placeholder="이미지 제목" aria-label="이미지 제목" />
          <input placeholder="사용 모델" aria-label="사용 모델" />
          <select aria-label="카테고리">
            {categories
              .filter((item) => item !== "전체")
              .map((item) => (
                <option key={item}>{item}</option>
              ))}
          </select>
          <input placeholder="비율 예: 16:9, 4:5, 1:1" aria-label="비율" />
          <textarea placeholder="한국어 프롬프트 원문 또는 설명" aria-label="한국어 프롬프트 원문" />
          <textarea placeholder="영어 프롬프트 원문" aria-label="영어 프롬프트 원문" />
          <textarea placeholder="네거티브 프롬프트 또는 추가 설정" aria-label="네거티브 프롬프트 또는 추가 설정" />
          <button type="button" className="primary-button">
            <Upload size={18} aria-hidden="true" />
            이미지와 프롬프트 등록
          </button>
        </form>
      </section>
    </main>
  );
}
