"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut, ShieldCheck, UserRound, X } from "lucide-react";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export function AuthControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const submit = async () => {
    if (!supabase) {
      setMessage("Supabase 환경변수가 아직 설정되지 않았습니다.");
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedEmail || !password) {
      setMessage("이메일과 비밀번호를 입력하세요.");
      return;
    }

    if (mode === "sign-up" && password.length < 6) {
      setMessage("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (mode === "sign-up" && password !== passwordConfirm) {
      setMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setPendingEmail("");

    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          })
        : await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              emailRedirectTo,
              data: {
                nickname: trimmedNickname || trimmedEmail.split("@")[0],
              },
            },
          });

    setIsLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setPendingEmail(trimmedEmail);
      setMessage("가입 확인 메일을 보냈습니다. 메일 인증 후 로그인하세요.");
      return;
    }

    setMessage(mode === "sign-in" ? "로그인했습니다." : "가입했습니다.");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setNickname("");
    setIsOpen(false);
  };

  const resendConfirmation = async () => {
    if (!supabase || !pendingEmail) return;

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("인증 메일을 다시 보냈습니다. 스팸함도 확인하세요.");
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  const displayName =
    session?.user.user_metadata.nickname ||
    session?.user.email?.split("@")[0] ||
    "user";

  return (
    <>
      {session ? (
        <div className="auth-user">
          <button className="auth-profile" type="button">
            <UserRound size={16} aria-hidden="true" />
            @{displayName}
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
                <p className="section-kicker">Account</p>
                <h2>{mode === "sign-in" ? "로그인" : "회원가입"}</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="닫기">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {!configured ? (
              <div className="guest-note">
                <strong>
                  <ShieldCheck size={16} aria-hidden="true" />
                  Supabase 설정 필요
                </strong>
                <p>
                  Supabase 프로젝트를 만든 뒤 `NEXT_PUBLIC_SUPABASE_URL`과
                  `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 Vercel 환경변수에 넣으면 정식 로그인이
                  활성화됩니다.
                </p>
              </div>
            ) : (
              <>
                <div className="auth-mode-tabs" aria-label="로그인 방식">
                  <button
                    type="button"
                    className={mode === "sign-in" ? "active" : ""}
                    onClick={() => {
                      setMode("sign-in");
                      setMessage("");
                      setPendingEmail("");
                    }}
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    className={mode === "sign-up" ? "active" : ""}
                    onClick={() => {
                      setMode("sign-up");
                      setMessage("");
                      setPendingEmail("");
                    }}
                  >
                    회원가입
                  </button>
                </div>

                <div className="auth-form">
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="이메일"
                    type="email"
                    autoComplete="email"
                  />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="비밀번호"
                    type="password"
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  />
                  {mode === "sign-up" && (
                    <>
                      <input
                        value={passwordConfirm}
                        onChange={(event) => setPasswordConfirm(event.target.value)}
                        placeholder="비밀번호 확인"
                        type="password"
                        autoComplete="new-password"
                      />
                      <input
                        value={nickname}
                        onChange={(event) => setNickname(event.target.value)}
                        placeholder="닉네임"
                        autoComplete="nickname"
                      />
                    </>
                  )}
                  <button
                    type="button"
                    className="primary-button"
                    onClick={submit}
                    disabled={isLoading}
                  >
                    {isLoading ? "처리 중" : mode === "sign-in" ? "로그인" : "가입하기"}
                  </button>
                </div>

                {message && <p className="auth-message">{message}</p>}
                {pendingEmail && mode === "sign-up" && (
                  <button
                    type="button"
                    className="secondary-button auth-resend-button"
                    onClick={resendConfirmation}
                    disabled={isLoading}
                  >
                    인증 메일 다시 보내기
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
