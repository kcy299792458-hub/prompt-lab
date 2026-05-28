"use client";

import { FormEvent, useMemo, useState } from "react";
import { Flag, Send, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPromptLabVisitorKey } from "@/lib/visitor-key";

type ReportTargetType =
  | "example_prompt"
  | "image_post"
  | "board_post"
  | "comment"
  | "prompt_comment"
  | "prompt_request"
  | "prompt_request_answer";

type ReportButtonProps = {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  targetPath: string;
  compact?: boolean;
};

export function ReportButton({
  targetType,
  targetId,
  targetTitle,
  targetPath,
  compact = false,
}: ReportButtonProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("신고 기능을 사용하려면 Supabase 설정이 필요합니다.");
      return;
    }

    if (reason.trim().length < 2) {
      setMessage("신고 사유는 2자 이상 입력하세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.rpc("create_content_report", {
      p_target_type: targetType,
      p_target_id: targetId,
      p_target_title: targetTitle,
      p_target_path: targetPath,
      p_reason: reason.trim(),
      p_visitor_key: getPromptLabVisitorKey(),
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(
        error.message.includes("create_content_report")
          ? "신고 기능을 사용하려면 010 SQL 실행이 필요합니다."
          : error.message,
      );
      return;
    }

    setReason("");
    setMessage("신고가 접수됐습니다.");
    window.setTimeout(() => {
      setIsOpen(false);
      setMessage("");
    }, 900);
  };

  return (
    <div className={`report-widget${compact ? " compact" : ""}`}>
      <button
        className="report-trigger"
        type="button"
        onClick={() => {
          setIsOpen((value) => !value);
          setMessage("");
        }}
      >
        <Flag size={compact ? 13 : 15} aria-hidden="true" />
        신고
      </button>

      {isOpen && (
        <form className="report-panel" onSubmit={submitReport}>
          <div className="report-panel-head">
            <strong>신고하기</strong>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="닫기">
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="신고 사유"
            aria-label="신고 사유"
          />
          <button className="report-submit" type="submit" disabled={isSubmitting}>
            <Send size={13} aria-hidden="true" />
            {isSubmitting ? "접수 중" : "접수"}
          </button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
}
