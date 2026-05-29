"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Copy, Eye, MessageCircle, Trash2, UserRound } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { ReportButton } from "@/app/components/ReportButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type UploadedImagePostRow = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: string;
  model: string;
  aspect_ratio: string;
  style: string;
  image_url: string;
  image_urls?: string[] | null;
  tags: string[] | null;
  view_count?: number | null;
  copy_count?: number | null;
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

type PromptVersionRow = {
  id: string;
  label: string;
  language: "ko" | "en" | "mixed" | "negative" | "settings";
  body: string;
};

type CommentRow = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  body: string;
  created_at: string;
  profiles?: ProfileRelation;
};

type MetricCounts = {
  viewCount: number;
  copyCount: number;
};

type MetricPayload = {
  view_count?: number | null;
  copy_count?: number | null;
};

type ProfileRelation = { nickname: string } | { nickname: string }[] | null;

type SessionUser = {
  id: string;
};

const visitorKeyStorageKey = "prompt-lab-visitor-key";

function getProfileNickname(profile: ProfileRelation | undefined) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

function getAuthorName(item: { guest_nickname: string | null; profiles?: ProfileRelation }) {
  return item.guest_nickname || getProfileNickname(item.profiles);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getVisitorKey() {
  if (typeof window === "undefined") return "server-render";

  const currentKey = window.localStorage.getItem(visitorKeyStorageKey);
  if (currentKey && currentKey.length >= 8 && currentKey.length <= 80) return currentKey;

  const nextKey =
    typeof window.crypto?.randomUUID === "function"
      ? `pl-${window.crypto.randomUUID()}`
      : `pl-${Date.now()}-${Math.random().toString(36).slice(2, 18)}`;

  window.localStorage.setItem(visitorKeyStorageKey, nextKey);
  return nextKey;
}

function getMetricCountsFromPost(post: UploadedImagePostRow | null): MetricCounts {
  return {
    viewCount: post?.view_count ?? 0,
    copyCount: post?.copy_count ?? 0,
  };
}

function getMetricCountsFromPayload(payload: unknown): MetricCounts | null {
  if (!payload || typeof payload !== "object") return null;

  const metricPayload = payload as MetricPayload;
  return {
    viewCount: Number(metricPayload.view_count ?? 0),
    copyCount: Number(metricPayload.copy_count ?? 0),
  };
}

export default function UploadedImageDetailPage() {
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [post, setPost] = useState<UploadedImagePostRow | null>(null);
  const [versions, setVersions] = useState<PromptVersionRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [metrics, setMetrics] = useState<MetricCounts>({ viewCount: 0, copyCount: 0 });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [commentPasswords, setCommentPasswords] = useState<Record<string, string>>({});
  const [commentForm, setCommentForm] = useState({
    body: "",
    guestNickname: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [commentMessage, setCommentMessage] = useState("");

  const loadComments = async () => {
    if (!supabase) return;

    const commentResult = await supabase
      .from("comments")
      .select("id, author_id, guest_nickname, body, created_at, profiles(nickname)")
      .eq("image_post_id", params.id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });

    if (!commentResult.error) {
      setComments((commentResult.data ?? []) as CommentRow[]);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      setMessage("Supabase 환경변수가 필요합니다.");
      return;
    }

    let isMounted = true;
    const client = supabase;

    async function loadPost() {
      setIsLoading(true);

      const initialPostResult = await client
        .from("image_posts")
        .select(
          "id, author_id, title, description, category, model, aspect_ratio, style, image_url, image_urls, tags, view_count, copy_count, created_at, profiles(nickname)",
        )
        .eq("id", params.id)
        .eq("is_hidden", false)
        .maybeSingle();

      let postData = initialPostResult.data as UploadedImagePostRow | null;
      let postError = initialPostResult.error;

      if (
        postError?.message.includes("image_urls") ||
        postError?.message.includes("view_count") ||
        postError?.message.includes("copy_count")
      ) {
        const retryResult = await client
          .from("image_posts")
          .select(
            "id, author_id, title, description, category, model, aspect_ratio, style, image_url, tags, created_at, profiles(nickname)",
          )
          .eq("id", params.id)
          .eq("is_hidden", false)
          .maybeSingle();

        postData = retryResult.data as UploadedImagePostRow | null;
        postError = retryResult.error;
      }

      const versionResult = await client
        .from("prompt_versions")
        .select("id, label, language, body")
        .eq("image_post_id", params.id)
        .order("created_at", { ascending: true });

      const commentResult = await client
        .from("comments")
        .select("id, author_id, guest_nickname, body, created_at, profiles(nickname)")
        .eq("image_post_id", params.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (postError) {
        setMessage(postError.message);
      }

      setPost(postData);
      setMetrics(getMetricCountsFromPost(postData));
      setVersions((versionResult.data ?? []) as PromptVersionRow[]);
      setComments((commentResult.data ?? []) as CommentRow[]);
      setIsLoading(false);

      if (postData) {
        const metricResult = await client.rpc("record_image_post_metric", {
          p_image_post_id: postData.id,
          p_event_type: "view",
          p_visitor_key: getVisitorKey(),
        });

        if (!isMounted || metricResult.error) return;

        const nextMetrics = getMetricCountsFromPayload(metricResult.data);
        if (nextMetrics) setMetrics(nextMetrics);
      }
    }

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [params.id, supabase]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSessionUser((data.session?.user as SessionUser | undefined) ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser((session?.user as SessionUser | undefined) ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const copyPrompt = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);

    if (!supabase || !post) return;

    const metricResult = await supabase.rpc("record_image_post_metric", {
      p_image_post_id: post.id,
      p_event_type: "copy",
      p_visitor_key: getVisitorKey(),
    });

    if (metricResult.error) return;

    const nextMetrics = getMetricCountsFromPayload(metricResult.data);
    if (nextMetrics) setMetrics(nextMetrics);
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !post) {
      setCommentMessage("댓글을 등록할 수 없습니다.");
      return;
    }

    if (!commentForm.body.trim()) {
      setCommentMessage("댓글 내용을 입력하세요.");
      return;
    }

    if (!sessionUser && commentForm.guestNickname.trim().length < 2) {
      setCommentMessage("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    if (!sessionUser && commentForm.password.length < 4) {
      setCommentMessage("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    setCommentMessage("");

    if (sessionUser) {
      const { error } = await supabase.from("comments").insert({
        author_id: sessionUser.id,
        image_post_id: post.id,
        body: commentForm.body.trim(),
      });

      if (error) {
        setCommentMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.rpc("create_guest_image_comment", {
        p_image_post_id: post.id,
        p_body: commentForm.body.trim(),
        p_guest_nickname: commentForm.guestNickname.trim(),
        p_password: commentForm.password,
        p_visitor_key: getVisitorKey(),
      });

      if (error) {
        setCommentMessage(
          error.message.includes("create_guest_image_comment")
            ? "이미지 댓글 기능을 사용하려면 021 SQL 실행이 필요합니다."
            : error.message,
        );
        return;
      }
    }

    setCommentForm({ body: "", guestNickname: "", password: "" });
    await loadComments();
  };

  const deleteComment = async (comment: CommentRow) => {
    if (!supabase) return;

    if (sessionUser && comment.author_id === sessionUser.id) {
      const { error } = await supabase
        .from("comments")
        .update({ is_hidden: true, updated_at: new Date().toISOString() })
        .eq("id", comment.id)
        .eq("author_id", sessionUser.id);

      if (error) {
        setCommentMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.rpc("delete_guest_image_comment", {
        p_comment_id: comment.id,
        p_password: commentPasswords[comment.id] ?? "",
      });

      if (error) {
        setCommentMessage(
          error.message.includes("delete_guest_image_comment")
            ? "이미지 댓글 삭제 기능을 사용하려면 021 SQL 실행이 필요합니다."
            : error.message,
        );
        return;
      }
    }

    setCommentMessage("댓글이 삭제됐습니다.");
    setCommentPasswords({ ...commentPasswords, [comment.id]: "" });
    await loadComments();
  };

  const images = post?.image_urls && post.image_urls.length > 0 ? post.image_urls : post ? [post.image_url] : [];
  const authorName = post ? getProfileNickname(post.profiles) : "회원";
  const primaryPrompt = versions[0] ?? null;

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
          <Link href="/">이미지</Link>
          <Link href="/boards">게시판</Link>
          <Link href="/saved">저장함</Link>
          <Link href="/upload">업로드</Link>
          <AuthControls />
        </nav>
      </header>

      <section className="prompt-detail-page">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} aria-hidden="true" />
          목록으로
        </Link>

        {isLoading && <p className="dc-empty-message">불러오는 중입니다.</p>}
        {!isLoading && message && <p className="dc-empty-message">{message}</p>}
        {!isLoading && !post && !message && (
          <p className="dc-empty-message">이미지 게시글을 찾을 수 없습니다.</p>
        )}

        {post && (
          <>
            <div className="detail-main">
              <article className="detail-article uploaded-post-article">
                <div className="detail-article-body uploaded-post-head">
                  <div className="uploaded-post-meta">
                    <span>
                      <UserRound size={14} aria-hidden="true" /> 작성자{" "}
                      <Link className="creator-inline-link" href={`/creators/${post.author_id}`}>
                        @{authorName}
                      </Link>
                    </span>
                    <span>사진 {images.length}장</span>
                    <span>
                      <Eye size={14} aria-hidden="true" /> 조회 {metrics.viewCount}
                    </span>
                    <span>
                      <Copy size={14} aria-hidden="true" /> 복사 {metrics.copyCount}
                    </span>
                    <span>
                      <MessageCircle size={14} aria-hidden="true" /> 댓글 {comments.length}
                    </span>
                    <span>{post.model}</span>
                    <span>{post.aspect_ratio}</span>
                    <span>{post.category}</span>
                    <ReportButton
                      targetType="image_post"
                      targetId={post.id}
                      targetTitle={post.title}
                      targetPath={`/images/${post.id}`}
                      compact
                    />
                  </div>
                  <h1>{post.title}</h1>
                </div>
                <div className="image-viewer uploaded-image-viewer">
                  {images.map((imageUrl, index) => (
                    <img
                      key={imageUrl}
                      className="detail-hero-image"
                      src={imageUrl}
                      alt={`${post.title} 이미지 ${index + 1}`}
                    />
                  ))}
                </div>
              </article>

              <section className="prompt-detail-section">
                <div className="section-heading">
                  <h2>실제 프롬프트</h2>
                  <span>GPT Image 2.0</span>
                </div>
                <div className="prompt-versions">
                  {primaryPrompt ? (
                    <section className="prompt-version" key={primaryPrompt.id}>
                      <div className="prompt-version-header">
                        <div>
                          <strong>실제 사용한 프롬프트</strong>
                          <span>원문 1개</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyPrompt(primaryPrompt.body, primaryPrompt.id)}
                        >
                          {copiedKey === primaryPrompt.id ? (
                            <Check size={16} aria-hidden="true" />
                          ) : (
                            <Copy size={16} aria-hidden="true" />
                          )}
                          {copiedKey === primaryPrompt.id ? "복사됨" : "복사"}
                        </button>
                      </div>
                      <div className="prompt-body">{primaryPrompt.body}</div>
                    </section>
                  ) : (
                    <p className="dc-empty-message">등록된 프롬프트 원문이 없습니다.</p>
                  )}
                </div>
              </section>

              <section className="prompt-detail-section uploaded-description-section">
                <div className="section-heading">
                  <h2>설명글</h2>
                  <span>작성자 메모</span>
                </div>
                <p>{post.description || "설명이 없습니다."}</p>
              </section>
            </div>

            <aside className="detail-side">
              <div className="spec-grid">
                <span>작성자</span>
                <strong>
                  <Link className="creator-inline-link" href={`/creators/${post.author_id}`}>
                    @{authorName}
                  </Link>
                </strong>
                <span>모델</span>
                <strong>{post.model}</strong>
                <span>이미지</span>
                <strong>{images.length}장</strong>
                <span>조회</span>
                <strong>{metrics.viewCount}</strong>
                <span>복사</span>
                <strong>{metrics.copyCount}</strong>
                <span>댓글</span>
                <strong>{comments.length}</strong>
                <span>비율</span>
                <strong>{post.aspect_ratio}</strong>
                <span>스타일</span>
                <strong>{post.style}</strong>
              </div>
              <div className="tag-row">
                {(post.tags ?? []).map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </aside>

            <section className="prompt-detail-section dc-comment-section image-comment-section">
              <div className="section-heading">
                <h2>댓글</h2>
                <span>{comments.length}개</span>
              </div>

              <form className="dc-comment-form" onSubmit={submitComment}>
                {!sessionUser && (
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
                      placeholder="수정/삭제 비밀번호"
                      type="password"
                      aria-label="수정/삭제 비밀번호"
                    />
                  </div>
                )}
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
                        <strong>@{getAuthorName(comment)}</strong>
                        <span>{formatDate(comment.created_at)}</span>
                        <ReportButton
                          targetType="comment"
                          targetId={comment.id}
                          targetTitle={`이미지 댓글 - ${post.title}`}
                          targetPath={`/images/${post.id}`}
                          compact
                        />
                      </div>
                      <p>{comment.body}</p>
                      {(!comment.author_id || comment.author_id === sessionUser?.id) && (
                        <div className="dc-comment-tools">
                          {!comment.author_id && (
                            <input
                              value={commentPasswords[comment.id] ?? ""}
                              onChange={(event) =>
                                setCommentPasswords({
                                  ...commentPasswords,
                                  [comment.id]: event.target.value,
                                })
                              }
                              placeholder="삭제 비밀번호"
                              type="password"
                              aria-label="댓글 삭제 비밀번호"
                            />
                          )}
                          <button type="button" onClick={() => deleteComment(comment)}>
                            <Trash2 size={13} aria-hidden="true" />
                            삭제
                          </button>
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <p>아직 댓글이 없습니다. 첫 반응을 남겨보세요.</p>
                )}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
