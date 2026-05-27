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

1. 공개 주소 `https://prompt-lab-drab-xi.vercel.app`를 열어본다.
2. 홈, 게시판, 상세 페이지가 정상인지 확인한다.
3. 다음 개발 단계로 Supabase 실제 로그인/글쓰기/댓글 저장을 붙인다.

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
2. 실제 회원가입/로그인 연결
3. 게시글 DB 저장
4. 댓글 DB 저장
5. 이미지 업로드 저장소 연결
6. 관리자 삭제/차단 기능
7. 신고 기능

## 다시 시작할 때 Codex에게 말할 내용

```text
C:\Users\PC\prompt-lab 프로젝트에서 WORK_LOG.md 보고 이어서 해줘.
Vercel 배포부터 계속 진행하고 싶어.
```
