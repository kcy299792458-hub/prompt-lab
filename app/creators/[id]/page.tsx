"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bookmark, Heart, MessageCircle } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  nickname: string;
  created_at: string;
};

type ImagePostRow = {
  id: string;
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
};

type ReactionRow = {
  image_post_id: string | null;
  kind: "like" | "save";
};

type CommentRow = {
  image_post_id: string | null;
};

type PostCounts = Record<string, { likes: number; saves: number; comments: number }>;
type CreatorPostSort = "latest" | "popular" | "saves" | "comments" | "likes";

const creatorPostSortOptions: Array<{ label: string; value: CreatorPostSort }> = [
  { label: "최신순", value: "latest" },
  { label: "인기순", value: "popular" },
  { label: "저장순", value: "saves" },
  { label: "댓글순", value: "comments" },
  { label: "좋아요순", value: "likes" },
];

function getEngagementScore(postId: string, counts: PostCounts) {
  const postCounts = counts[postId] ?? { likes: 0, saves: 0, comments: 0 };
  return postCounts.saves * 3 + postCounts.likes * 2 + postCounts.comments * 2;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getPostImage(post: ImagePostRow) {
  return post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : post.image_url;
}

export default function CreatorProfilePage() {
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [posts, setPosts] = useState<ImagePostRow[]>([]);
  const [counts, setCounts] = useState<PostCounts>({});
  const [postSort, setPostSort] = useState<CreatorPostSort>("latest");
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

    async function loadCreator() {
      setIsLoading(true);
      setMessage("");

      const [profileResult, initialPostResult] = await Promise.all([
        client
          .from("profiles")
          .select("id, nickname, created_at")
          .eq("id", params.id)
          .maybeSingle(),
        client
          .from("image_posts")
          .select(
            "id, title, description, category, model, aspect_ratio, style, image_url, image_urls, tags, created_at",
          )
          .eq("author_id", params.id)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      let postRows = initialPostResult.data as ImagePostRow[] | null;
      let postError = initialPostResult.error;

      if (postError?.message.includes("image_urls")) {
        const retryResult = await client
          .from("image_posts")
          .select("id, title, description, category, model, aspect_ratio, style, image_url, tags, created_at")
          .eq("author_id", params.id)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(100);

        postRows = retryResult.data as ImagePostRow[] | null;
        postError = retryResult.error;
      }

      if (!isMounted) return;

      if (profileResult.error || postError) {
        setMessage(profileResult.error?.message || postError?.message || "프로필을 불러올 수 없습니다.");
        setProfile(null);
        setPosts([]);
        setCounts({});
        setIsLoading(false);
        return;
      }

      const nextProfile = (profileResult.data as ProfileRow | null) ?? null;
      const nextPosts = postRows ?? [];
      const postIds = nextPosts.map((post) => post.id);
      const nextCounts: PostCounts = {};

      nextPosts.forEach((post) => {
        nextCounts[post.id] = { likes: 0, saves: 0, comments: 0 };
      });

      if (postIds.length > 0) {
        const [reactionResult, commentResult] = await Promise.all([
          client
            .from("reactions")
            .select("image_post_id, kind")
            .in("image_post_id", postIds),
          client
            .from("comments")
            .select("image_post_id")
            .eq("is_hidden", false)
            .in("image_post_id", postIds),
        ]);

        if (!isMounted) return;

        if (!reactionResult.error) {
          ((reactionResult.data ?? []) as ReactionRow[]).forEach((reaction) => {
            if (!reaction.image_post_id || !nextCounts[reaction.image_post_id]) return;
            if (reaction.kind === "like") nextCounts[reaction.image_post_id].likes += 1;
            if (reaction.kind === "save") nextCounts[reaction.image_post_id].saves += 1;
          });
        }

        if (!commentResult.error) {
          ((commentResult.data ?? []) as CommentRow[]).forEach((comment) => {
            if (!comment.image_post_id || !nextCounts[comment.image_post_id]) return;
            nextCounts[comment.image_post_id].comments += 1;
          });
        }
      }

      setProfile(nextProfile);
      setPosts(nextPosts);
      setCounts(nextCounts);
      setIsLoading(false);
    }

    loadCreator();

    return () => {
      isMounted = false;
    };
  }, [params.id, supabase]);

  const stats = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    let totalLikes = 0;
    let totalSaves = 0;
    let totalComments = 0;

    posts.forEach((post) => {
      categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
      post.tags?.forEach((tag) => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;
        tagCounts.set(cleanTag, (tagCounts.get(cleanTag) ?? 0) + 1);
      });
      totalLikes += counts[post.id]?.likes ?? 0;
      totalSaves += counts[post.id]?.saves ?? 0;
      totalComments += counts[post.id]?.comments ?? 0;
    });

    const topCategory =
      [...categoryCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ??
      "아직 없음";
    const topTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([tag]) => tag);

    return {
      totalLikes,
      totalSaves,
      totalComments,
      topCategory,
      topTags,
    };
  }, [counts, posts]);

  const popularPosts = useMemo(
    () =>
      [...posts]
        .filter((post) => getEngagementScore(post.id, counts) > 0)
        .sort(
          (a, b) =>
            getEngagementScore(b.id, counts) - getEngagementScore(a.id, counts) ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 3),
    [counts, posts],
  );

  const sortedPosts = useMemo(() => {
    const getReactionValue = (post: ImagePostRow) => {
      const postCounts = counts[post.id] ?? { likes: 0, saves: 0, comments: 0 };

      if (postSort === "popular") return getEngagementScore(post.id, counts);
      if (postSort === "saves") return postCounts.saves;
      if (postSort === "comments") return postCounts.comments;
      if (postSort === "likes") return postCounts.likes;
      return 0;
    };

    return [...posts].sort((a, b) => {
      const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

      if (postSort === "latest") return dateDiff;

      return getReactionValue(b) - getReactionValue(a) || dateDiff;
    });
  }, [counts, postSort, posts]);

  const avatarText = profile?.nickname.slice(0, 1).toUpperCase() || "?";

  return (
    <main className="site-shell dc-shell">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <img className="brand-logo" src="/logo.png" alt="" />
          </span>
          <span>
            <strong>프롬프트랩</strong>
            <small>크리에이터</small>
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

      <section className="creator-page">
        <Link href="/" className="back-link dc-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          갤러리로
        </Link>

        {isLoading && <p className="dc-empty-message">프로필을 불러오는 중입니다.</p>}
        {!isLoading && message && <p className="dc-empty-message">{message}</p>}
        {!isLoading && !profile && !message && (
          <p className="dc-empty-message">크리에이터를 찾을 수 없습니다.</p>
        )}

        {profile && (
          <>
            <section className="creator-hero">
              <div className="creator-avatar" aria-hidden="true">
                {avatarText}
              </div>
              <div className="creator-hero-main">
                <p className="section-kicker">Creator</p>
                <h1>@{profile.nickname}</h1>
                <p>
                  {stats.topCategory === "아직 없음"
                    ? "아직 업로드한 이미지 프롬프트가 없습니다."
                    : `${stats.topCategory} 중심으로 이미지 프롬프트를 올리는 크리에이터입니다.`}
                </p>
                <div className="creator-meta-row">
                  <span>첫 기록 {posts.length > 0 ? formatDate(posts[posts.length - 1].created_at) : formatDate(profile.created_at)}</span>
                  <span>주력 {stats.topCategory}</span>
                </div>
                <div className="creator-specialty-row" aria-label="주력 분야">
                  <strong>주력 분야</strong>
                  {stats.topTags.length > 0 ? (
                    stats.topTags.map((tag) => <span key={tag}>#{tag}</span>)
                  ) : (
                    <span>{stats.topCategory}</span>
                  )}
                </div>
              </div>
              <div className="creator-stat-grid">
                <div>
                  <strong>{posts.length}</strong>
                  <span>프롬프트</span>
                </div>
                <div>
                  <strong>{stats.totalSaves}</strong>
                  <span>저장</span>
                </div>
                <div>
                  <strong>{stats.totalComments}</strong>
                  <span>댓글</span>
                </div>
                <div>
                  <strong>{stats.totalLikes}</strong>
                  <span>좋아요</span>
                </div>
              </div>
            </section>

            <section className="creator-section">
              <div className="section-heading">
                <h2>인기 프롬프트 TOP 3</h2>
                <span>상위 3개만 표시</span>
              </div>
              {popularPosts.length > 0 ? (
                <div className="creator-popular-list">
                  {popularPosts.map((post, index) => (
                    <Link key={post.id} className="creator-popular-item" href={`/images/${post.id}`}>
                      <span className="creator-popular-rank">{index + 1}</span>
                      <img src={getPostImage(post)} alt={`${post.title} 결과 이미지`} />
                      <span className="creator-popular-copy">
                        <strong>{post.title}</strong>
                        <small>{post.category} · {formatDate(post.created_at)}</small>
                      </span>
                      <span className="creator-popular-stats">
                        <span>
                          <Bookmark size={13} aria-hidden="true" /> {counts[post.id]?.saves ?? 0}
                        </span>
                        <span>
                          <Heart size={13} aria-hidden="true" /> {counts[post.id]?.likes ?? 0}
                        </span>
                        <span>
                          <MessageCircle size={13} aria-hidden="true" /> {counts[post.id]?.comments ?? 0}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="dc-empty-message">아직 반응이 쌓인 프롬프트가 없습니다.</p>
              )}
            </section>

            <section className="creator-section">
              <div className="section-heading">
                <h2>업로드한 프롬프트</h2>
                <span>{posts.length}개</span>
              </div>
              {posts.length > 1 && (
                <div className="creator-sort-tabs" aria-label="업로드한 프롬프트 정렬">
                  {creatorPostSortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={postSort === option.value ? "active" : ""}
                      onClick={() => setPostSort(option.value)}
                      aria-pressed={postSort === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              {posts.length > 0 ? (
                <div className="gallery-grid dc-gallery-grid creator-gallery-grid">
                  {sortedPosts.map((post) => (
                    <Link key={post.id} className="image-card dc-image-card" href={`/images/${post.id}`}>
                      <img src={getPostImage(post)} alt={`${post.title} 결과 이미지`} />
                      <div className="image-card-body">
                        <div className="card-meta">
                          <span>{post.category}</span>
                          <span>{post.aspect_ratio || "비율 미기재"}</span>
                        </div>
                        <h3>{post.title}</h3>
                        <p>{post.description || "설명이 없습니다."}</p>
                        <div className="dc-card-info">
                          <span>{post.model || "GPT Image 2.0"}</span>
                          <span>{post.style || "스타일 미기재"}</span>
                        </div>
                        <div className="card-reactions">
                          <span>
                            <Heart size={14} aria-hidden="true" /> {counts[post.id]?.likes ?? 0}
                          </span>
                          <span>
                            <Bookmark size={14} aria-hidden="true" /> {counts[post.id]?.saves ?? 0}
                          </span>
                          <span>
                            <MessageCircle size={14} aria-hidden="true" /> {counts[post.id]?.comments ?? 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="dc-empty-message">아직 업로드한 프롬프트가 없습니다.</p>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
