import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="사이트 정보">
      <div className="site-footer-inner">
        <strong>프롬프트랩</strong>
        <nav aria-label="운영 정책">
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/policy">운영정책</Link>
        </nav>
      </div>
    </footer>
  );
}
