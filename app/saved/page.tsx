"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, MessageCircle } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { prompts, type Prompt } from "@/data/prompts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPromptPath } from "@/lib/seo";
import { getPromptLabVisitorKey } from "@/lib/visitor-key";

type SavedReactionRow = {
  prompt_id: number;
  created_at: string;
};

export default function SavedPromptsPage() {
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedPrompts() {
      if (!supabase) {
        setMessage("Supabase 환경변수가 필요합니다.");
        setIsLoading(false);
        return;
      }

      const visitorKey = getPromptLabVisitorKey();

      const { data, error } = await supabase
        .from("prompt_reactions")
        .select("prompt_id, created_at")
        .eq("visitor_key", visitorKey)
        .eq("kind", "save")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setMessage("저장한 프롬프트를 불러올 수 없습니다.");
        setSavedPrompts([]);
        setIsLoading(false);
        return;
      }

      const savedRows = (data ?? []) as SavedReactionRow[];
      const savedIds = savedRows.map((row) => Number(row.prompt_id));
      setSavedPrompts(
        savedIds
          .map((id) => prompts.find((prompt) => prompt.id === id))
          .filter((prompt): prompt is Prompt => Boolean(prompt)),
      );
      setIsLoading(false);
    }

    loadSavedPrompts();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return (
    <main className="site-shell dc-shell">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <img className="brand-logo" src="/logo.png" alt="" />
          </span>
          <span>
            <strong>프롬프트랩</strong>
            <small>저장함</small>
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

      <section className="dc-headline">
        <div>
          <h1>저장한 프롬프트</h1>
          <p>이 브라우저에서 저장한 이미지 프롬프트</p>
        </div>
        <Link href="/" className="primary-button dc-write-button">
          <ArrowLeft size={15} aria-hidden="true" />
          갤러리로
        </Link>
      </section>

      <section className="saved-page">
        {isLoading && <p className="dc-empty-message">불러오는 중입니다.</p>}
        {!isLoading && message && <p className="dc-empty-message">{message}</p>}
        {!isLoading && !message && savedPrompts.length === 0 && (
          <p className="dc-empty-message">아직 저장한 프롬프트가 없습니다.</p>
        )}

        {savedPrompts.length > 0 && (
          <div className="gallery-grid dc-gallery-grid">
            {savedPrompts.map((prompt) => (
              <Link key={prompt.id} className="image-card dc-image-card" href={getPromptPath(prompt)}>
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
                      <Bookmark size={14} aria-hidden="true" /> 저장됨
                    </span>
                    <span>
                      <MessageCircle size={14} aria-hidden="true" /> 댓글 보기
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
