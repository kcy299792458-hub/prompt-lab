"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("이메일 인증을 확인하는 중입니다.");

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase 환경변수가 필요합니다.");
      return;
    }

    let isMounted = true;
    const client = supabase;

    async function finishAuth() {
      const code = searchParams.get("code");

      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);

        if (!isMounted) return;

        if (error) {
          setMessage("인증 링크가 만료되었거나 이미 사용되었습니다. 로그인 창에서 인증 메일을 다시 보내세요.");
          return;
        }
      } else {
        await client.auth.getSession();
      }

      if (!isMounted) return;

      setMessage("인증이 완료되었습니다. 잠시 후 이동합니다.");
      window.setTimeout(() => router.replace("/upload"), 800);
    }

    finishAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, supabase]);

  return (
    <main className="site-shell dc-shell auth-callback-shell">
      <section className="not-found-panel auth-callback-panel">
        <p className="section-kicker">Account</p>
        <h1>회원가입 인증</h1>
        <p>{message}</p>
        <div className="auth-callback-actions">
          <Link className="primary-button" href="/upload">
            업로드로 이동
          </Link>
          <Link className="secondary-button" href="/">
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="site-shell dc-shell auth-callback-shell">
          <section className="not-found-panel auth-callback-panel">
            <p className="section-kicker">Account</p>
            <h1>회원가입 인증</h1>
            <p>이메일 인증을 확인하는 중입니다.</p>
          </section>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
