"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, PencilLine, Search } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type RequestStatus = "all" | "open" | "resolved";

type PromptRequestRow = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  title: string;
  body: string;
  target_model: string;
  request_type: string;
  status: "open" | "resolved";
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

function getProfileNickname(profile: PromptRequestRow["profiles"]) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

function getAuthorName(request: PromptRequestRow) {
  return request.guest_nickname || getProfileNickname(request.profiles);
}

function getStatusLabel(status: PromptRequestRow["status"]) {
  return status === "resolved" ? "해결됨" : "미해결";
}

export default function PromptRequestsPage() {
  const [requests, setRequests] = useState<PromptRequestRow[]>([]);
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RequestStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const client = supabase;

    async function loadRequests() {
      setIsLoading(true);

      const [requestResult, answerResult] = await Promise.all([
        client
          .from("prompt_requests")
          .select(
            "id, author_id, guest_nickname, title, body, target_model, request_type, status, created_at, profiles(nickname)",
          )
          .eq("is_hidden", false)
          .order("created_at", { ascending: false }),
        client.from("prompt_request_answers").select("prompt_request_id").eq("is_hidden", false),
      ]);

      if (!isMounted) return;

      if (requestResult.error) {
        setMessage("프롬프트 요청 게시판을 사용하려면 007 SQL 실행이 필요합니다.");
        setRequests([]);
        setIsLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      (answerResult.data ?? []).forEach((answer) => {
        const requestId = answer.prompt_request_id as string | null;
        if (!requestId) return;
        counts[requestId] = (counts[requestId] ?? 0) + 1;
      });

      setAnswerCounts(counts);
      setRequests((requestResult.data ?? []) as PromptRequestRow[]);
      setMessage("");
      setIsLoading(false);
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = status === "all" || request.status === status;
      const searchableText = [
        request.title,
        request.body,
        request.target_model,
        request.request_type,
        getAuthorName(request),
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(normalizedQuery);
    });
  }, [query, requests, status]);

  const statusTabs: Array<{ label: string; value: RequestStatus }> = [
    { label: "전체", value: "all" },
    { label: "미해결", value: "open" },
    { label: "해결됨", value: "resolved" },
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
            <small>요청 게시판</small>
          </span>
        </Link>
        <nav className="topnav dc-topnav" aria-label="주요 메뉴">
          <Link href="/">이미지</Link>
          <Link href="/boards">게시판</Link>
          <Link href="/requests">요청</Link>
          <Link href="/saved">저장함</Link>
          <Link href="/upload">업로드</Link>
          <AuthControls />
        </nav>
      </header>

      <section className="dc-headline dc-board-headline">
        <div>
          <h1>프롬프트 요청 게시판</h1>
          <p>원하는 이미지 방향을 올리고, 다른 사람이 프롬프트 답변을 남기는 공간</p>
        </div>
        <label className="dc-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="요청, 모델, 스타일 검색"
            aria-label="요청 검색"
          />
        </label>
      </section>

      <section className="board-page dc-board-page">
        <div className="dc-board-page-layout request-page-layout">
          <aside className="filter-panel dc-side">
            <div className="dc-side-title">상태</div>
            <div className="category-list dc-category-list" aria-label="요청 상태">
              {statusTabs.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={item.value === status ? "active" : ""}
                  onClick={() => setStatus(item.value)}
                >
                  <span>{item.label}</span>
                  <small>
                    {item.value === "all"
                      ? requests.length
                      : requests.filter((request) => request.status === item.value).length}
                  </small>
                </button>
              ))}
            </div>
            <Link className="dc-write-link" href="/requests/new">
              요청 글쓰기
            </Link>
          </aside>

          <section className="dc-board-main">
            <div className="gallery-toolbar dc-board-toolbar">
              <div>
                <p className="section-kicker">Prompt Request</p>
                <h2>{filteredRequests.length}개의 요청</h2>
              </div>
              <Link href="/requests/new" className="primary-button dc-write-button">
                <PencilLine size={15} aria-hidden="true" />
                요청하기
              </Link>
            </div>

            {message && <p className="dc-status-message">{message}</p>}

            <div className="dc-post-list-head request-list-head">
              <span>상태</span>
              <span>제목</span>
              <span>작성자</span>
              <span>답변</span>
            </div>

            <div className="dc-post-list">
              {!configured && <p className="dc-empty-message">Supabase 환경변수 설정이 필요합니다.</p>}
              {configured && isLoading && <p className="dc-empty-message">불러오는 중입니다.</p>}
              {configured && !isLoading && !message && filteredRequests.length === 0 && (
                <p className="dc-empty-message">아직 요청 글이 없습니다.</p>
              )}
              {filteredRequests.map((request) => (
                <Link
                  key={request.id}
                  className="board-row dc-post-row request-row"
                  href={`/requests/${request.id}`}
                >
                  <span className={`request-status ${request.status}`}>
                    {getStatusLabel(request.status)}
                  </span>
                  <div className="dc-post-title">
                    <h3>{request.title}</h3>
                    <p>
                      {request.request_type} · {request.target_model || "모델 미정"} · {request.body}
                    </p>
                  </div>
                  <small>@{getAuthorName(request)}</small>
                  <span>
                    <MessageCircle size={13} aria-hidden="true" /> {answerCounts[request.id] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
