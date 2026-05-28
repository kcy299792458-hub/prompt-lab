import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "프롬프트랩에서 처리하는 개인정보와 보관 목적 안내.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="site-shell dc-shell legal-page">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <img className="brand-logo" src="/logo.png" alt="" />
          </span>
          <span>
            <strong>프롬프트랩</strong>
            <small>AI 이미지 갤러리</small>
          </span>
        </Link>
        <nav className="topnav dc-topnav" aria-label="주요 메뉴">
          <Link href="/">이미지</Link>
          <Link href="/boards">게시판</Link>
          <Link href="/upload">업로드</Link>
        </nav>
      </header>

      <section className="legal-document">
        <p className="section-kicker">Privacy</p>
        <h1>개인정보처리방침</h1>
        <p className="legal-date">시행일: 2026년 5월 28일</p>

        <h2>1. 처리하는 정보</h2>
        <p>
          프롬프트랩은 회원가입과 로그인 과정에서 이메일, 닉네임, 사용자 식별값을 처리합니다.
          비회원 글쓰기에서는 닉네임, 비밀번호 해시, 브라우저별 방문자 식별값을 처리할 수
          있습니다. 업로드한 이미지, 프롬프트, 글, 댓글, 신고 내용도 서비스 운영을 위해
          저장됩니다.
        </p>

        <h2>2. 이용 목적</h2>
        <p>
          수집한 정보는 로그인, 작성자 표시, 글 수정과 삭제, 저장과 좋아요 기능, 신고 처리,
          스팸 방지, 서비스 보안, 커뮤니티 운영을 위해 사용됩니다.
        </p>

        <h2>3. 보관 기간</h2>
        <p>
          회원 정보는 탈퇴 또는 삭제 요청 시까지 보관됩니다. 게시물과 댓글은 사용자가 삭제하거나
          운영상 삭제될 때까지 보관될 수 있습니다. 신고와 스팸 방지 기록은 남용 방지와 운영
          기록 확인을 위해 필요한 기간 동안 보관될 수 있습니다.
        </p>

        <h2>4. 외부 서비스</h2>
        <p>
          프롬프트랩은 Supabase를 이용해 인증, 데이터베이스, 이미지 저장 기능을 운영하고,
          Vercel을 이용해 웹사이트를 배포합니다. 사용자가 외부 링크를 등록하거나 클릭하는 경우
          해당 외부 서비스의 정책이 적용될 수 있습니다.
        </p>

        <h2>5. 사용자 권리</h2>
        <p>
          사용자는 본인이 작성한 게시물의 수정, 삭제를 요청하거나 계정 정보 변경을 요청할 수
          있습니다. 비회원 작성물은 작성 당시 설정한 비밀번호로 수정하거나 삭제할 수 있습니다.
        </p>

        <h2>6. 문의</h2>
        <p>
          개인정보 관련 문의, 게시물 삭제 요청, 계정 관련 문의는 운영자 이메일
          promptlab.kr@gmail.com 으로 보낼 수 있습니다.
        </p>
      </section>
    </main>
  );
}
