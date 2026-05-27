"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Heart,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { getComments, getPromptVersions } from "@/data/community";
import { prompts } from "@/data/prompts";

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const prompt = useMemo(
    () => prompts.find((item) => item.id === Number(params.id)),
    [params.id],
  );

  if (!prompt) {
    return (
      <main className="site-shell">
        <section className="not-found-panel">
          <p className="section-kicker">404</p>
          <h1>게시물을 찾을 수 없습니다.</h1>
          <Link href="/" className="primary-button">
            홈으로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  const promptVersions = getPromptVersions(prompt);
  const comments = getComments(prompt);

  const copyPrompt = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  };

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
          <Link href="/">갤러리</Link>
          <Link href="/boards">게시판</Link>
          <AuthControls />
        </nav>
      </header>

      <section className="prompt-detail-page">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} aria-hidden="true" />
          목록으로
        </Link>

        <div className="detail-main">
          <article className="detail-article">
            <div className="image-viewer">
              <img
                className="detail-hero-image"
                src={prompt.image}
                alt={`${prompt.title} 결과 이미지`}
              />
            </div>
            <div className="detail-article-body">
              <div className="card-meta">
                <span>{prompt.category}</span>
                <span>{prompt.model}</span>
                <span>{prompt.aspectRatio}</span>
              </div>
              <h1>{prompt.title}</h1>
              <p>{prompt.description}</p>
              <div className="detail-actions">
                <button className="icon-action wide" type="button">
                  <Heart size={18} aria-hidden="true" />
                  좋아요 {prompt.likes}
                </button>
                <button className="icon-action wide" type="button">
                  <Bookmark size={18} aria-hidden="true" />
                  저장 {prompt.saves}
                </button>
                <button className="icon-action wide" type="button">
                  <MessageCircle size={18} aria-hidden="true" />
                  댓글 {comments.length}
                </button>
              </div>
            </div>
          </article>

          <section className="prompt-detail-section">
            <div className="section-heading">
              <h2>프롬프트 원문</h2>
              <span>{promptVersions.length}개 버전</span>
            </div>
            <div className="prompt-versions">
              {promptVersions.map((version, index) => {
                const copyKey = `${prompt.id}-${index}`;

                return (
                  <section className="prompt-version" key={copyKey}>
                    <div className="prompt-version-header">
                      <div>
                        <strong>{version.label}</strong>
                        <span>{version.language}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyPrompt(version.body, copyKey)}
                      >
                        {copiedKey === copyKey ? (
                          <Check size={16} aria-hidden="true" />
                        ) : (
                          <Copy size={16} aria-hidden="true" />
                        )}
                        {copiedKey === copyKey ? "복사됨" : "복사"}
                      </button>
                    </div>
                    <div className="prompt-body">{version.body}</div>
                  </section>
                );
              })}
            </div>
          </section>

          <section className="prompt-detail-section">
            <div className="section-heading">
              <h2>댓글</h2>
              <span>{comments.length}개</span>
            </div>
            <div className="comment-list full">
              {comments.length > 0 ? (
                comments.map((comment) => (
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
        </div>

        <aside className="detail-side">
          <div className="uploader-card">
            <div>
              <UserRound size={18} aria-hidden="true" />
              <strong>@{prompt.author}</strong>
            </div>
            <span>{prompt.likes + prompt.saves} 반응</span>
          </div>
          <div className="spec-grid">
            <span>모델</span>
            <strong>{prompt.model}</strong>
            <span>비율</span>
            <strong>{prompt.aspectRatio}</strong>
            <span>스타일</span>
            <strong>{prompt.style}</strong>
            <span>원문</span>
            <strong>{promptVersions.length}개</strong>
          </div>
          <div className="tag-row">
            {prompt.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
