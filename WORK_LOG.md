# 프롬포트랩 작업 이어서 보기

마지막 업데이트: 2026-05-23

## 현재 상태

- 로컬 프로젝트 위치: `C:\Users\PC\prompt-lab`
- Git 저장소 초기화 완료
- 기본 브랜치: `main`
- GitHub 업로드 완료
- GitHub 저장소: `https://github.com/kcy299792458-hub/prompt-lab`
- Vercel 배포 완료
- 공개 주소: `https://prompt-lab-drab-xi.vercel.app`
- 실서비스 전환 준비 시작
- 임시 `localStorage` 로그인 제거 완료
- Supabase DB/RLS 설계 파일 추가: `supabase/schema.sql`
- 실서비스 전환 문서 추가: `docs/REAL_SERVICE_PLAN.md`
- `@supabase/supabase-js` 설치 완료
- Supabase 브라우저 클라이언트 추가: `lib/supabase/client.ts`
- 로그인 UI를 Supabase 이메일/비밀번호 로그인 구조로 교체
- 비회원 게시판 글쓰기 UI 추가
- 비회원 댓글 작성 UI 추가
- 비회원 글/댓글 비밀번호 해시 저장용 마이그레이션 추가:
  `supabase/migrations/001_guest_board_posts.sql`

## 지금까지 한 일

- Next.js 기반 프롬포트랩 프로토타입 제작
- 이미지 프롬프트 갤러리 제작
- 게시판 목록/상세 페이지 제작
- DCInside 느낌의 조밀한 커뮤니티형 디자인으로 수정
- 로컬 프로토타입 로그인 UI 추가
- SEO 메타데이터 추가
- `robots.txt`, `sitemap.xml` 추가
- `README.md`, `DEPLOYMENT.md` 추가
- `npm run build` 통과 확인

## 다음에 바로 할 일

1. Supabase 프로젝트를 생성한다.
2. Supabase SQL Editor에서 `supabase/schema.sql`을 실행한다.
3. Supabase URL과 anon key를 `.env.local`에 넣는다.
4. Vercel 환경변수에도 Supabase URL과 anon key를 넣는다.
5. 실제 로그인 테스트를 한다.
6. Supabase SQL Editor에서 `supabase/migrations/001_guest_board_posts.sql`을 실행한다.
7. 비회원 글쓰기와 댓글 작성을 테스트한다.

## Vercel 설정값

대부분 자동으로 잡힌다. 필요하면 아래 값을 사용한다.

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: 비워둠
```

## 배포 후 해야 할 일

- `app/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`

위 파일 안의 주소는 현재 `https://prompt-lab-drab-xi.vercel.app`로 맞춰져 있다.

## 다음 개발 단계

현재 사이트는 공개 데모다. 진짜 커뮤니티가 되려면 아래 기능이 필요하다.

1. Supabase 프로젝트 생성
2. `supabase/schema.sql` 실행
3. 실제 회원가입/로그인 연결
4. 게시글 DB 저장
5. 댓글 DB 저장
6. 이미지 업로드 저장소 연결
7. 관리자 삭제/차단 기능
8. 신고 기능

## 다시 시작할 때 Codex에게 말할 내용

```text
C:\Users\PC\prompt-lab 프로젝트에서 WORK_LOG.md 보고 이어서 해줘.
Vercel 배포부터 계속 진행하고 싶어.
```
