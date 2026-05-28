"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  nickname: string;
  bio?: string | null;
  specialty?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  x_url?: string | null;
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
  view_count?: number | null;
  copy_count?: number | null;
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
type CreatorPostSort = "latest" | "popular" | "copies" | "saves" | "comments" | "likes" | "views";
type ProfileFormState = {
  nickname: string;
  bio: string;
  specialty: string;
  websiteUrl: string;
  instagramUrl: string;
  xUrl: string;
};

const creatorPostSortOptions: Array<{ label: string; value: CreatorPostSort }> = [
  { label: "최신순", value: "latest" },
  { label: "인기순", value: "popular" },
  { label: "복사순", value: "copies" },
  { label: "저장순", value: "saves" },
  { label: "댓글순", value: "comments" },
  { label: "좋아요순", value: "likes" },
  { label: "조회순", value: "views" },
];

function getEngagementScore(post: ImagePostRow, counts: PostCounts) {
  const postCounts = counts[post.id] ?? { likes: 0, saves: 0, comments: 0 };
  return (
    (post.copy_count ?? 0) * 5 +
    postCounts.saves * 3 +
    postCounts.likes * 2 +
    postCounts.comments * 2 +
    (post.view_count ?? 0)
  );
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

function getProfileForm(profile: ProfileRow | null): ProfileFormState {
  return {
    nickname: profile?.nickname ?? "",
    bio: profile?.bio ?? "",
    specialty: profile?.specialty ?? "",
    websiteUrl: profile?.website_url ?? "",
    instagramUrl: profile?.instagram_url ?? "",
    xUrl: profile?.x_url ?? "",
  };
}

function normalizeProfileUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function splitSpecialties(value: string) {
  return value
    .split(/[,\n/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export default function CreatorProfilePage() {
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [posts, setPosts] = useState<ImagePostRow[]>([]);
  const [counts, setCounts] = useState<PostCounts>({});
  const [postSort, setPostSort] = useState<CreatorPostSort>("latest");
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<ProfileFormState>(() => getProfileForm(null));
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSessionUserId(data.session?.user.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSessionUserId(nextSession?.user.id ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

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
          .select("id, nickname, bio, specialty, website_url, instagram_url, x_url, created_at")
          .eq("id", params.id)
          .maybeSingle(),
        client
          .from("image_posts")
          .select(
            "id, title, description, category, model, aspect_ratio, style, image_url, image_urls, tags, view_count, copy_count, created_at",
          )
          .eq("author_id", params.id)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      let profileData = profileResult.data as ProfileRow | null;
      let profileError = profileResult.error;
      let postRows = initialPostResult.data as ImagePostRow[] | null;
      let postError = initialPostResult.error;

      if (
        profileError?.message.includes("bio") ||
        profileError?.message.includes("specialty") ||
        profileError?.message.includes("website_url") ||
        profileError?.message.includes("instagram_url") ||
        profileError?.message.includes("x_url")
      ) {
        const retryProfileResult = await client
          .from("profiles")
          .select("id, nickname, created_at")
          .eq("id", params.id)
          .maybeSingle();

        profileData = retryProfileResult.data as ProfileRow | null;
        profileError = retryProfileResult.error;
      }

      if (
        postError?.message.includes("image_urls") ||
        postError?.message.includes("view_count") ||
        postError?.message.includes("copy_count")
      ) {
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

      if (profileError || postError) {
        setMessage(profileError?.message || postError?.message || "프로필을 불러올 수 없습니다.");
        setProfile(null);
        setPosts([]);
        setCounts({});
        setIsLoading(false);
        return;
      }

      const nextProfile = profileData ?? null;
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
      setEditForm(getProfileForm(nextProfile));
      setIsEditingProfile(false);
      setProfileMessage("");
      setPosts(nextPosts);
      setCounts(nextCounts);
      setIsLoading(false);
    }

    loadCreator();

    return () => {
      isMounted = false;
    };
  }, [params.id, supabase]);

  const isOwnProfile = Boolean(profile && sessionUserId === profile.id);

  const updateEditForm = (key: keyof ProfileFormState, value: string) => {
    setEditForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async () => {
    if (!supabase || !profile || !isOwnProfile) return;

    const nickname = editForm.nickname.trim();
    const bio = editForm.bio.trim();
    const specialty = editForm.specialty.trim();
    const websiteUrl = normalizeProfileUrl(editForm.websiteUrl);
    const instagramUrl = normalizeProfileUrl(editForm.instagramUrl);
    const xUrl = normalizeProfileUrl(editForm.xUrl);

    if (nickname.length < 2 || nickname.length > 24) {
      setProfileMessage("닉네임은 2자 이상 24자 이하로 입력하세요.");
      return;
    }

    if (bio.length > 180) {
      setProfileMessage("한 줄 소개는 180자 이하로 입력하세요.");
      return;
    }

    if (specialty.length > 120) {
      setProfileMessage("주력 분야는 120자 이하로 입력하세요.");
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage("");

    const result = await supabase
      .from("profiles")
      .update({
        nickname,
        bio,
        specialty,
        website_url: websiteUrl,
        instagram_url: instagramUrl,
        x_url: xUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)
      .select("id, nickname, bio, specialty, website_url, instagram_url, x_url, created_at")
      .maybeSingle();

    setIsSavingProfile(false);

    if (result.error) {
      if (
        result.error.message.includes("bio") ||
        result.error.message.includes("specialty") ||
        result.error.message.includes("website_url") ||
        result.error.message.includes("instagram_url") ||
        result.error.message.includes("x_url")
      ) {
        setProfileMessage("프로필 편집을 사용하려면 013 SQL 실행이 필요합니다.");
        return;
      }

      if (result.error.code === "23505") {
        setProfileMessage("이미 사용 중인 닉네임입니다.");
        return;
      }

      setProfileMessage(result.error.message || "프로필을 저장할 수 없습니다.");
      return;
    }

    const nextProfile = (result.data as ProfileRow | null) ?? {
      ...profile,
      nickname,
      bio,
      specialty,
      website_url: websiteUrl,
      instagram_url: instagramUrl,
      x_url: xUrl,
    };

    setProfile(nextProfile);
    setEditForm(getProfileForm(nextProfile));
    setIsEditingProfile(false);
    setProfileMessage("프로필을 저장했습니다.");
  };

  const stats = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    let totalLikes = 0;
    let totalSaves = 0;
    let totalComments = 0;
    let totalCopies = 0;
    let totalViews = 0;

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
      totalCopies += post.copy_count ?? 0;
      totalViews += post.view_count ?? 0;
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
      totalCopies,
      totalViews,
      topCategory,
      topTags,
    };
  }, [counts, posts]);

  const popularPosts = useMemo(
    () =>
      [...posts]
        .filter((post) => getEngagementScore(post, counts) > 0)
        .sort(
          (a, b) =>
            getEngagementScore(b, counts) - getEngagementScore(a, counts) ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 3),
    [counts, posts],
  );

  const sortedPosts = useMemo(() => {
    const getReactionValue = (post: ImagePostRow) => {
      const postCounts = counts[post.id] ?? { likes: 0, saves: 0, comments: 0 };

      if (postSort === "popular") return getEngagementScore(post, counts);
      if (postSort === "copies") return post.copy_count ?? 0;
      if (postSort === "saves") return postCounts.saves;
      if (postSort === "comments") return postCounts.comments;
      if (postSort === "likes") return postCounts.likes;
      if (postSort === "views") return post.view_count ?? 0;
      return 0;
    };

    return [...posts].sort((a, b) => {
      const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

      if (postSort === "latest") return dateDiff;

      return getReactionValue(b) - getReactionValue(a) || dateDiff;
    });
  }, [counts, postSort, posts]);

  const avatarText = profile?.nickname.slice(0, 1).toUpperCase() || "?";
  const profileBio = profile?.bio?.trim() ?? "";
  const profileSpecialty = profile?.specialty?.trim() ?? "";
  const specialtyItems =
    profileSpecialty.length > 0
      ? splitSpecialties(profileSpecialty)
      : stats.topTags.length > 0
        ? stats.topTags.map((tag) => `#${tag}`)
        : stats.topCategory !== "아직 없음"
          ? [stats.topCategory]
          : [];
  const profileLinks = [
    { label: "웹사이트", href: profile?.website_url?.trim() ?? "" },
    { label: "Instagram", href: profile?.instagram_url?.trim() ?? "" },
    { label: "X", href: profile?.x_url?.trim() ?? "" },
  ].filter((item) => item.href);

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
                <div className="creator-title-row">
                  <h1>@{profile.nickname}</h1>
                  {isOwnProfile && (
                    <button
                      type="button"
                      className="creator-edit-button"
                      onClick={() => {
                        setEditForm(getProfileForm(profile));
                        setProfileMessage("");
                        setIsEditingProfile((current) => !current);
                      }}
                    >
                      {isEditingProfile ? (
                        <X size={14} aria-hidden="true" />
                      ) : (
                        <Pencil size={14} aria-hidden="true" />
                      )}
                      {isEditingProfile ? "닫기" : "프로필 수정"}
                    </button>
                  )}
                </div>
                <p>
                  {profileBio ||
                  (stats.topCategory === "아직 없음"
                    ? "아직 업로드한 이미지 프롬프트가 없습니다."
                    : `${stats.topCategory} 중심으로 이미지 프롬프트를 올리는 크리에이터입니다.`)}
                </p>
                <div className="creator-meta-row">
                  <span>첫 기록 {posts.length > 0 ? formatDate(posts[posts.length - 1].created_at) : formatDate(profile.created_at)}</span>
                  <span>주력 {profileSpecialty || stats.topCategory}</span>
                </div>
                {specialtyItems.length > 0 && (
                  <div className="creator-specialty-row" aria-label="주력 분야">
                    <strong>주력 분야</strong>
                    {specialtyItems.map((item) => (
                      <span key={item}>{item.startsWith("#") ? item : `#${item}`}</span>
                    ))}
                  </div>
                )}
                {profileLinks.length > 0 && (
                  <div className="creator-link-row" aria-label="크리에이터 외부 링크">
                    {profileLinks.map((item) => (
                      <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                        <ExternalLink size={13} aria-hidden="true" />
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
                {profileMessage && !isEditingProfile && <p className="creator-save-message">{profileMessage}</p>}
              </div>
              <div className="creator-stat-grid">
                <div>
                  <strong>{posts.length}</strong>
                  <span>프롬프트</span>
                </div>
                <div>
                  <strong>{stats.totalCopies}</strong>
                  <span>복사</span>
                </div>
                <div>
                  <strong>{stats.totalViews}</strong>
                  <span>조회</span>
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

            {isOwnProfile && isEditingProfile && (
              <section className="creator-section creator-edit-panel">
                <div className="section-heading">
                  <h2>내 프로필 수정</h2>
                  <span>작성자 소개</span>
                </div>
                <div className="creator-edit-grid">
                  <label>
                    <span>닉네임</span>
                    <input
                      value={editForm.nickname}
                      onChange={(event) => updateEditForm("nickname", event.target.value)}
                      maxLength={24}
                    />
                  </label>
                  <label>
                    <span>주력 분야</span>
                    <input
                      value={editForm.specialty}
                      onChange={(event) => updateEditForm("specialty", event.target.value)}
                      placeholder="예: 실사 제품사진, 폰카 감성, 호러"
                      maxLength={120}
                    />
                  </label>
                  <label className="creator-edit-wide">
                    <span>한 줄 소개</span>
                    <textarea
                      value={editForm.bio}
                      onChange={(event) => updateEditForm("bio", event.target.value)}
                      placeholder="내가 주로 만드는 프롬프트 스타일을 적어보세요."
                      maxLength={180}
                    />
                  </label>
                  <label>
                    <span>웹사이트</span>
                    <input
                      value={editForm.websiteUrl}
                      onChange={(event) => updateEditForm("websiteUrl", event.target.value)}
                      placeholder="https://..."
                      maxLength={300}
                    />
                  </label>
                  <label>
                    <span>Instagram</span>
                    <input
                      value={editForm.instagramUrl}
                      onChange={(event) => updateEditForm("instagramUrl", event.target.value)}
                      placeholder="https://..."
                      maxLength={300}
                    />
                  </label>
                  <label>
                    <span>X</span>
                    <input
                      value={editForm.xUrl}
                      onChange={(event) => updateEditForm("xUrl", event.target.value)}
                      placeholder="https://..."
                      maxLength={300}
                    />
                  </label>
                </div>
                <div className="creator-edit-actions">
                  <button type="button" className="primary-button" onClick={saveProfile} disabled={isSavingProfile}>
                    <Save size={14} aria-hidden="true" />
                    {isSavingProfile ? "저장 중" : "저장"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setEditForm(getProfileForm(profile));
                      setProfileMessage("");
                      setIsEditingProfile(false);
                    }}
                    disabled={isSavingProfile}
                  >
                    취소
                  </button>
                </div>
                {profileMessage && <p className="creator-save-message">{profileMessage}</p>}
              </section>
            )}

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
                          <Copy size={13} aria-hidden="true" /> {post.copy_count ?? 0}
                        </span>
                        <span>
                          <Bookmark size={13} aria-hidden="true" /> {counts[post.id]?.saves ?? 0}
                        </span>
                        <span>
                          <Eye size={13} aria-hidden="true" /> {post.view_count ?? 0}
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
                          <span>
                            <Copy size={14} aria-hidden="true" /> {post.copy_count ?? 0}
                          </span>
                          <span>
                            <Eye size={14} aria-hidden="true" /> {post.view_count ?? 0}
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
