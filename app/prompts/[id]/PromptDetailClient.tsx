"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Heart,
  MessageCircle,
} from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { getPromptVersions } from "@/data/community";
import { prompts } from "@/data/prompts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPromptLabVisitorKey } from "@/lib/visitor-key";

type PromptCommentRow = {
  id: string;
  prompt_id: number;
  guest_nickname: string;
  body: string;
  created_at: string;
  is_hidden: boolean;
};

type PromptCounts = {
  likes: number;
  saves: number;
  comments: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visitorKey, setVisitorKey] = useState("");
  const [counts, setCounts] = useState<PromptCounts>({ likes: 0, saves: 0, comments: 0 });
  const [activeReactions, setActiveReactions] = useState({ like: false, save: false });
  const [comments, setComments] = useState<PromptCommentRow[]>([]);
  const [commentForm, setCommentForm] = useState({
    guestNickname: "",
    password: "",
    body: "",
  });
  const [reactionMessage, setReactionMessage] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const prompt = useMemo(
    () => prompts.find((item) => item.id === Number(params.id)),
    [params.id],
  );

  const promptVersions = prompt ? getPromptVersions(prompt) : [];

  const loadInteractions = async (currentVisitorKey = visitorKey) => {
    if (!supabase || !prompt) return;

    const [reactionResult, commentResult] = await Promise.all([
      supabase
        .from("prompt_reactions")
        .select("kind, visitor_key")
        .eq("prompt_id", prompt.id),
      supabase
        .from("prompt_comments")
        .select("id, prompt_id, guest_nickname, body, created_at, is_hidden")
        .eq("prompt_id", prompt.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true }),
    ]);

    if (!reactionResult.error) {
      const nextCounts = { likes: 0, saves: 0, comments: 0 };
      const nextActive = { like: false, save: false };

      reactionResult.data?.forEach((reaction) => {
        if (reaction.kind === "like") nextCounts.likes += 1;
        if (reaction.kind === "save") nextCounts.saves += 1;

        if (reaction.visitor_key === currentVisitorKey && reaction.kind === "like") {
          nextActive.like = true;
        }

        if (reaction.visitor_key === currentVisitorKey && reaction.kind === "save") {
          nextActive.save = true;
        }
      });

      setCounts((previous) => ({ ...previous, ...nextCounts }));
      setActiveReactions(nextActive);
    }

    if (!commentResult.error) {
      setComments((commentResult.data ?? []) as PromptCommentRow[]);
      setCounts((previous) => ({
        ...previous,
        comments: commentResult.data?.length ?? 0,
      }));
    }
  };

  useEffect(() => {
    setVisitorKey(getPromptLabVisitorKey());
  }, []);

  useEffect(() => {
    if (!visitorKey) return;
    loadInteractions(visitorKey);
  }, [visitorKey, prompt?.id]);

  const copyPrompt = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  };

  const toggleReaction = async (kind: "like" | "save") => {
    if (!supabase || !prompt || !visitorKey) {
      setReactionMessage("잠시 후 다시 시도하세요.");
      return;
    }

    setReactionMessage("");

    const { data, error } = await supabase.rpc("toggle_prompt_reaction", {
      p_prompt_id: prompt.id,
      p_visitor_key: visitorKey,
      p_kind: kind,
    });

    if (error) {
      setReactionMessage("반응 기능을 사용할 수 없습니다. 잠시 후 다시 시도하세요.");
      return;
    }

    await loadInteractions(visitorKey);

    if (kind === "save") {
      setReactionMessage(data ? "저장함에 추가했습니다." : "저장함에서 제거했습니다.");
    }
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !prompt) {
      setCommentMessage("댓글 기능을 사용하려면 Supabase 설정이 필요합니다.");
      return;
    }

    if (!commentForm.body.trim()) {
      setCommentMessage("댓글 내용을 입력하세요.");
      return;
    }

    if (commentForm.guestNickname.trim().length < 2) {
      setCommentMessage("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    if (commentForm.password.length < 4) {
      setCommentMessage("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    const { error } = await supabase.rpc("create_guest_prompt_comment", {
      p_prompt_id: prompt.id,
      p_body: commentForm.body.trim(),
      p_guest_nickname: commentForm.guestNickname.trim(),
      p_password: commentForm.password,
    });

    if (error) {
      setCommentMessage(error.message || "댓글을 등록할 수 없습니다.");
      return;
    }

    setCommentForm({ guestNickname: "", password: "", body: "" });
    setCommentMessage("");
    await loadInteractions(visitorKey);
  };

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
          <Link href="/saved">저장함</Link>
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
                <button
                  className={`icon-action wide${activeReactions.like ? " active" : ""}`}
                  type="button"
                  onClick={() => toggleReaction("like")}
                  aria-pressed={activeReactions.like}
                >
                  <Heart size={18} aria-hidden="true" />
                  좋아요 {counts.likes}
                </button>
                <button
                  className={`icon-action wide${activeReactions.save ? " active" : ""}`}
                  type="button"
                  onClick={() => toggleReaction("save")}
                  aria-pressed={activeReactions.save}
                >
                  <Bookmark size={18} aria-hidden="true" />
                  저장 {counts.saves}
                </button>
                <button className="icon-action wide" type="button">
                  <MessageCircle size={18} aria-hidden="true" />
                  댓글 {counts.comments}
                </button>
              </div>
              {reactionMessage && <p className="dc-inline-message">{reactionMessage}</p>}
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

          <section className="prompt-detail-section dc-comment-section">
            <div className="section-heading">
              <h2>댓글</h2>
              <span>{comments.length}개</span>
            </div>

            <form className="dc-comment-form" onSubmit={submitComment}>
              <div className="dc-write-grid">
                <input
                  value={commentForm.guestNickname}
                  onChange={(event) =>
                    setCommentForm({ ...commentForm, guestNickname: event.target.value })
                  }
                  placeholder="닉네임"
                  aria-label="닉네임"
                />
                <input
                  value={commentForm.password}
                  onChange={(event) =>
                    setCommentForm({ ...commentForm, password: event.target.value })
                  }
                  placeholder="삭제 비밀번호"
                  type="password"
                  aria-label="삭제 비밀번호"
                />
              </div>
              <textarea
                value={commentForm.body}
                onChange={(event) => setCommentForm({ ...commentForm, body: event.target.value })}
                placeholder="댓글을 입력하세요"
                aria-label="댓글"
              />
              <button className="primary-button dc-write-submit" type="submit">
                댓글 등록
              </button>
            </form>

            {commentMessage && <p className="dc-status-message">{commentMessage}</p>}

            <div className="comment-list full">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <article key={comment.id}>
                    <div>
                      <strong>@{comment.guest_nickname}</strong>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    <p>{comment.body}</p>
                  </article>
                ))
              ) : (
                <p>아직 댓글이 없습니다.</p>
              )}
            </div>
          </section>

        </div>

        <aside className="detail-side">
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
