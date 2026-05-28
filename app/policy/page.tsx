import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "운영정책",
  description: "프롬프트랩 게시물, 신고, 제재, AI 이미지 업로드 운영 기준.",
  alternates: {
    canonical: "/policy",
  },
};

export default function PolicyPage() {
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
        <p className="section-kicker">Policy</p>
        <h1>운영정책</h1>
        <p className="legal-date">시행일: 2026년 5월 28일</p>

        <h2>1. 기본 원칙</h2>
        <p>
          프롬프트랩은 AI 이미지 프롬프트를 찾고, 실험 결과를 공유하고, 작성자의 노하우가 쌓이는
          공간을 목표로 합니다. 토론과 잡담은 허용하지만, 서비스 이용을 방해하는 행위는 제한합니다.
        </p>

        <h2>2. 금지 게시물</h2>
        <ul>
          <li>타인을 사칭하거나 개인정보를 노출하는 게시물</li>
          <li>저작권, 초상권, 상표권 등 타인의 권리를 침해할 소지가 큰 게시물</li>
          <li>불법 행위, 악성 코드, 피싱, 사기, 스팸을 유도하는 게시물</li>
          <li>특정 개인이나 집단에 대한 괴롭힘, 혐오, 위협을 목적으로 하는 게시물</li>
          <li>서비스 주제와 무관한 반복 홍보, 도배, 자동 작성 콘텐츠</li>
        </ul>

        <h2>3. AI 이미지 업로드 기준</h2>
        <p>
          이미지는 실제 프롬프트와 함께 올리는 것을 권장합니다. 결과를 재현하기 어렵게 만드는
          허위 정보, 무관한 이미지, 과도한 낚시성 제목은 숨김 처리될 수 있습니다. 모델명이나
          제작 조건을 모르는 경우에는 비워둘 수 있습니다.
        </p>

        <h2>4. 신고와 검토</h2>
        <p>
          사용자는 이미지 글, 게시판 글, 댓글, 요청글을 신고할 수 있습니다. 신고된 항목은
          관리자 화면에서 검토하며, 명백한 위반은 숨김 처리됩니다. 신고가 접수되었다고 해서
          모든 게시물이 즉시 삭제되는 것은 아닙니다.
        </p>

        <h2>5. 제재 기준</h2>
        <p>
          운영자는 위반 정도에 따라 게시물 숨김, 댓글 숨김, 작성 제한, 계정 제한을 적용할 수
          있습니다. 반복적인 도배와 악성 신고는 서비스 방해로 판단할 수 있습니다. 운영 관련
          문의는 promptlab.kr@gmail.com 으로 보낼 수 있습니다.
        </p>

        <h2>6. 작성자 보호</h2>
        <p>
          프롬프트를 올린 작성자의 닉네임, 프로필, 업로드 기록은 작성자 성과로 표시됩니다. 다른
          사용자는 공개된 프롬프트를 참고할 수 있지만, 작성자를 속이거나 원작자를 지우는 방식의
          재게시를 반복하면 제한될 수 있습니다.
        </p>
      </section>
    </main>
  );
}
