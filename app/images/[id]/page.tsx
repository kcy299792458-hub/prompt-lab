"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Copy, Eye, UserRound } from "lucide-react";
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

type MetricCounts = {
  viewCount: number;
  copyCount: number;
};

type MetricPayload = {
  view_count?: number | null;
  copy_count?: number | null;
};

const visitorKeyStorageKey = "prompt-lab-visitor-key";

function getProfileNickname(profile: UploadedImagePostRow["profiles"]) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
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
  const [metrics, setMetrics] = useState<MetricCounts>({ viewCount: 0, copyCount: 0 });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

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

      if (!isMounted) return;

      if (postError) {
        setMessage(postError.message);
      }

      setPost(postData);
      setMetrics(getMetricCountsFromPost(postData));
      setVersions((versionResult.data ?? []) as PromptVersionRow[]);
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
          </>
        )}
      </section>
    </main>
  );
}
