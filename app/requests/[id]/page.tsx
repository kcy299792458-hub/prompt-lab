"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, MessageCircle, Send, UserRound } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { ReportButton } from "@/app/components/ReportButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PromptRequestRow = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  title: string;
  body: string;
  target_model: string;
  request_type: string;
  reference_image_urls: string[] | null;
  status: "open" | "resolved";
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

type PromptRequestAnswerRow = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  prompt_body: string;
  negative_prompt: string;
  model: string;
  settings: string;
  explanation: string;
  is_accepted: boolean;
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

function getProfileNickname(profile: PromptRequestRow["profiles"]) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

function getAuthorName(item: {
  guest_nickname: string | null;
  profiles?: { nickname: string } | { nickname: string }[] | null;
}) {
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

function makeSafeNickname(session: Session) {
  const baseName = session.user.user_metadata.nickname || session.user.email?.split("@")[0] || "user";
  const safeBase = baseName.replace(/[^a-zA-Z0-9가-힣_]/g, "").slice(0, 17) || "user";
  return `${safeBase}_${session.user.id.slice(0, 6)}`.slice(0, 24);
}

export default function PromptRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [request, setRequest] = useState<PromptRequestRow | null>(null);
  const [answers, setAnswers] = useState<PromptRequestAnswerRow[]>([]);
  const [message, setMessage] = useState("");
  const [answerMessage, setAnswerMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusPassword, setStatusPassword] = useState("");
  const [answerForm, setAnswerForm] = useState({
    guestNickname: "",
    password: "",
    promptBody: "",
  });

  const loadRequest = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [requestResult, answerResult] = await Promise.all([
      supabase
        .from("prompt_requests")
        .select(
          "id, author_id, guest_nickname, title, body, target_model, request_type, reference_image_urls, status, created_at, profiles(nickname)",
        )
        .eq("id", params.id)
        .eq("is_hidden", false)
        .maybeSingle(),
      supabase
        .from("prompt_request_answers")
        .select(
          "id, author_id, guest_nickname, prompt_body, negative_prompt, model, settings, explanation, is_accepted, created_at, profiles(nickname)",
        )
        .eq("prompt_request_id", params.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true }),
    ]);

    if (requestResult.error) {
      setMessage("프롬프트 요청 게시판을 사용하려면 007 SQL 실행이 필요합니다.");
      setRequest(null);
      setAnswers([]);
      setIsLoading(false);
      return;
    }

    setRequest((requestResult.data as PromptRequestRow | null) ?? null);
    setAnswers((answerResult.data ?? []) as PromptRequestAnswerRow[]);
    setMessage("");
    setIsLoading(false);
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    loadRequest();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [params.id, supabase]);

  const isOwner = Boolean(session && request?.author_id && session.user.id === request.author_id);

  const copyPrompt = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  };

  const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !request) {
      setAnswerMessage("답변을 등록할 수 없습니다.");
      return;
    }

    if (!answerForm.promptBody.trim()) {
      setAnswerMessage("프롬프트 답변을 입력하세요.");
      return;
    }

    if (!session && answerForm.guestNickname.trim().length < 2) {
      setAnswerMessage("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    if (!session && answerForm.password.length < 4) {
      setAnswerMessage("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setAnswerMessage("");

    try {
      if (session) {
        const nickname = makeSafeNickname(session);
        await supabase.from("profiles").upsert(
          {
            id: session.user.id,
            nickname,
          },
          { onConflict: "id" },
        );

        const { error } = await supabase.from("prompt_request_answers").insert({
          prompt_request_id: request.id,
          author_id: session.user.id,
          prompt_body: answerForm.promptBody.trim(),
          negative_prompt: "",
          model: "GPT Image 2.0",
          settings: "",
          explanation: "",
        });

        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.rpc("create_guest_prompt_request_answer", {
          p_prompt_request_id: request.id,
          p_prompt_body: answerForm.promptBody.trim(),
          p_guest_nickname: answerForm.guestNickname.trim(),
          p_password: answerForm.password,
          p_negative_prompt: "",
          p_model: "GPT Image 2.0",
          p_settings: "",
          p_explanation: "",
        });

        if (error) throw new Error(error.message);
      }

      setAnswerForm({
        guestNickname: "",
        password: "",
        promptBody: "",
      });
      await loadRequest();
    } catch (error) {
      setAnswerMessage(error instanceof Error ? error.message : "답변을 등록할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (nextStatus: "open" | "resolved") => {
    if (!supabase || !request) return;

    try {
      if (isOwner) {
        const { error } = await supabase
          .from("prompt_requests")
          .update({ status: nextStatus, updated_at: new Date().toISOString() })
          .eq("id", request.id);

        if (error) throw new Error(error.message);
      } else {
        if (statusPassword.length < 4) {
          setMessage("비밀번호는 4자 이상이어야 합니다.");
          return;
        }

        const { error } = await supabase.rpc("update_guest_prompt_request_status", {
          p_prompt_request_id: request.id,
          p_password: statusPassword,
          p_status: nextStatus,
        });

        if (error) throw new Error(error.message);
      }

      setStatusPassword("");
      await loadRequest();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "상태를 바꿀 수 없습니다.");
    }
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
            <small>요청 상세</small>
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

      <nav className="community-board-tabs" aria-label="게시판 종류">
        <Link href="/boards">일반 게시판</Link>
        <Link className="active" href="/requests">
          프롬프트 요청
        </Link>
      </nav>

      <section className="board-detail-page dc-board-detail-page">
        <Link href="/requests" className="back-link dc-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          요청 목록
        </Link>

        {isLoading && <p className="dc-empty-message">불러오는 중입니다.</p>}
        {message && <p className="dc-status-message">{message}</p>}
        {!isLoading && !request && !message && (
          <p className="dc-empty-message">요청 글을 찾을 수 없습니다.</p>
        )}

        {request && (
          <div className="dc-board-detail-layout request-detail-layout">
            <article className="board-detail-article dc-board-article">
              <div className="dc-article-head request-article-head">
                <span className={`request-status ${request.status}`}>
                  {request.status === "resolved" ? "해결됨" : "미해결"}
                </span>
                <h1>{request.title}</h1>
              </div>
              <div className="board-post-meta dc-article-meta">
                <span>
                  <UserRound size={14} aria-hidden="true" /> @{getAuthorName(request)}
                </span>
                <span>{formatDate(request.created_at)}</span>
                <span>{request.request_type}</span>
                <span>{request.target_model || "모델 미정"}</span>
                <span>
                  <MessageCircle size={14} aria-hidden="true" /> {answers.length}
                </span>
              </div>

              {(request.reference_image_urls?.length ?? 0) > 0 && (
                <div className="dc-board-image-grid request-reference-grid">
                  {request.reference_image_urls?.map((imageUrl, index) => (
                    <img key={imageUrl} src={imageUrl} alt={`참고 이미지 ${index + 1}`} />
                  ))}
                </div>
              )}

              <p className="dc-board-post-body">{request.body}</p>

              <div className="request-status-tools">
                {!isOwner && !request.author_id && (
                  <input
                    value={statusPassword}
                    onChange={(event) => setStatusPassword(event.target.value)}
                    placeholder="요청글 비밀번호"
                    type="password"
                    aria-label="요청글 비밀번호"
                  />
                )}
                <button type="button" onClick={() => updateStatus("resolved")}>
                  <CheckCircle2 size={14} aria-hidden="true" />
                  해결됨
                </button>
                <button type="button" onClick={() => updateStatus("open")}>
                  미해결
                </button>
                <ReportButton
                  targetType="prompt_request"
                  targetId={request.id}
                  targetTitle={request.title}
                  targetPath={`/requests/${request.id}`}
                  compact
                />
              </div>
            </article>

            <aside className="dc-rank-box dc-board-best request-guide-box">
              <div className="dc-rank-head">
                <strong>답변 방식</strong>
                <span>프롬프트</span>
              </div>
              <ol>
                <li>
                  <span className="dc-rank-num">1</span>
                  <span>실제 프롬프트 원문</span>
                  <small>필수</small>
                </li>
                <li>
                  <span className="dc-rank-num">2</span>
                  <span>GPT Image 2.0 기준</span>
                  <small>고정</small>
                </li>
              </ol>
            </aside>
          </div>
        )}

        {request && (
          <section className="prompt-detail-section dc-comment-section request-answer-section">
            <div className="section-heading">
              <h2>프롬프트 답변</h2>
              <span>{answers.length}개</span>
            </div>

            <form className="request-answer-form" onSubmit={submitAnswer}>
              {!session && (
                <div className="dc-write-grid">
                  <input
                    value={answerForm.guestNickname}
                    onChange={(event) =>
                      setAnswerForm({ ...answerForm, guestNickname: event.target.value })
                    }
                    placeholder="닉네임"
                    aria-label="닉네임"
                  />
                  <input
                    value={answerForm.password}
                    onChange={(event) =>
                      setAnswerForm({ ...answerForm, password: event.target.value })
                    }
                    placeholder="수정/삭제 비밀번호"
                    type="password"
                    aria-label="수정/삭제 비밀번호"
                  />
                </div>
              )}
              <textarea
                value={answerForm.promptBody}
                onChange={(event) =>
                  setAnswerForm({ ...answerForm, promptBody: event.target.value })
                }
                placeholder="프롬프트 원문"
                aria-label="프롬프트 원문"
              />
              <button className="primary-button dc-write-submit" type="submit" disabled={isSubmitting}>
                <Send size={15} aria-hidden="true" />
                {isSubmitting ? "등록 중" : "답변 등록"}
              </button>
            </form>

            {answerMessage && <p className="dc-status-message">{answerMessage}</p>}

            <div className="prompt-versions request-answer-list">
              {answers.length > 0 ? (
                answers.map((answer, index) => (
                  <section className="prompt-version" key={answer.id}>
                    <div className="prompt-version-header">
                      <div>
                        <strong>
                          답변 {index + 1} · @{getAuthorName(answer)}
                        </strong>
                        <span>{formatDate(answer.created_at)}</span>
                      </div>
                      <div className="prompt-version-actions">
                        <ReportButton
                          targetType="prompt_request_answer"
                          targetId={answer.id}
                          targetTitle={`요청 답변 - ${request.title}`}
                          targetPath={`/requests/${request.id}`}
                          compact
                        />
                        <button
                          type="button"
                          onClick={() => copyPrompt(answer.prompt_body, answer.id)}
                        >
                          <Copy size={16} aria-hidden="true" />
                          {copiedKey === answer.id ? "복사됨" : "복사"}
                        </button>
                      </div>
                    </div>
                    <div className="prompt-body">{answer.prompt_body}</div>
                    {(answer.model || answer.settings || answer.negative_prompt || answer.explanation) && (
                      <div className="request-answer-meta">
                        {answer.model && <span>모델: {answer.model}</span>}
                        {answer.settings && <span>설정: {answer.settings}</span>}
                        {answer.negative_prompt && <p>네거티브: {answer.negative_prompt}</p>}
                        {answer.explanation && <p>{answer.explanation}</p>}
                      </div>
                    )}
                  </section>
                ))
              ) : (
                <p className="dc-empty-message">아직 답변이 없습니다.</p>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
