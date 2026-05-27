"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ImagePlus,
  MessageCircle,
  PencilLine,
  Search,
  ThumbsUp,
  X,
} from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

const boardCategories = ["전체", "공지", "자유", "질문", "팁/연구"] as const;
type ActiveCategory = (typeof boardCategories)[number];

type BoardPostRow = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  category: string;
  title: string;
  body: string;
  image_urls?: string[] | null;
  created_at: string;
  is_hidden: boolean;
};

type BoardCommentActivityRow = {
  id: string;
  board_post_id: string | null;
  guest_nickname: string | null;
  body: string;
  created_at: string;
};

type BoardReactionRow = {
  board_post_id: string | null;
};

type SessionUser = {
  id: string;
  email?: string;
  user_metadata?: {
    nickname?: string;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getAuthorName(post: BoardPostRow) {
  return post.guest_nickname || "회원";
}

function getCommentAuthorName(comment: BoardCommentActivityRow) {
  return comment.guest_nickname || "회원";
}

function getConceptScore(post: BoardPostRow, recommends: number, comments: number) {
  const engagementScore = recommends * 3 + comments * 2;

  if (engagementScore === 0) return 0;

  const ageHours = Math.max(0, Date.now() - new Date(post.created_at).getTime()) / 3600000;
  const recentBonus = Math.max(0, 48 - ageHours) / 48;

  return engagementScore + recentBonus;
}

export default function BoardsPage() {
  const [category, setCategory] = useState<ActiveCategory>("전체");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<BoardPostRow[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [recommendCounts, setRecommendCounts] = useState<Record<string, number>>({});
  const [recentComments, setRecentComments] = useState<BoardCommentActivityRow[]>([]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    category: "자유",
    title: "",
    body: "",
    guestNickname: "",
    password: "",
  });

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const configured = isSupabaseConfigured();

  const loadPosts = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [commentResult, reactionResult, initialPostResult] = await Promise.all([
      supabase
        .from("comments")
        .select("id, board_post_id, guest_nickname, body, created_at")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false }),
      supabase.from("board_reactions").select("board_post_id").eq("kind", "recommend"),
      supabase
        .from("board_posts")
        .select("id, author_id, guest_nickname, category, title, body, image_urls, created_at, is_hidden")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false }),
    ]);

    let postData = initialPostResult.data as BoardPostRow[] | null;
    let postError = initialPostResult.error;

    if (postError?.message.includes("image_urls")) {
      const retryResult = await supabase
        .from("board_posts")
        .select("id, author_id, guest_nickname, category, title, body, created_at, is_hidden")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });

      postData = retryResult.data as BoardPostRow[] | null;
      postError = retryResult.error;
    }

    if (postError) {
      setMessage(postError.message);
      setPosts([]);
      setIsLoading(false);
      return;
    }

    const commentRows = (commentResult.data ?? []) as BoardCommentActivityRow[];
    const reactionRows = (reactionResult.data ?? []) as BoardReactionRow[];
    const counts: Record<string, number> = {};
    const recommends: Record<string, number> = {};

    commentRows.forEach((comment) => {
      const postId = comment.board_post_id as string | null;
      if (!postId) return;
      counts[postId] = (counts[postId] ?? 0) + 1;
    });

    if (!reactionResult.error) {
      reactionRows.forEach((reaction) => {
        const postId = reaction.board_post_id;
        if (!postId) return;
        recommends[postId] = (recommends[postId] ?? 0) + 1;
      });
    }

    setCommentCounts(counts);
    setRecommendCounts(recommends);
    setPosts((postData ?? []) as BoardPostRow[]);
    setRecentComments(commentRows.filter((comment) => comment.board_post_id).slice(0, 5));
    setIsLoading(false);
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    loadPosts();

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

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory = category === "전체" || post.category === category;
      const matchesQuery = [post.title, post.body, getAuthorName(post), post.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, posts, query]);

  const conceptPosts = useMemo(
    () =>
      [...posts]
        .map((post) => ({
          post,
          score: getConceptScore(
            post,
            recommendCounts[post.id] ?? 0,
            commentCounts[post.id] ?? 0,
          ),
        }))
        .filter((item) => item.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            new Date(b.post.created_at).getTime() - new Date(a.post.created_at).getTime(),
        )
        .map((item) => item.post)
        .slice(0, 8),
    [commentCounts, posts, recommendCounts],
  );

  const resetImages = () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const imageOnlyFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    const oversizedFile = imageOnlyFiles.find((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFile) {
      setMessage("사진은 1장당 5MB 이하만 첨부할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const nextFiles = imageOnlyFiles.slice(0, 3);
    resetImages();
    setImageFiles(nextFiles);
    setImagePreviews(nextFiles.map((file) => URL.createObjectURL(file)));
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setImagePreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const uploadBoardImages = async () => {
    if (!supabase || imageFiles.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `board/${new Date().toISOString().slice(0, 10)}/${uniqueId}.${extension}`;

      const { data, error } = await supabase.storage.from("board-images").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        throw new Error("사진 첨부 기능을 사용하려면 005 SQL 실행이 필요합니다.");
      }

      const { data: publicData } = supabase.storage.from("board-images").getPublicUrl(data.path);
      uploadedUrls.push(publicData.publicUrl);
    }

    return uploadedUrls;
  };

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase 환경변수가 필요합니다.");
      return;
    }

    if (!form.title.trim() || !form.body.trim()) {
      setMessage("제목과 내용을 입력하세요.");
      return;
    }

    if (!sessionUser && form.guestNickname.trim().length < 2) {
      setMessage("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    if (!sessionUser && form.password.length < 4) {
      setMessage("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    try {
      const imageUrls = await uploadBoardImages();

      if (sessionUser) {
        const insertPayload: {
          author_id: string;
          category: string;
          title: string;
          body: string;
          image_urls?: string[];
        } = {
          author_id: sessionUser.id,
          category: form.category,
          title: form.title.trim(),
          body: form.body.trim(),
        };

        if (imageUrls.length > 0) {
          insertPayload.image_urls = imageUrls;
        }

        const { error } = await supabase.from("board_posts").insert(insertPayload);

        if (error) {
          setMessage(error.message);
          return;
        }
      } else {
        const rpcPayload: {
          p_category: string;
          p_title: string;
          p_body: string;
          p_guest_nickname: string;
          p_password: string;
          p_image_urls?: string[];
        } = {
          p_category: form.category,
          p_title: form.title.trim(),
          p_body: form.body.trim(),
          p_guest_nickname: form.guestNickname.trim(),
          p_password: form.password,
        };

        if (imageUrls.length > 0) {
          rpcPayload.p_image_urls = imageUrls;
        }

        const { error } = await supabase.rpc("create_guest_board_post", rpcPayload);

        if (error) {
          setMessage(
            imageUrls.length > 0 && error.message.includes("p_image_urls")
              ? "사진 첨부 기능을 사용하려면 005 SQL 실행이 필요합니다."
              : error.message,
          );
          return;
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게시글을 등록할 수 없습니다.");
      return;
    } finally {
      setIsSubmitting(false);
    }

    setForm({
      category: "자유",
      title: "",
      body: "",
      guestNickname: "",
      password: "",
    });
    resetImages();
    setIsWriteOpen(false);
    await loadPosts();
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
            <small>글 게시판</small>
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

      <section className="dc-headline dc-board-headline">
        <div>
          <h1>프롬프트 게시판</h1>
          <p>회원가입 없이도 닉네임과 비밀번호로 질문, 팁, 모델 비교 글을 남길 수 있습니다.</p>
        </div>
        <label className="dc-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="질문, 모델, 네거티브 검색"
            aria-label="게시글 검색"
          />
        </label>
      </section>

      <nav className="community-board-tabs" aria-label="게시판 종류">
        <Link className="active" href="/boards">
          일반 게시판
        </Link>
        <Link href="/requests">프롬프트 요청</Link>
      </nav>

      <section className="board-page dc-board-page">
        <div className="dc-board-page-layout">
          <aside className="filter-panel dc-side">
            <div className="dc-side-title">게시판</div>
            <div className="category-list dc-category-list" aria-label="게시판 분류">
              {boardCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === category ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  <span>{item}</span>
                  <small>
                    {item === "전체"
                      ? posts.length
                      : posts.filter((post) => post.category === item).length}
                  </small>
                </button>
              ))}
            </div>
            <Link className="dc-write-link" href="/">
              이미지 갤러리 보기
            </Link>
          </aside>

          <section className="dc-board-main">
            <div className="gallery-toolbar dc-board-toolbar">
              <div>
                <p className="section-kicker">Community</p>
                <h2>{filteredPosts.length}개의 글</h2>
              </div>
              <button
                type="button"
                className="primary-button dc-write-button"
                onClick={() => setIsWriteOpen((value) => !value)}
              >
                <PencilLine size={15} aria-hidden="true" />
                글쓰기
              </button>
            </div>

            {isWriteOpen && (
              <form className="dc-write-panel dc-board-write-panel" onSubmit={submitPost}>
                <div className="dc-write-panel-head">
                  <strong>새 글 작성</strong>
                  <span>이미지는 최대 3장</span>
                </div>
                <div className="dc-write-grid">
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    aria-label="분류"
                  >
                    {boardCategories
                      .filter((item) => item !== "전체")
                      .map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                  </select>
                  {!sessionUser && (
                    <>
                      <input
                        value={form.guestNickname}
                        onChange={(event) =>
                          setForm({ ...form, guestNickname: event.target.value })
                        }
                        placeholder="닉네임"
                        aria-label="닉네임"
                      />
                      <input
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                        placeholder="수정/삭제 비밀번호"
                        type="password"
                        aria-label="수정/삭제 비밀번호"
                      />
                    </>
                  )}
                  <input
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    placeholder="제목"
                    aria-label="제목"
                    className="dc-title-input"
                  />
                </div>
                <textarea
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  placeholder="내용"
                  aria-label="내용"
                  className="dc-board-body-input"
                />
                <div className="dc-file-row">
                  <label className="dc-file-button">
                    <ImagePlus size={15} aria-hidden="true" />
                    사진 첨부
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                  </label>
                  <span>{imageFiles.length}장 선택됨</span>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="dc-image-preview-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview} className="dc-image-preview">
                        <img src={preview} alt={`첨부 이미지 ${index + 1}`} />
                        <button type="button" onClick={() => removeImage(index)} aria-label="첨부 이미지 제거">
                          <X size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button className="primary-button dc-write-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "등록 중" : "등록"}
                </button>
              </form>
            )}

            {message && <p className="dc-status-message">{message}</p>}

            <div className="dc-post-list-head">
              <span>분류</span>
              <span>제목</span>
              <span>작성자</span>
              <span>추천</span>
              <span>댓글</span>
            </div>

            <div className="dc-post-list">
              {!configured && (
                <p className="dc-empty-message">Supabase 환경변수 설정이 필요합니다.</p>
              )}
              {configured && isLoading && <p className="dc-empty-message">불러오는 중입니다.</p>}
              {configured && !isLoading && filteredPosts.length === 0 && (
                <p className="dc-empty-message">아직 게시글이 없습니다.</p>
              )}
              {filteredPosts.map((post) => (
                <Link key={post.id} className="board-row dc-post-row" href={`/boards/${post.id}`}>
                  <span className="board-label">{post.category}</span>
                  <div className="dc-post-title">
                    <h3>
                      {post.title}
                      {(post.image_urls?.length ?? 0) > 0 && (
                        <span className="dc-post-image-badge">사진 {post.image_urls?.length}</span>
                      )}
                    </h3>
                    <p>{post.body}</p>
                  </div>
                  <small>@{getAuthorName(post)}</small>
                  <span>
                    <ThumbsUp size={13} aria-hidden="true" /> {recommendCounts[post.id] ?? 0}
                  </span>
                  <span>
                    <MessageCircle size={13} aria-hidden="true" /> {commentCounts[post.id] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <aside className="dc-board-side-stack" aria-label="게시판 랭킹과 최근 댓글">
            <section className="dc-rank-box dc-board-best">
              <div className="dc-rank-head">
                <strong>실시간 개념글</strong>
                <span>추천+댓글</span>
              </div>
              <ol>
                {conceptPosts.length > 0 ? (
                  conceptPosts.map((post, index) => (
                    <li key={post.id}>
                      <span className="dc-rank-num">{index + 1}</span>
                      <Link href={`/boards/${post.id}`}>{post.title}</Link>
                      <small>
                        {recommendCounts[post.id] ?? 0}/{commentCounts[post.id] ?? 0}
                      </small>
                    </li>
                  ))
                ) : (
                  <li className="dc-rank-empty">아직 개념글이 없습니다</li>
                )}
              </ol>
            </section>

            <section className="dc-rank-box dc-board-best">
              <div className="dc-rank-head">
                <strong>최근 댓글</strong>
                <span>반응</span>
              </div>
              <ol>
                {recentComments.length > 0 ? (
                  recentComments.map((comment, index) => {
                    const linkedPost = posts.find((post) => post.id === comment.board_post_id);

                    return (
                      <li key={comment.id}>
                        <span className="dc-rank-num">{index + 1}</span>
                        <Link href={`/boards/${comment.board_post_id}`}>
                          {linkedPost?.title || comment.body}
                        </Link>
                        <small>@{getCommentAuthorName(comment)}</small>
                      </li>
                    );
                  })
                ) : (
                  <li className="dc-rank-empty">아직 댓글이 없습니다</li>
                )}
              </ol>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
