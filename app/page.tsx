"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Copy,
  Eye,
  Heart,
  MessageCircle,
  Search,
  Upload,
} from "lucide-react";
import { categories, prompts, type Prompt } from "@/data/prompts";
import { AuthControls } from "@/app/components/AuthControls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  categoryLandingPages,
  getAllTags,
  getPromptPath,
  getTagPath,
  modelLandingPages,
} from "@/lib/seo";

type PromptCounts = Record<number, { likes: number; saves: number; comments: number }>;
type UploadedPostCounts = Record<string, { likes: number; saves: number; comments: number }>;
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
type UploadedReactionRow = {
  image_post_id: string | null;
  kind: "like" | "save";
};
type UploadedCommentRow = {
  image_post_id: string | null;
};
type PromptCommentActivityRow = {
  id: string;
  prompt_id: number;
  guest_nickname: string | null;
  body: string;
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};
type UploadedCommentActivityRow = {
  id: string;
  image_post_id: string | null;
  guest_nickname: string | null;
  body: string;
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
  authorId?: string;
  likes?: number;
  saves?: number;
  comments?: number;
  viewCount?: number;
  copyCount?: number;
  sortKey: number;
};

function getProfileNickname(profile: UploadedImagePostRow["profiles"]) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

function normalizeContentKey(value: string) {
  return value.trim().toLowerCase();
}

const promptRankByTitle = new Map(
  prompts.map((prompt) => [normalizeContentKey(prompt.title), prompt.id]),
);

function getGallerySortParts(item: GalleryItem) {
  const promptRank = promptRankByTitle.get(normalizeContentKey(item.title));

  if (promptRank) {
    return { group: 1, value: promptRank };
  }

  return {
    group: item.kind === "uploaded" ? 2 : 1,
    value: item.sortKey,
  };
}

function compareGalleryItems(a: GalleryItem, b: GalleryItem) {
  const aSort = getGallerySortParts(a);
  const bSort = getGallerySortParts(b);

  if (aSort.group !== bSort.group) return bSort.group - aSort.group;
  if (aSort.value !== bSort.value) return bSort.value - aSort.value;

  return b.id.localeCompare(a.id);
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
    href: getPromptPath(prompt),
    tags: prompt.tags,
    authorName: prompt.authorName || "운영자",
    sortKey: prompt.id,
  };
}

