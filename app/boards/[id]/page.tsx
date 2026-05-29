"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  Trash2,
  UserRound,
} from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { ReportButton } from "@/app/components/ReportButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPromptLabVisitorKey } from "@/lib/visitor-key";

const boardCategories = ["공지", "자유", "질문", "팁/연구"] as const;

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
  profiles?: ProfileRelation;
};

type CommentRow = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  body: string;
  created_at: string;
  profiles?: ProfileRelation;
};

type BoardReactionRow = {
  board_post_id: string | null;
  visitor_key: string | null;
};

type ProfileRelation = { nickname: string } | { nickname: string }[] | null;

type SessionUser = {
  id: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getProfileNickname(profile: ProfileRelation | undefined) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

function getAuthorName(item: { guest_nickname: string | null; profiles?: ProfileRelation }) {
  return item.guest_nickname || getProfileNickname(item.profiles);
}

function getConceptScore(post: BoardPostRow, recommends: number, comments: number) {
  const engagementScore = recommends * 3 + comments * 2;

  if (engagementScore === 0) return 0;

  const ageHours = Math.max(0, Date.now() - new Date(post.created_at).getTime()) / 3600000;
  const recentBonus = Math.max(0, 48 - ageHours) / 48;

  return engagementScore + recentBonus;
}

export default function BoardPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BoardPostRow | null>(null);
  const [bestPosts, setBestPosts] = useState<BoardPostRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [recommendCounts, setRecommendCounts] = useState<Record<string, number>>({});
  const [activeRecommendation, setActiveRecommendation] = useState(false);
  const [visitorKey, setVisitorKey] = useState("");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    category: "자유",
    title: "",
    body: "",
    password: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [commentPasswords, setCommentPasswords] = useState<Record<string, string>>({});
  const [commentForm, setCommentForm] = useState({
    body: "",
    guestNickname: "",
    password: "",
  });

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const loadPost = async (currentVisitorKey = visitorKey) => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [initialPostResult, commentResult, bestResult, boardCommentResult, reactionResult] =
      await Promise.all([
      supabase
        .from("board_posts")
        .select("id, author_id, guest_nickname, category, title, body, image_urls, created_at, is_hidden, profiles(nickname)")
        .eq("id", params.id)
        .eq("is_hidden", false)
        .maybeSingle(),
      supabase
        .from("comments")
        .select("id, author_id, guest_nickname, body, created_at, profiles(nickname)")
        .eq("board_post_id", params.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true }),
      supabase
        .from("board_posts")
        .select("id, author_id, guest_nickname, category, title, body, created_at, is_hidden, profiles(nickname)")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("comments").select("board_post_id").eq("is_hidden", false),
      supabase.from("board_reactions").select("board_post_id, visitor_key").eq("kind", "recommend"),
    ]);

    let postData = initialPostResult.data as BoardPostRow | null;
    let postError = initialPostResult.error;

    if (postError?.message.includes("image_urls")) {
      const retryResult = await supabase
        .from("board_posts")
        .select("id, author_id, guest_nickname, category, title, body, created_at, is_hidden, profiles(nickname)")
        .eq("id", params.id)
        .eq("is_hidden", false)
        .maybeSingle();

      postData = retryResult.data as BoardPostRow | null;
      postError = retryResult.error;
    }

    if (postError) {
      setMessage(postError.message);
    }

    const nextPost = postData ?? null;
    const boardCommentCounts: Record<string, number> = {};
    const boardRecommendCounts: Record<string, number> = {};
    const reactionRows = (reactionResult.data ?? []) as BoardReactionRow[];

    (boardCommentResult.data ?? []).forEach((comment) => {
      const postId = comment.board_post_id as string | null;
      if (!postId) return;
      boardCommentCounts[postId] = (boardCommentCounts[postId] ?? 0) + 1;
    });

    if (!reactionResult.error) {
      reactionRows.forEach((reaction) => {
        const postId = reaction.board_post_id;
        if (!postId) return;
        boardRecommendCounts[postId] = (boardRecommendCounts[postId] ?? 0) + 1;
      });
    }

    const rankedPosts = ((bestResult.data ?? []) as BoardPostRow[])
      .map((item) => ({
        post: item,
        score: getConceptScore(
          item,
          boardRecommendCounts[item.id] ?? 0,
          boardCommentCounts[item.id] ?? 0,
        ),
      }))
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.post.created_at).getTime() - new Date(a.post.created_at).getTime(),
      )
      .map((item) => item.post)
      .slice(0, 8);

    setPost(nextPost);
    setComments((commentResult.data ?? []) as CommentRow[]);
    setBestPosts(rankedPosts);
    setRecommendCounts(boardRecommendCounts);
    setActiveRecommendation(
      reactionRows.some(
        (reaction) =>
          reaction.board_post_id === params.id && reaction.visitor_key === currentVisitorKey,
      ),
    );

    if (nextPost) {
      setEditForm((current) => ({
        category: current.title ? current.category : nextPost.category,
        title: current.title || nextPost.title,
        body: current.body || nextPost.body,
        password: current.password,
      }));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const currentVisitorKey = getPromptLabVisitorKey();
    setVisitorKey(currentVisitorKey);
    loadPost(currentVisitorKey);

    supabase.auth.getSession().then(({ data }) => {
      setSessionUser((data.session?.user as SessionUser | undefined) ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser((session?.user as SessionUser | undefined) ?? null);
    });

    return () => subscription.unsubscribe();
  }, [params.id, supabase]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !post) {
      setMessage("댓글을 저장할 수 없습니다.");
      return;
    }

    if (!commentForm.body.trim()) {
      setMessage("댓글 내용을 입력하세요.");
      return;
    }

    setMessage("");

    if (sessionUser) {
      const { error } = await supabase.from("comments").insert({
        author_id: sessionUser.id,
        board_post_id: post.id,
        body: commentForm.body.trim(),
      });

      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.rpc("create_guest_board_comment", {
        p_board_post_id: post.id,
        p_body: commentForm.body.trim(),
        p_guest_nickname: commentForm.guestNickname.trim(),
        p_password: commentForm.password,
        p_visitor_key: visitorKey || getPromptLabVisitorKey(),
      });

      if (error) {
        setMessage(
          error.message.includes("p_visitor_key")
            ? "스팸 방지 기능을 사용하려면 014 SQL 실행이 필요합니다."
            : error.message,
        );
        return;
      }
    }

    setCommentForm({ body: "", guestNickname: "", password: "" });
    await loadPost(visitorKey);
  };

  const updateGuestPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !post) return;

    const { error } = await supabase.rpc("update_guest_board_post", {
      p_board_post_id: post.id,
      p_title: editForm.title.trim(),
      p_body: editForm.body.trim(),
      p_category: editForm.category,
      p_password: editForm.password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("게시글을 수정했습니다.");
    setIsEditing(false);
    setEditForm({ ...editForm, password: "" });
    await loadPost(visitorKey);
  };

  const deleteGuestPost = async () => {
    if (!supabase || !post) return;

    const { error } = await supabase.rpc("delete_guest_board_post", {
      p_board_post_id: post.id,
      p_password: deletePassword,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/boards");
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
        setMessage(error.message);
        return;
      }
    } else if (!comment.author_id) {
      const { error } = await supabase.rpc("delete_guest_board_comment", {
        p_comment_id: comment.id,
        p_password: commentPasswords[comment.id] ?? "",
      });

      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      setMessage("본인이 작성한 댓글만 삭제할 수 있습니다.");
      return;
    }

    setMessage("댓글을 삭제했습니다.");
    setCommentPasswords({ ...commentPasswords, [comment.id]: "" });
    await loadPost(visitorKey);
  };

  const toggleRecommendation = async () => {
    if (!supabase || !post || !visitorKey) return;

    const { data, error } = await supabase.rpc("toggle_board_reaction", {
      p_board_post_id: post.id,
      p_visitor_key: visitorKey,
    });

    if (error) {
      setMessage("추천 기능을 사용하려면 008 SQL 실행이 필요합니다.");
      return;
    }

    setActiveRecommendation(Boolean(data));
    await loadPost(visitorKey);
  };

  if (!supabase) {
    return (
      <main className="site-shell dc-shell">
        <section className="not-found-panel">
          <p className="section-kicker">Setup</p>
          <h1>Supabase 환경변수가 필요합니다.</h1>
          <Link href="/boards" className="primary-button">
            게시판으로
          </Link>
        </section>
      </main>
    );
  }

  if (!isLoading && !post) {
    return (
      <main className="site-shell dc-shell">
        <section className="not-found-panel">
          <p className="section-kicker">404</p>
          <h1>게시글을 찾을 수 없습니다.</h1>
          <Link href="/boards" className="primary-button">
            게시판으로 돌아가기
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

      <section className="board-detail-page dc-board-detail-page">
        <Link href="/boards" className="back-link dc-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          게시판으로
        </Link>

        {post && (
          <div className="dc-board-detail-layout">
            <article className="board-detail-article dc-board-article">
              <div className="dc-article-head">
                <span className="board-label">{post.category}</span>
                <h1>{post.title}</h1>
              </div>
              <div className="board-post-meta dc-article-meta">
                <span>
                  <UserRound size={14} aria-hidden="true" /> @{getAuthorName(post)}
                </span>
                <span>{formatDate(post.created_at)}</span>
                <span>
                  <MessageCircle size={14} aria-hidden="true" /> {comments.length}
                </span>
              </div>
              {(post.image_urls?.length ?? 0) > 0 && (
                <div className="dc-board-image-grid">
                  {post.image_urls?.map((imageUrl, index) => (
                    <img key={imageUrl} src={imageUrl} alt={`첨부 이미지 ${index + 1}`} />
                  ))}
                </div>
              )}
              <p className="dc-board-post-body">{post.body}</p>

              <div className="dc-board-reaction-bar">
                <button
                  type="button"
                  className={`dc-recommend-button${activeRecommendation ? " active" : ""}`}
                  onClick={toggleRecommendation}
                  aria-pressed={activeRecommendation}
                >
                  <ThumbsUp size={16} aria-hidden="true" />
                  추천 {recommendCounts[post.id] ?? 0}
                </button>
                <ReportButton
                  targetType="board_post"
                  targetId={post.id}
                  targetTitle={post.title}
                  targetPath={`/boards/${post.id}`}
                  compact
                />
              </div>

              {!post.author_id && (
                <div className="dc-owner-tools">
                  <button type="button" onClick={() => setIsEditing((value) => !value)}>
                    수정
                  </button>
                  <input
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    placeholder="삭제 비밀번호"
                    type="password"
                    aria-label="삭제 비밀번호"
                  />
                  <button type="button" onClick={deleteGuestPost}>
                    삭제
                  </button>
                </div>
              )}

              {isEditing && (
                <form className="dc-write-panel dc-edit-panel" onSubmit={updateGuestPost}>
                  <div className="dc-write-grid">
                    <select
                      value={editForm.category}
                      onChange={(event) =>
                        setEditForm({ ...editForm, category: event.target.value })
                      }
                      aria-label="분류"
                    >
                      {boardCategories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                    <input
                      value={editForm.password}
                      onChange={(event) =>
                        setEditForm({ ...editForm, password: event.target.value })
                      }
                      placeholder="수정 비밀번호"
                      type="password"
                      aria-label="수정 비밀번호"
                    />
                    <input
                      value={editForm.title}
                      onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                      placeholder="제목"
                      aria-label="제목"
                    />
                  </div>
                  <textarea
                    value={editForm.body}
                    onChange={(event) => setEditForm({ ...editForm, body: event.target.value })}
                    placeholder="내용"
                    aria-label="내용"
                  />
                  <button className="primary-button dc-write-submit" type="submit">
                    수정 저장
                  </button>
                </form>
              )}
            </article>

            <aside className="dc-rank-box dc-board-best" aria-label="실시간 인기글">
              <div className="dc-rank-head">
                <strong>실시간 인기글</strong>
                <span>추천</span>
              </div>
              <ol>
                {bestPosts.length > 0 ? (
                  bestPosts.map((item, index) => (
                    <li key={item.id}>
                      <span className="dc-rank-num">{index + 1}</span>
                      <Link href={`/boards/${item.id}`}>{item.title}</Link>
                      <small>{recommendCounts[item.id] ?? 0}</small>
                    </li>
                  ))
                ) : (
                  <li className="dc-rank-empty">아직 인기글이 없습니다</li>
                )}
              </ol>
            </aside>
          </div>
        )}

        <section className="prompt-detail-section dc-comment-section">
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

          {message && <p className="dc-status-message">{message}</p>}

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
                      targetTitle={`게시판 댓글 - ${post?.title || "게시글"}`}
                      targetPath={`/boards/${params.id}`}
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
              <p>아직 댓글이 없습니다. 첫 의견을 남겨보세요.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
