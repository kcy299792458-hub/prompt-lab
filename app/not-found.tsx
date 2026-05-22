import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-panel">
        <p className="section-kicker">404</p>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>주소가 바뀌었거나 아직 만들어지지 않은 페이지입니다.</p>
        <Link href="/" className="primary-button">
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
