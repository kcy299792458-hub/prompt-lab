"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { boardPosts } from "@/data/boards";

export default function BoardPostPage() {
  const params = useParams<{ id: string }>();
  const post = boardPosts.find((item) => item.id === Number(params.id));

  if (!post) {
    return (
      <main className="site-shell dc-shell">
        <section className="not-found-panel">
          <p className="section-kicker">404</p>
          <h1>게시글을 찾을 수 없습니다.</h1>
          <Link href="/boards" className="primary-button">
            게시판으로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  const bestPosts = [...boardPosts]
    .sort((a, b) => b.views + b.likes * 8 + b.comments.length * 30 - (a.views + a.likes * 8 + a.comments.length * 30))
    .slice(0, 8);

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

      <section className="board-detail-page dc-board-detail-page">
        <Link href="/boards" className="back-link dc-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          게시판으로
        </Link>

        <div className="dc-board-detail-layout">
          <article className="board-detail-article dc-board-article">
            <div className="dc-article-head">
              <span className="board-label">{post.category}</span>
              <h1>{post.title}</h1>
            </div>
            <div className="board-post-meta dc-article-meta">
              <span>
                <UserRound size={14} aria-hidden="true" /> @{post.author}
              </span>
              <span>{post.createdAt}</span>
              <span>
                <Eye size={14} aria-hidden="true" /> {post.views}
              </span>
              <span>
                <Heart size={14} aria-hidden="true" /> {post.likes}
              </span>
              <span>
                <MessageCircle size={14} aria-hidden="true" /> {post.comments.length}
              </span>
            </div>
            <p>{post.body}</p>
          </article>

          <aside className="dc-rank-box dc-board-best" aria-label="실시간 베스트">
            <div className="dc-rank-head">
              <strong>실시간 베스트</strong>
              <span>글</span>
            </div>
            <ol>
              {bestPosts.map((item, index) => (
                <li key={item.id}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={`/boards/${item.id}`}>{item.title}</Link>
                  <small>{item.views}</small>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <section className="prompt-detail-section dc-comment-section">
          <div className="section-heading">
            <h2>댓글</h2>
            <span>{post.comments.length}개</span>
          </div>
          <div className="comment-list full">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <article key={`${comment.author}-${comment.time}`}>
                  <div>
                    <strong>@{comment.author}</strong>
                    <span>{comment.time}</span>
                  </div>
                  <p>{comment.body}</p>
                </article>
              ))
            ) : (
              <p>아직 댓글이 없습니다. 첫 의견을 남겨보세요.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
