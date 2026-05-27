"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Search,
  Upload,
} from "lucide-react";
import { categories, prompts, type Prompt } from "@/data/prompts";
import { AuthControls } from "@/app/components/AuthControls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type FeedTab = "all" | "korean" | "english" | "mixed";
type PromptCounts = Record<number, { likes: number; saves: number; comments: number }>;
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
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};
type PromptCommentActivityRow = {
  id: string;
  prompt_id: number;
  guest_nickname: string;
  body: string;
  created_at: string;
};
type RequestPostRow = {
  id: string;
  title: string;
  guest_nickname: string | null;
  status: "open" | "resolved";
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

type GalleryItem = {
  kind: "seed" | "uploaded";
  id: string;
  numericId?: number;
  title: string;
  description: string;
  category: string;
  model: string;
  aspectRatio: string;
  style: string;
  language: string;
  image: string;
  href: string;
  tags: string[];
  authorName: string;
  sortKey: number;
};

function getProfileNickname(profile: UploadedImagePostRow["profiles"]) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

function promptToGalleryItem(prompt: Prompt): GalleryItem {
  return {
    kind: "seed",
    id: String(prompt.id),
    numericId: prompt.id,
    title: prompt.title,
    description: prompt.description,
    category: prompt.category,
    model: prompt.model,
    aspectRatio: prompt.aspectRatio,
    style: prompt.style,
    language: prompt.language,
    image: prompt.image,
    href: `/prompts/${prompt.id}`,
    tags: prompt.tags,
    authorName: prompt.authorName || "운영자",
    sortKey: prompt.id,
  };
}

function uploadedToGalleryItem(post: UploadedImagePostRow): GalleryItem {
  const images = post.image_urls && post.image_urls.length > 0 ? post.image_urls : [post.image_url];

  return {
    kind: "uploaded",
    id: post.id,
    title: post.title,
    description: post.description,
    category: post.category,
    model: post.model || "모델 미기재",
    aspectRatio: post.aspect_ratio || "비율 미기재",
    style: post.style || "스타일 미기재",
    language: "사용자 업로드",
    image: images[0],
    href: `/images/${post.id}`,
    tags: post.tags ?? [],
    authorName: getProfileNickname(post.profiles),
    sortKey: new Date(post.created_at).getTime(),
  };
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [feedTab, setFeedTab] = useState<FeedTab>("all");
  const [promptCounts, setPromptCounts] = useState<PromptCounts>({});
  const [uploadedPosts, setUploadedPosts] = useState<UploadedImagePostRow[]>([]);
  const [recentPromptComments, setRecentPromptComments] = useState<PromptCommentActivityRow[]>([]);
  const [requestPosts, setRequestPosts] = useState<RequestPostRow[]>([]);
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

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const client = supabase;

    async function loadCommunityPanels() {
      const [commentResult, requestResult] = await Promise.all([
        client
          .from("prompt_comments")
          .select("id, prompt_id, guest_nickname, body, created_at")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(5),
        client
          .from("prompt_requests")
          .select("id, title, guest_nickname, status, created_at, profiles(nickname)")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (!isMounted) return;

      setRecentPromptComments(
        commentResult.error ? [] : ((commentResult.data ?? []) as PromptCommentActivityRow[]),
      );
      setRequestPosts(requestResult.error ? [] : ((requestResult.data ?? []) as RequestPostRow[]));
    }

    loadCommunityPanels();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const client = supabase;

    async function loadUploadedPosts() {
      const result = await client
        .from("image_posts")
        .select(
          "id, author_id, title, description, category, model, aspect_ratio, style, image_url, image_urls, tags, created_at, profiles(nickname)",
        )
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(60);

      let rows = result.data as UploadedImagePostRow[] | null;
      let error = result.error;

      if (error?.message.includes("image_urls")) {
        const retryResult = await client
          .from("image_posts")
          .select(
            "id, author_id, title, description, category, model, aspect_ratio, style, image_url, tags, created_at, profiles(nickname)",
          )
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(60);

        rows = retryResult.data as UploadedImagePostRow[] | null;
        error = retryResult.error;
      }

      if (!isMounted) return;
      setUploadedPosts(error ? [] : ((rows ?? []) as UploadedImagePostRow[]));
    }

    loadUploadedPosts();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const galleryItems = useMemo(
    () => [
      ...uploadedPosts.map(uploadedToGalleryItem),
      ...prompts.map(promptToGalleryItem),
    ],
    [uploadedPosts],
  );

  const popularPrompts = useMemo(
    () =>
      prompts
        .map((prompt) => ({
          prompt,
          score:
            (promptCounts[prompt.id]?.likes ?? 0) * 2 +
            (promptCounts[prompt.id]?.saves ?? 0) +
            (promptCounts[prompt.id]?.comments ?? 0),
        }))
        .sort((a, b) => b.score - a.score || b.prompt.id - a.prompt.id)
        .slice(0, 8),
    [promptCounts],
  );

  const recentActivities = useMemo(() => {
    const todayKey = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const todayPosts = uploadedPosts
      .filter(
        (post) =>
          new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(post.created_at)) === todayKey,
      )
      .map((post) => ({
        id: post.id,
        href: `/images/${post.id}`,
        title: post.title,
        meta: "오늘 올라온 글",
        sortKey: new Date(post.created_at).getTime(),
      }));

    const comments = recentPromptComments.map((comment) => {
      const prompt = prompts.find((item) => item.id === Number(comment.prompt_id));

      return {
        id: comment.id,
        href: `/prompts/${comment.prompt_id}`,
        title: prompt ? prompt.title : `프롬프트 ${comment.prompt_id}`,
        meta: `댓글 @${comment.guest_nickname}`,
        sortKey: new Date(comment.created_at).getTime(),
      };
    });

    return [...todayPosts, ...comments].sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
  }, [recentPromptComments, uploadedPosts]);

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = galleryItems.filter((prompt) => {
      const matchesCategory = category === "전체" || prompt.category === category;
      const matchesTab =
        feedTab === "all" ||
        (feedTab === "korean" &&
          (prompt.language === "한국어" ||
            prompt.language === "한영 혼합")) ||
        (feedTab === "english" &&
          prompt.language === "영어") ||
        (feedTab === "mixed" && prompt.language === "한영 혼합");
      const searchableText = [
        prompt.title,
        prompt.description,
        prompt.category,
        prompt.model,
        prompt.style,
        prompt.language,
        prompt.aspectRatio,
        prompt.authorName,
        prompt.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && matchesTab && searchableText.includes(normalizedQuery);
    });

    return [...filtered].sort((a, b) => b.sortKey - a.sortKey);
  }, [category, feedTab, galleryItems, query]);

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
          <Link href="/saved">저장함</Link>
          <Link href="/upload">업로드</Link>
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

      <section className="dc-rank-grid dc-home-panels" aria-label="커뮤니티 현황">
        <aside className="dc-rank-box">
          <div className="dc-rank-head">
            <strong>실시간 인기 프롬프트</strong>
            <span>랭킹</span>
          </div>
          <ol>
            {popularPrompts.map(({ prompt, score }, index) => (
              <li key={prompt.id}>
                <span className="dc-rank-num">{index + 1}</span>
                <Link href={`/prompts/${prompt.id}`}>{prompt.title}</Link>
                <small>{score > 0 ? score : "0"}</small>
              </li>
            ))}
          </ol>
        </aside>

        <aside className="dc-rank-box">
          <div className="dc-rank-head">
            <strong>오늘 글 / 최근 댓글</strong>
            <span>최근반응</span>
          </div>
          <ol>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <li key={`${activity.id}-${index}`}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={activity.href}>{activity.title}</Link>
                  <small>{activity.meta}</small>
                </li>
              ))
            ) : (
              <li className="dc-rank-empty">아직 최근 반응이 없습니다</li>
            )}
          </ol>
        </aside>

        <aside className="dc-rank-box">
          <div className="dc-rank-head">
            <strong>프롬프트 요청 게시판</strong>
            <Link className="dc-rank-head-link" href="/requests">
              바로가기
            </Link>
          </div>
          <ol>
            {requestPosts.length > 0 ? (
              requestPosts.map((post, index) => (
                <li key={post.id}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={`/requests/${post.id}`}>{post.title}</Link>
                  <small>{post.status === "resolved" ? "해결" : "미해결"}</small>
                </li>
              ))
            ) : (
              <li className="dc-rank-empty">요청 글이 없습니다</li>
            )}
          </ol>
        </aside>
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
                    ? galleryItems.length
                    : galleryItems.filter((prompt) => prompt.category === item).length}
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
            <Link className="primary-button dc-upload-button" href="/upload">
              <Upload size={15} aria-hidden="true" />
              이미지 업로드
            </Link>
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
              <Link key={`${prompt.kind}-${prompt.id}`} className="image-card dc-image-card" href={prompt.href}>
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
                  <div className="card-author-line dc-card-author-line">
                    <span>작성자 @{prompt.authorName}</span>
                    <span>{prompt.kind === "uploaded" ? "업로드" : "예시"}</span>
                  </div>
                  <div className="card-reactions">
                    <span>
                      <Heart size={14} aria-hidden="true" />{" "}
                      {prompt.numericId ? (promptCounts[prompt.numericId]?.likes ?? 0) : 0}
                    </span>
                    <span>
                      <Bookmark size={14} aria-hidden="true" />{" "}
                      {prompt.numericId ? (promptCounts[prompt.numericId]?.saves ?? 0) : 0}
                    </span>
                    <span>
                      <MessageCircle size={14} aria-hidden="true" />{" "}
                      {prompt.numericId ? (promptCounts[prompt.numericId]?.comments ?? 0) : 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="submit-section dc-submit dc-upload-entry">
        <div>
          <p className="section-kicker">Upload</p>
          <h2>이미지 결과와 프롬프트 원문을 같이 올리기</h2>
        </div>
        <Link href="/upload" className="primary-button">
          <Upload size={18} aria-hidden="true" />
          이미지 업로드 페이지로
        </Link>
      </section>
    </main>
  );
}
