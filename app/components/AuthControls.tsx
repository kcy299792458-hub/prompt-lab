"use client";

import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

export function AuthControls() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        로그인
      </button>

      {isOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="로그인 안내">
          <section className="auth-modal">
            <div className="auth-modal-header">
              <div>
                <p className="section-kicker">Account</p>
                <h2>로그인 준비 중</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="닫기">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <p className="auth-help">
              현재 공개된 프롬포트랩은 데모 버전입니다. 이전 임시 로그인은 실제 계정 보안이
              아니어서 제거했고, 다음 단계에서 Supabase Auth로 정식 로그인과 회원 기능을
              연결할 예정입니다.
            </p>

            <div className="guest-note">
              <strong>
                <ShieldCheck size={16} aria-hidden="true" />
                정식 로그인에서 지원할 기능
              </strong>
              <p>
                이메일 로그인, 닉네임 프로필, 본인 글 수정/삭제, 댓글 작성, 이미지 업로드,
                좋아요와 저장, 신고 기능을 서버 보안 정책과 함께 연결합니다.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
