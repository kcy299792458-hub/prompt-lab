import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
  description: "프롬프트랩 서비스 이용 기준과 사용자 책임 안내.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
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
        <p className="section-kicker">Terms</p>
        <h1>이용약관</h1>
        <p className="legal-date">시행일: 2026년 5월 28일</p>

        <h2>1. 서비스 목적</h2>
        <p>
          프롬프트랩은 AI 이미지 생성 결과와 실제 프롬프트, 제작 노트, 댓글을 공유하는
          커뮤니티 서비스입니다. 사용자는 이미지를 올리거나, 프롬프트를 저장하거나, 게시판에
          글과 댓글을 작성할 수 있습니다.
        </p>

        <h2>2. 계정과 비회원 이용</h2>
        <p>
          일부 기능은 로그인 없이 사용할 수 있습니다. 비회원이 글이나 댓글을 작성할 때 입력한
          닉네임과 비밀번호는 작성물 수정, 삭제, 남용 방지를 위해 사용됩니다. 로그인 사용자는
          본인 계정 관리 책임을 집니다.
        </p>

        <h2>3. 게시물 책임</h2>
        <p>
          사용자가 올린 이미지, 프롬프트, 글, 댓글에 대한 책임은 작성자에게 있습니다. 타인의
          권리 침해, 불법 정보, 악성 코드, 스팸, 혐오와 괴롭힘 목적의 게시물은 제한될 수
          있습니다.
        </p>

        <h2>4. 프롬프트와 이미지 활용</h2>
        <p>
          공개 게시물은 다른 사용자가 열람, 저장, 복사, 참고할 수 있습니다. 작성자는 업로드 전
          공개해도 되는 프롬프트와 이미지만 게시해야 합니다. 외부 서비스나 모델의 이용약관이
          적용되는 경우 해당 기준도 함께 확인해야 합니다.
        </p>

        <h2>5. 운영 조치</h2>
        <p>
          운영자는 신고, 자동 제한, 관리자 검토를 통해 게시물 숨김, 삭제, 계정 제한, 비회원
          작성 제한 등의 조치를 할 수 있습니다. 반복적인 스팸이나 서비스 방해 행위는 사전
          안내 없이 제한될 수 있습니다.
        </p>

        <h2>6. 서비스 변경</h2>
        <p>
          서비스 기능, 화면, 정책은 운영 상황에 따라 변경될 수 있습니다. 중요한 변경이 있을
          경우 사이트 내 공지나 관련 화면을 통해 안내합니다.
        </p>
      </section>
    </main>
  );
}
