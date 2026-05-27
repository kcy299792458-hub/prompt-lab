"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Camera,
  Clock,
  Eye,
  Flame,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Search,
  Upload,
} from "lucide-react";
import { getCommentCount } from "@/data/community";
import { categories, prompts } from "@/data/prompts";
import { AuthControls } from "@/app/components/AuthControls";

type FeedTab = "all" | "popular" | "today" | "notice";

function getPromptAge(id: number) {
  if (id >= 25) return "방금";
  if (id >= 19) return "오늘";
  return `${id}일 전`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [feedTab, setFeedTab] = useState<FeedTab>("all");

  const todayPrompts = useMemo(() => prompts.filter((prompt) => prompt.id >= 19), []);

  const savedPromptCount = useMemo(
    () => prompts.reduce((total, prompt) => total + prompt.saves, 0),
    [],
  );

  const realTimeRank = useMemo(
    () =>
      [...prompts]
        .sort((a, b) => b.likes + b.saves + getCommentCount(b) * 45 - (a.likes + a.saves + getCommentCount(a) * 45))
        .slice(0, 8),
    [],
  );

  const saveRank = useMemo(
    () => [...prompts].sort((a, b) => b.saves - a.saves).slice(0, 8),
    [],
  );

  const commentRank = useMemo(
    () => [...prompts].sort((a, b) => getCommentCount(b) - getCommentCount(a)).slice(0, 8),
    [],
  );

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = prompts.filter((prompt) => {
      const matchesCategory = category === "전체" || prompt.category === category;
      const matchesTab =
        feedTab === "all" ||
        (feedTab === "popular" && prompt.likes + prompt.saves >= 520) ||
        (feedTab === "today" && prompt.id >= 19) ||
        (feedTab === "notice" && prompt.id <= 2);
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

    return [...filtered].sort((a, b) => {
      if (feedTab === "all" || feedTab === "today") return b.id - a.id;
      if (feedTab === "notice") return a.id - b.id;
      return b.likes + b.saves - (a.likes + a.saves);
    });
  }, [category, feedTab, query]);

  const rankColumns = [
    { title: "실시간 인기", items: realTimeRank, metric: (prompt: (typeof prompts)[number]) => `${prompt.likes + prompt.saves}` },
    { title: "최다 저장", items: saveRank, metric: (prompt: (typeof prompts)[number]) => `${prompt.saves}` },
    { title: "댓글 많은 글", items: commentRank, metric: (prompt: (typeof prompts)[number]) => `${getCommentCount(prompt)}` },
  ];

  return (
    <main className="site-shell dc-shell">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <ImageIcon size={18} aria-hidden="true" />
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
          <h1>결과로 검증된 이미지 프롬포트 모음</h1>
          <p>이미지 결과, 원문 프롬프트, 모델 정보, 댓글 반응을 한 번에 확인하는 커뮤니티형 아카이브.</p>
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
          <span>전체 이미지</span>
        </div>
        <div>
          <Clock size={17} aria-hidden="true" />
          <strong>{todayPrompts.length}</strong>
          <span>오늘 올라온 이미지</span>
        </div>
        <div>
          <Bookmark size={17} aria-hidden="true" />
          <strong>{savedPromptCount.toLocaleString()}</strong>
          <span>저장된 프롬포트</span>
        </div>
      </section>

      <section className="dc-rank-grid" aria-label="인기 게시글">
        {rankColumns.map((column) => (
          <article key={column.title} className="dc-rank-box">
            <div className="dc-rank-head">
              <strong>{column.title}</strong>
              <span>TOP 8</span>
            </div>
            <ol>
              {column.items.map((prompt, index) => (
                <li key={prompt.id}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={`/prompts/${prompt.id}`}>{prompt.title}</Link>
                  <small>{column.metric(prompt)}</small>
                </li>
              ))}
            </ol>
          </article>
        ))}
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
                className={feedTab === "popular" ? "active" : ""}
                onClick={() => setFeedTab("popular")}
              >
                인기글
              </button>
              <button
                type="button"
                className={feedTab === "today" ? "active" : ""}
                onClick={() => setFeedTab("today")}
              >
                오늘 업로드
              </button>
              <button
                type="button"
                className={feedTab === "notice" ? "active" : ""}
                onClick={() => setFeedTab("notice")}
              >
                공지
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
                    <span>@{prompt.author}</span>
                    <span>{prompt.model}</span>
                    <span>{getPromptAge(prompt.id)}</span>
                  </div>
                  <div className="card-reactions">
                    <span>
                      <Heart size={14} aria-hidden="true" /> {prompt.likes}
                    </span>
                    <span>
                      <Bookmark size={14} aria-hidden="true" /> {prompt.saves}
                    </span>
                    <span>
                      <MessageCircle size={14} aria-hidden="true" /> {getCommentCount(prompt)}
                    </span>
                    <span>
                      <Eye size={14} aria-hidden="true" /> {prompt.likes + prompt.saves}
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
