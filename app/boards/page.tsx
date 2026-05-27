"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Heart,
  MessageCircle,
  PencilLine,
  Search,
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
  created_at: string;
  is_hidden: boolean;
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

export default function BoardsPage() {
  const [category, setCategory] = useState<ActiveCategory>("전체");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<BoardPostRow[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
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

    const [{ data: postData, error: postError }, { data: commentData }] = await Promise.all([
      supabase
        .from("board_posts")
        .select("id, author_id, guest_nickname, category, title, body, created_at, is_hidden")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false }),
      supabase.from("comments").select("board_post_id").eq("is_hidden", false),
    ]);

    if (postError) {
      setMessage(postError.message);
      setPosts([]);
      setIsLoading(false);
      return;
    }

    const counts: Record<string, number> = {};
    (commentData ?? []).forEach((comment) => {
      const postId = comment.board_post_id as string | null;
      if (!postId) return;
      counts[postId] = (counts[postId] ?? 0) + 1;
    });

    setCommentCounts(counts);
    setPosts((postData ?? []) as BoardPostRow[]);
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

  const bestPosts = useMemo(
    () =>
      [...posts]
        .sort((a, b) => (commentCounts[b.id] ?? 0) - (commentCounts[a.id] ?? 0))
        .slice(0, 8),
    [commentCounts, posts],
  );

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

    setMessage("");

    if (sessionUser) {
      const { error } = await supabase.from("board_posts").insert({
        author_id: sessionUser.id,
        category: form.category,
        title: form.title.trim(),
        body: form.body.trim(),
      });

      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.rpc("create_guest_board_post", {
        p_category: form.category,
        p_title: form.title.trim(),
        p_body: form.body.trim(),
        p_guest_nickname: form.guestNickname.trim(),
        p_password: form.password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }
    }

    setForm({
      category: "자유",
      title: "",
      body: "",
      guestNickname: "",
      password: "",
    });
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
              <form className="dc-write-panel" onSubmit={submitPost}>
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
                  />
                </div>
                <textarea
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  placeholder="내용"
                  aria-label="내용"
                />
                <button className="primary-button dc-write-submit" type="submit">
                  등록
                </button>
              </form>
            )}

            {message && <p className="dc-status-message">{message}</p>}

            <div className="dc-post-list-head">
              <span>분류</span>
              <span>제목</span>
              <span>작성자</span>
              <span>조회</span>
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
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </div>
                  <small>@{getAuthorName(post)}</small>
                  <span>
                    <Eye size={13} aria-hidden="true" /> 0
                  </span>
                  <span>
                    <Heart size={13} aria-hidden="true" /> 0
                  </span>
                  <span>
                    <MessageCircle size={13} aria-hidden="true" /> {commentCounts[post.id] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <aside className="dc-rank-box dc-board-best" aria-label="실시간 베스트">
            <div className="dc-rank-head">
              <strong>실시간 베스트</strong>
              <span>글</span>
            </div>
            <ol>
              {bestPosts.map((post, index) => (
                <li key={post.id}>
                  <span className="dc-rank-num">{index + 1}</span>
                  <Link href={`/boards/${post.id}`}>{post.title}</Link>
                  <small>{commentCounts[post.id] ?? 0}</small>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