function uploadedToGalleryItem(
  post: UploadedImagePostRow,
  counts?: { likes: number; saves: number; comments: number },
): GalleryItem {
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
    authorId: post.author_id,
    likes: counts?.likes ?? 0,
    saves: counts?.saves ?? 0,
    comments: counts?.comments ?? 0,
    viewCount: post.view_count ?? 0,
    copyCount: post.copy_count ?? 0,
    sortKey: new Date(post.created_at).getTime(),
  };
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [promptCounts, setPromptCounts] = useState<PromptCounts>({});
  const [uploadedPosts, setUploadedPosts] = useState<UploadedImagePostRow[]>([]);
  const [uploadedPostCounts, setUploadedPostCounts] = useState<UploadedPostCounts>({});
  const [recentPromptComments, setRecentPromptComments] = useState<PromptCommentActivityRow[]>([]);
  const [recentImageComments, setRecentImageComments] = useState<UploadedCommentActivityRow[]>([]);
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
      const promptIds = prompts.map((prompt) => prompt.id);

      const commentResult = await (async () => {
        const result = await client
          .from("prompt_comments")
          .select("id, prompt_id, guest_nickname, body, created_at, profiles(nickname)")
          .eq("is_hidden", false)
          .in("prompt_id", promptIds)
          .order("created_at", { ascending: false })
          .limit(5);

        if (result.error?.message.includes("relationship")) {
          const fallbackResult = await client
            .from("prompt_comments")
            .select("id, prompt_id, guest_nickname, body, created_at")
            .eq("is_hidden", false)
            .in("prompt_id", promptIds)
            .order("created_at", { ascending: false })
            .limit(5);

          return {
            data: (fallbackResult.data ?? []).map((comment) => ({
              ...comment,
              profiles: null,
            })) as PromptCommentActivityRow[],
            error: fallbackResult.error,
          };
        }

        return {
          data: (result.data ?? []) as PromptCommentActivityRow[],
          error: result.error,
        };
      })();

      if (!isMounted) return;

      setRecentPromptComments(
        commentResult.error ? [] : ((commentResult.data ?? []) as PromptCommentActivityRow[]),
      );
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
          "id, author_id, title, description, category, model, aspect_ratio, style, image_url, image_urls, tags, view_count, copy_count, created_at, profiles(nickname)",
        )
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(60);

      let rows = result.data as UploadedImagePostRow[] | null;
      let error = result.error;

      if (
        error?.message.includes("image_urls") ||
        error?.message.includes("view_count") ||
        error?.message.includes("copy_count")
      ) {
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

      if (error) {
        setUploadedPosts([]);
        setUploadedPostCounts({});
        setRecentImageComments([]);
        return;
      }

      const nextRows = (rows ?? []) as UploadedImagePostRow[];
      const postIds = nextRows.map((post) => post.id);
      const nextCounts: UploadedPostCounts = {};

      nextRows.forEach((post) => {
        nextCounts[post.id] = { likes: 0, saves: 0, comments: 0 };
      });

      if (postIds.length > 0) {
        const [reactionResult, commentResult, recentImageCommentResult] = await Promise.all([
          client
            .from("reactions")
            .select("image_post_id, kind")
            .in("image_post_id", postIds),
          client
            .from("comments")
            .select("image_post_id")
            .eq("is_hidden", false)
            .in("image_post_id", postIds),
          client
            .from("comments")
            .select("id, image_post_id, guest_nickname, body, created_at, profiles(nickname)")
            .eq("is_hidden", false)
            .in("image_post_id", postIds)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (!isMounted) return;

        if (!reactionResult.error) {
          ((reactionResult.data ?? []) as UploadedReactionRow[]).forEach((reaction) => {
            if (!reaction.image_post_id || !nextCounts[reaction.image_post_id]) return;
            if (reaction.kind === "like") nextCounts[reaction.image_post_id].likes += 1;
            if (reaction.kind === "save") nextCounts[reaction.image_post_id].saves += 1;
          });
        }

        if (!commentResult.error) {
          ((commentResult.data ?? []) as UploadedCommentRow[]).forEach((comment) => {
            if (!comment.image_post_id || !nextCounts[comment.image_post_id]) return;
            nextCounts[comment.image_post_id].comments += 1;
          });
        }

        if (!recentImageCommentResult.error) {
          setRecentImageComments(
            (recentImageCommentResult.data ?? []) as UploadedCommentActivityRow[],
          );
        } else {
          setRecentImageComments([]);
        }
      } else {
        setRecentImageComments([]);
      }

      setUploadedPosts(nextRows);
      setUploadedPostCounts(nextCounts);
    }

    loadUploadedPosts();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const galleryItems = useMemo(() => {
    const uploadedTitleKeys = new Set(
      uploadedPosts.map((post) => normalizeContentKey(post.title)),
    );
    const seedItems = prompts
      .filter((prompt) => !uploadedTitleKeys.has(normalizeContentKey(prompt.title)))
      .map(promptToGalleryItem);

    return [
      ...uploadedPosts.map((post) => uploadedToGalleryItem(post, uploadedPostCounts[post.id])),
      ...seedItems,
    ];
  }, [uploadedPostCounts, uploadedPosts]);

  const popularPrompts = useMemo(() => {
    const uploadedTitleKeys = new Set(
      uploadedPosts.map((post) => normalizeContentKey(post.title)),
    );
    const uploadedItems = uploadedPosts.map((post) => {
      const counts = uploadedPostCounts[post.id] ?? { likes: 0, saves: 0, comments: 0 };

      return {
        id: `uploaded-${post.id}`,
        href: `/images/${post.id}`,
        title: post.title,
        score:
          (post.copy_count ?? 0) * 5 +
          (post.view_count ?? 0) +
          counts.likes * 2 +
          counts.saves +
          counts.comments * 2,
        sortKey: new Date(post.created_at).getTime(),
      };
    });
    const seedItems = prompts
      .filter((prompt) => !uploadedTitleKeys.has(normalizeContentKey(prompt.title)))
      .map((prompt) => ({
        id: `seed-${prompt.id}`,
        href: getPromptPath(prompt),
        title: prompt.title,
        score:
          (promptCounts[prompt.id]?.likes ?? 0) * 2 +
          (promptCounts[prompt.id]?.saves ?? 0) +
          (promptCounts[prompt.id]?.comments ?? 0),
        sortKey: prompt.id,
      }));

    return [...uploadedItems, ...seedItems]
      .sort((a, b) => b.score - a.score || b.sortKey - a.sortKey)
      .slice(0, 8);
  }, [promptCounts, uploadedPostCounts, uploadedPosts]);

  const recentCommentItems = useMemo(() => {
    const seedCommentItems = recentPromptComments.flatMap((comment) => {
        const prompt = prompts.find((item) => item.id === Number(comment.prompt_id));
        if (!prompt) return [];

        return {
          id: comment.id,
          href: getPromptPath(prompt),
          title: comment.body,
          meta: `@${comment.guest_nickname || getProfileNickname(comment.profiles)} · ${prompt.title}`,
          sortKey: new Date(comment.created_at).getTime(),
        };
      });
    const imageCommentItems = recentImageComments.flatMap((comment) => {
      const post = uploadedPosts.find((item) => item.id === comment.image_post_id);
      if (!post) return [];

      return {
        id: comment.id,
        href: `/images/${post.id}`,
        title: comment.body,
        meta: `@${comment.guest_nickname || getProfileNickname(comment.profiles)} - ${post.title}`,
        sortKey: new Date(comment.created_at).getTime(),
      };
    });

    return [...seedCommentItems, ...imageCommentItems]
      .sort((a, b) => b.sortKey - a.sortKey)
      .slice(0, 5);
  }, [recentImageComments, recentPromptComments, uploadedPosts]);

  const weeklyCreators = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const creatorMap = new Map<
      string,
      {
        authorName: string;
        authorId: string;
        postCount: number;
        latestAt: number;
        latestHref: string;
        latestTitle: string;
      }
    >();

    uploadedPosts.forEach((post) => {
      const createdAt = new Date(post.created_at).getTime();
      if (createdAt < weekAgo) return;

      const authorName = getProfileNickname(post.profiles);
      const current = creatorMap.get(post.author_id);

      if (!current) {
        creatorMap.set(post.author_id, {
          authorName,
          authorId: post.author_id,
          postCount: 1,
          latestAt: createdAt,
          latestHref: `/images/${post.id}`,
          latestTitle: post.title,
        });
        return;
      }

      current.postCount += 1;

      if (createdAt > current.latestAt) {
        current.latestAt = createdAt;
        current.latestHref = `/images/${post.id}`;
        current.latestTitle = post.title;
      }
    });

    return [...creatorMap.values()]
      .sort((a, b) => b.postCount - a.postCount || b.latestAt - a.latestAt)
      .slice(0, 8);
  }, [uploadedPosts]);

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = galleryItems.filter((prompt) => {
      const matchesCategory = category === "전체" || prompt.category === category;
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

      return matchesCategory && searchableText.includes(normalizedQuery);
    });

    return [...filtered].sort(compareGalleryItems);
  }, [category, galleryItems, query]);
  const seoTags = useMemo(() => getAllTags().slice(0, 18), []);

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
          <p>이미지와 실제 프롬프트를 한 번에 확인</p>
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
            {popularPrompts.map((prompt, index) => (
              <li key={prompt.id}>
                <span className="dc-rank-num">{index + 1}</span>
                <Link href={prompt.href}>{prompt.title}</Link>
                <small>{prompt.score > 0 ? prompt.score : "0"}</small>
              </li>
            ))}
          </ol>
        </aside>

        <aside className="dc-rank-box">
          <div className="dc-rank-head">
            <strong>이번 주 인기 크리에이터</strong>
            <span>업로드</span>
          </div>
          <ol>
            {weeklyCreators.length > 0 ? (
              weeklyCreators.map((creator, index) => (
                <li key={`${creator.authorName}-${creator.latestAt}`}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={`/creators/${creator.authorId}`} title={creator.latestTitle}>
                    @{creator.authorName}
                  </Link>
                  <small>{creator.postCount}글</small>
                </li>
              ))
            ) : (
              <li className="dc-rank-empty">이번 주 업로더가 없습니다</li>
            )}
          </ol>
        </aside>

        <aside className="dc-rank-box">
          <div className="dc-rank-head">
            <strong>최근 댓글</strong>
            <span>댓글반응</span>
          </div>
          <ol>
            {recentCommentItems.length > 0 ? (
              recentCommentItems.map((activity, index) => (
                <li key={`${activity.id}-${index}`}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={activity.href}>{activity.title}</Link>
                  <small>{activity.meta}</small>
                </li>
              ))
            ) : (
              <li className="dc-rank-empty">아직 댓글이 없습니다</li>
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
              <Upload size={18} aria-hidden="true" />
              이미지 업로드
            </Link>
          </div>

          <div className="dc-list-head">
            <span>이미지</span>
            <span>제목</span>
            <span>모델</span>
            <span>반응</span>
          </div>

          <div className="gallery-grid dc-gallery-grid">
            {filteredPrompts.map((prompt) => {
              const cardCounts =
                prompt.kind === "uploaded"
                  ? {
                      likes: prompt.likes ?? 0,
                      saves: prompt.saves ?? 0,
                      comments: prompt.comments ?? 0,
                      copies: prompt.copyCount ?? 0,
                      views: prompt.viewCount ?? 0,
                    }
                  : {
                      likes: prompt.numericId ? (promptCounts[prompt.numericId]?.likes ?? 0) : 0,
                      saves: prompt.numericId ? (promptCounts[prompt.numericId]?.saves ?? 0) : 0,
                      comments: prompt.numericId ? (promptCounts[prompt.numericId]?.comments ?? 0) : 0,
                      copies: 0,
                      views: 0,
                    };

              return (
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
                        <Heart size={14} aria-hidden="true" /> {cardCounts.likes}
                      </span>
                      <span>
                        <Bookmark size={14} aria-hidden="true" /> {cardCounts.saves}
                      </span>
                      <span>
                        <MessageCircle size={14} aria-hidden="true" /> {cardCounts.comments}
                      </span>
                      {prompt.kind === "uploaded" && (
                        <>
                          <span>
                            <Copy size={14} aria-hidden="true" /> {cardCounts.copies}
                          </span>
                          <span>
                            <Eye size={14} aria-hidden="true" /> {cardCounts.views}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="seo-link-section dc-home-seo-links" aria-label="주제별 프롬프트 탐색">
        <div>
          <p className="section-kicker">Explore</p>
          <h2>주제별 AI 이미지 프롬프트</h2>
          <p>검색에서 많이 찾는 카테고리, 모델, 태그별로 프롬프트 예시를 모았습니다.</p>
        </div>
        <div className="seo-link-groups">
          <div>
            <strong>카테고리</strong>
            <div className="seo-chip-row">
              {categoryLandingPages.map((page) => (
                <Link key={page.slug} href={`/categories/${page.slug}`}>
                  {page.category}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <strong>모델</strong>
            <div className="seo-chip-row">
              {modelLandingPages.map((page) => (
                <Link key={page.slug} href={`/models/${page.slug}`}>
                  {page.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <strong>태그</strong>
            <div className="seo-chip-row">
              {seoTags.map((tag) => (
                <Link key={tag} href={getTagPath(tag)}>
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="submit-section dc-submit dc-upload-entry">
        <div>
          <p className="section-kicker">Upload</p>
          <h2>이미지 결과와 실제 프롬프트 1개를 같이 올리기</h2>
        </div>
        <Link href="/upload" className="primary-button">
          <Upload size={18} aria-hidden="true" />
          이미지 업로드 페이지로
        </Link>
      </section>
    </main>
  );
}
