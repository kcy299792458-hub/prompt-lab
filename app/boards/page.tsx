"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  PencilLine,
  Search,
} from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { boardCategories, boardPosts, type BoardCategory } from "@/data/boards";

type ActiveCategory = "전체" | BoardCategory;

export default function BoardsPage() {
  const [category, setCategory] = useState<ActiveCategory>("전체");
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return boardPosts.filter((post) => {
      const matchesCategory = category === "전체" || post.category === category;
      const matchesQuery = [post.title, post.body, post.author, post.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const bestPosts = useMemo(
    () =>
      [...boardPosts]
        .sort((a, b) => b.views + b.likes * 8 + b.comments.length * 30 - (a.views + a.likes * 8 + a.comments.length * 30))
        .slice(0, 8),
    [],
  );

  return (
    <main className="site-shell dc-shell">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <ImageIcon size={18} aria-hidden="true" />
          </span>
          <span>
            <strong>프롬포트랩</strong>
            <small>글 게시판</small>
          </span>
        </Link>
        <nav className="topnav dc-topnav" aria-label="주요 메뉴">
          <Link href="/">이미지</Link>
          <Link href="/boards">게시판</Link>
          <AuthControls />
        </nav>
      </header>

      <section className="dc-headline dc-board-headline">
        <div>
          <h1>프롬프트 게시판</h1>
          <p>질문, 팁, 모델 비교, 실패 사례까지 글로 공유하는 공간.</p>
        </div>
        <label className="dc-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="질문, 모델, 네거티브 검색"
            aria-label="게시글 검색"
          />
        </label>
      </section>

      <section className="board-page dc-board-page">
        <div className="dc-board-page-layout">
          <aside className="filter-panel dc-side">
            <div className="dc-side-title">게시판</div>
            <div className="category-list dc-category-list" aria-label="게시판 분류">
              {boardCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === category ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  <span>{item}</span>
                  <small>
                    {item === "전체"
                      ? boardPosts.length
                      : boardPosts.filter((post) => post.category === item).length}
                  </small>
                </button>
              ))}
            </div>
            <Link className="dc-write-link" href="/">
              이미지 갤러리 보기
            </Link>
          </aside>

          <section className="dc-board-main">
            <div className="gallery-toolbar dc-board-toolbar">
              <div>
                <p className="section-kicker">Community</p>
                <h2>{filteredPosts.length}개의 글</h2>
              </div>
              <button type="button" className="primary-button dc-write-button">
                <PencilLine size={15} aria-hidden="true" />
                글쓰기
              </button>
            </div>

            <div className="dc-post-list-head">
              <span>분류</span>
              <span>제목</span>
              <span>작성자</span>
              <span>조회</span>
              <span>추천</span>
              <span>댓글</span>
            </div>

            <div className="dc-post-list">
              {filteredPosts.map((post) => (
                <Link key={post.id} className="board-row dc-post-row" href={`/boards/${post.id}`}>
                  <span className="board-label">{post.category}</span>
                  <div className="dc-post-title">
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </div>
                  <small>@{post.author}</small>
                  <span>{post.views}</span>
                  <span>{post.likes}</span>
                  <span>
                    <MessageCircle size={13} aria-hidden="true" /> {post.comments.length}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <aside className="dc-rank-box dc-board-best" aria-label="실시간 베스트">
            <div className="dc-rank-head">
              <strong>실시간 베스트</strong>
              <span>글</span>
            </div>
            <ol>
              {bestPosts.map((post, index) => (
                <li key={post.id}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={`/boards/${post.id}`}>{post.title}</Link>
                  <small>{post.views}</small>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
