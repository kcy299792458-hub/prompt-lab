"use client";

import { useEffect, useState } from "react";
import { LogOut, UserRound, X } from "lucide-react";

type Session = {
  email: string;
  nickname: string;
};

const STORAGE_KEY = "prompt-lab-session";

export function AuthControls() {
  const [session, setSession] = useState<Session | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const savedSession = window.localStorage.getItem(STORAGE_KEY);

    if (savedSession) {
      setSession(JSON.parse(savedSession) as Session);
    }
  }, []);

  const login = () => {
    const nextSession = {
      email: email.trim(),
      nickname: nickname.trim() || email.trim().split("@")[0],
    };

    if (!nextSession.email) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setIsOpen(false);
    setEmail("");
    setNickname("");
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return (
    <>
      {session ? (
        <div className="auth-user">
          <button className="auth-profile" type="button">
            <UserRound size={16} aria-hidden="true" />
            @{session.nickname}
          </button>
          <button className="auth-logout" type="button" onClick={logout} aria-label="로그아웃">
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setIsOpen(true)}>
          로그인
        </button>
      )}

      {isOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="로그인">
          <section className="auth-modal">
            <div className="auth-modal-header">
              <div>
                <p className="section-kicker">Login</p>
                <h2>프롬프트랩 로그인</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="닫기">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="auth-help">
              지금은 프로토타입 로그인입니다. 실제 서비스에서는 Supabase Auth로
              이메일/구글 로그인을 연결합니다.
            </p>
            <div className="auth-form">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일"
                type="email"
              />
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="닉네임"
              />
              <button type="button" className="primary-button" onClick={login}>
                로그인
              </button>
            </div>
            <div className="guest-note">
              <strong>비회원 참여 정책</strong>
              <p>
                글/댓글은 비회원도 닉네임과 비밀번호로 작성할 수 있게 만들고,
                저장/북마크/내 글 관리는 로그인 사용자에게 제공하는 구조를
                권장합니다.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
