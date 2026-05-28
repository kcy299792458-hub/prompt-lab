"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, EyeOff, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type AdminFilter = "all" | "report" | "image" | "board" | "comment" | "request";
type ModerationTable =
  | "image_posts"
  | "board_posts"
  | "comments"
  | "prompt_comments"
  | "prompt_requests"
  | "prompt_request_answers";

type ProfileRelation = { nickname: string } | { nickname: string }[] | null;

type ModerationItem = {
  id: string;
  table?: ModerationTable;
  type: Exclude<AdminFilter, "all">;
  label: string;
  title: string;
  body: string;
  author: string;
  href: string;
  createdAt: string;
  reportId?: string;
  reportStatus?: string;
  targetId?: string;
  targetTable?: ModerationTable;
  targetType?: string;
};

type ContentReportRow = {
  id: string;
  reporter_id: string | null;
  visitor_key: string | null;
  target_type: string;
  target_id: string;
  target_title: string;
  target_path: string;
  reason: string;
  status: string;
  created_at: string;
};

const reportTargetLabels: Record<string, string> = {
  image_post: "이미지",
  board_post: "게시글",
  comment: "댓글",
  prompt_comment: "프롬프트 댓글",
  prompt_request: "요청글",
  prompt_request_answer: "요청 답변",
};

const reportTargetTables: Record<string, ModerationTable> = {
  image_post: "image_posts",
  board_post: "board_posts",
  comment: "comments",
  prompt_comment: "prompt_comments",
  prompt_request: "prompt_requests",
  prompt_request_answer: "prompt_request_answers",
};

const reportStatusLabels: Record<string, string> = {
  open: "대기",
  reviewed: "확인",
  dismissed: "기각",
  actioned: "처리됨",
};

function getProfileNickname(profile: ProfileRelation | undefined) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

function getAuthorName(item: { guest_nickname?: string | null; profiles?: ProfileRelation }) {
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

export default function AdminPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AdminFilter>("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const configured = isSupabaseConfigured();

  const loadItems = async () => {
    if (!supabase || !isAdmin) return;

    setIsLoading(true);
    setMessage("");

    const [
      imageResult,
      boardResult,
      commentResult,
      promptCommentResult,
      requestResult,
      answerResult,
      reportResult,
    ] = await Promise.all([
      supabase
        .from("image_posts")
        .select("id, title, description, created_at, profiles(nickname)")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("board_posts")
        .select("id, title, body, guest_nickname, created_at, profiles(nickname)")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("comments")
        .select(
          "id, body, board_post_id, image_post_id, guest_nickname, created_at, profiles(nickname)",
        )
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("prompt_comments")
        .select("id, prompt_id, body, guest_nickname, created_at")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("prompt_requests")
        .select("id, title, body, guest_nickname, created_at, profiles(nickname)")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("prompt_request_answers")
        .select(
          "id, prompt_request_id, prompt_body, guest_nickname, created_at, profiles(nickname)",
        )
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("content_reports")
        .select(
          "id, reporter_id, visitor_key, target_type, target_id, target_title, target_path, reason, status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const nextItems: ModerationItem[] = [];

    if (!imageResult.error) {
      imageResult.data?.forEach((post) => {
        nextItems.push({
          id: post.id,
          table: "image_posts",
          type: "image",
          label: "이미지",
          title: post.title,
          body: post.description || "",
          author: getAuthorName(post),
          href: `/images/${post.id}`,
          createdAt: post.created_at,
        });
      });
    }

    if (!boardResult.error) {
      boardResult.data?.forEach((post) => {
        nextItems.push({
          id: post.id,
          table: "board_posts",
          type: "board",
          label: "게시글",
          title: post.title,
          body: post.body || "",
          author: getAuthorName(post),
          href: `/boards/${post.id}`,
          createdAt: post.created_at,
        });
      });
    }

    if (!commentResult.error) {
      commentResult.data?.forEach((comment) => {
        nextItems.push({
          id: comment.id,
          table: "comments",
          type: "comment",
          label: "댓글",
          title: comment.board_post_id ? "게시판 댓글" : "이미지 댓글",
          body: comment.body || "",
          author: getAuthorName(comment),
          href: comment.board_post_id
            ? `/boards/${comment.board_post_id}`
            : `/images/${comment.image_post_id}`,
          createdAt: comment.created_at,
        });
      });
    }

    if (!promptCommentResult.error) {
      promptCommentResult.data?.forEach((comment) => {
        nextItems.push({
          id: comment.id,
          table: "prompt_comments",
          type: "comment",
          label: "프롬프트 댓글",
          title: `예시 프롬프트 ${comment.prompt_id}`,
          body: comment.body || "",
          author: comment.guest_nickname || "회원",
          href: `/prompts/${comment.prompt_id}`,
          createdAt: comment.created_at,
        });
      });
    }

    if (!requestResult.error) {
      requestResult.data?.forEach((request) => {
        nextItems.push({
          id: request.id,
          table: "prompt_requests",
          type: "request",
          label: "요청글",
          title: request.title,
          body: request.body || "",
          author: getAuthorName(request),
          href: `/requests/${request.id}`,
          createdAt: request.created_at,
        });
      });
    }

    if (!answerResult.error) {
      answerResult.data?.forEach((answer) => {
        nextItems.push({
          id: answer.id,
          table: "prompt_request_answers",
          type: "request",
          label: "요청 답변",
          title: "프롬프트 답변",
          body: answer.prompt_body || "",
          author: getAuthorName(answer),
          href: `/requests/${answer.prompt_request_id}`,
          createdAt: answer.created_at,
        });
      });
    }

    if (!reportResult.error) {
      ((reportResult.data ?? []) as ContentReportRow[]).forEach((report) => {
        const targetLabel = reportTargetLabels[report.target_type] || "대상";
        const statusLabel = reportStatusLabels[report.status] || report.status;

        nextItems.push({
          id: report.id,
          type: "report",
          label: "신고",
          title: `${targetLabel} 신고 - ${report.target_title || report.target_id}`,
          body: `[${statusLabel}] ${report.reason}`,
          author: report.reporter_id ? "회원" : "비회원",
          href: report.target_path || "/admin",
          createdAt: report.created_at,
          reportId: report.id,
          reportStatus: report.status,
          targetId: report.target_id,
          targetTable: reportTargetTables[report.target_type],
          targetType: report.target_type,
        });
      });
    }

    const errors = [
      imageResult.error,
      boardResult.error,
      commentResult.error,
      promptCommentResult.error,
      requestResult.error,
      answerResult.error,
      reportResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      setMessage("일부 항목을 불러오지 못했습니다. 009 또는 010 SQL 실행 여부를 확인하세요.");
    }

    setItems(
      nextItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    if (!supabase) {
      setIsCheckingRole(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;

      const userId = data.session?.user.id;

      if (!userId) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) return;

      setIsAdmin(profile?.role === "admin");
      setIsCheckingRole(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id;

      if (!userId) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        setItems([]);
        return;
      }

      supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle()
        .then(({ data }) => {
          setIsAdmin(data?.role === "admin");
          setIsCheckingRole(false);
        });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (isAdmin) loadItems();
  }, [isAdmin]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter;
      const matchesQuery = [item.label, item.title, item.body, item.author, item.reportStatus, item.targetType]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, items, query]);

  const hideItem = async (item: ModerationItem) => {
    if (!supabase) return;

    const table = item.table ?? item.targetTable;
    const targetId = item.table ? item.id : item.targetId;

    if (!table || !targetId) {
      setMessage("숨김 처리할 대상을 찾을 수 없습니다.");
      return;
    }

    const busyKey = item.reportId || item.id;

    setBusyId(busyKey);
    setMessage("");

    const { error } = await supabase.from(table).update({ is_hidden: true }).eq("id", targetId);

    if (!error && item.reportId) {
      await supabase
        .from("content_reports")
        .update({ status: "actioned", updated_at: new Date().toISOString() })
        .eq("id", item.reportId);
    }

    if (error) {
      setBusyId("");
      setMessage(error.message.includes("policy") ? "관리자 권한 또는 009 SQL 실행이 필요합니다." : error.message);
      return;
    }

    setBusyId("");
    setItems((current) =>
      current.filter((entry) => {
        if (item.reportId && entry.id === item.reportId) return false;

        const entryTable = entry.table ?? entry.targetTable;
        const entryTargetId = entry.table ? entry.id : entry.targetId;

        return !(entryTable === table && entryTargetId === targetId);
      }),
    );
    setMessage(item.reportId ? "신고 대상을 숨김 처리했습니다." : "숨김 처리했습니다.");
  };

  const updateReportStatus = async (
    item: ModerationItem,
    nextStatus: "reviewed" | "dismissed" | "actioned",
  ) => {
    if (!supabase || !item.reportId) return;

    setBusyId(item.reportId);
    setMessage("");

    const { error } = await supabase
      .from("content_reports")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", item.reportId);

    setBusyId("");

    if (error) {
      setMessage(error.message.includes("policy") ? "관리자 권한 또는 010 SQL 실행이 필요합니다." : error.message);
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.reportId === item.reportId
          ? {
              ...entry,
              body: `[${reportStatusLabels[nextStatus]}] ${entry.body.replace(/^\[[^\]]+\]\s*/, "")}`,
              reportStatus: nextStatus,
            }
          : entry,
      ),
    );
    setMessage(`신고를 ${reportStatusLabels[nextStatus]} 상태로 바꿨습니다.`);
  };

  const tabs: Array<{ label: string; value: AdminFilter }> = [
    { label: "전체", value: "all" },
    { label: "신고", value: "report" },
    { label: "이미지", value: "image" },
    { label: "게시글", value: "board" },
    { label: "댓글", value: "comment" },
    { label: "요청", value: "request" },
  ];

  return (
    <main className="site-shell dc-shell">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <img className="brand-logo" src="/logo.png" alt="" />
          </span>
          <span>
            <strong>프롬프트랩</strong>
            <small>관리자</small>
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

      <section className="dc-headline admin-headline">
        <div>
          <h1>관리자 페이지</h1>
          <p>신고된 항목을 확인하고 문제 있는 글, 댓글, 이미지, 요청글을 숨김 처리합니다.</p>
        </div>
        <button className="primary-button dc-write-button" type="button" onClick={loadItems}>
          <RefreshCw size={15} aria-hidden="true" />
          새로고침
        </button>
      </section>

      <section className="admin-page">
        {!configured && (
          <p className="dc-empty-message">Supabase 환경변수 설정이 필요합니다.</p>
        )}

        {configured && isCheckingRole && (
          <p className="dc-empty-message">관리자 권한을 확인하는 중입니다.</p>
        )}

        {configured && !isCheckingRole && !isAdmin && (
          <div className="admin-locked">
            <ShieldCheck size={28} aria-hidden="true" />
            <h2>관리자 권한이 필요합니다</h2>
            <p>로그인 후 프로필 role이 admin인 계정만 접근할 수 있습니다.</p>
          </div>
        )}

        {configured && isAdmin && (
          <>
            <div className="admin-toolbar">
              <div className="admin-tabs" aria-label="관리 항목 필터">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={filter === tab.value ? "active" : ""}
                    onClick={() => setFilter(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <label className="dc-search admin-search">
                <Search size={16} aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="제목, 내용, 작성자 검색"
                  aria-label="관리 항목 검색"
                />
              </label>
            </div>

            {message && <p className="dc-status-message">{message}</p>}

            <div className="admin-list-head">
              <span>종류</span>
              <span>내용</span>
              <span>작성자/신고자</span>
              <span>날짜</span>
              <span>처리</span>
            </div>

            <div className="admin-list">
              {isLoading && <p className="dc-empty-message">불러오는 중입니다.</p>}
              {!isLoading && filteredItems.length === 0 && (
                <p className="dc-empty-message">표시할 항목이 없습니다.</p>
              )}
              {filteredItems.map((item) => (
                <article key={`${item.type}-${item.id}`} className="admin-row">
                  <span className="board-label">{item.label}</span>
                  <div className="admin-row-body">
                    <Link href={item.href}>{item.title}</Link>
                    <p>{item.body}</p>
                  </div>
                  <small>@{item.author}</small>
                  <small>{formatDate(item.createdAt)}</small>
                  <div className="admin-row-actions">
                    {item.reportId ? (
                      <>
                        <button
                          type="button"
                          onClick={() => hideItem(item)}
                          disabled={busyId === item.reportId}
                        >
                          <EyeOff size={13} aria-hidden="true" />
                          숨김
                        </button>
                        <button
                          type="button"
                          onClick={() => updateReportStatus(item, "reviewed")}
                          disabled={busyId === item.reportId}
                        >
                          <CheckCircle2 size={13} aria-hidden="true" />
                          확인
                        </button>
                        <button
                          type="button"
                          onClick={() => updateReportStatus(item, "dismissed")}
                          disabled={busyId === item.reportId}
                        >
                          <XCircle size={13} aria-hidden="true" />
                          기각
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => hideItem(item)}
                        disabled={busyId === item.id}
                      >
                        <EyeOff size={13} aria-hidden="true" />
                        숨김
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
