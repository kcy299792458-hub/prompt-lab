# 프롬포트랩 배포 가이드

## 1. 지금 가능한 무료 배포

현재 프로젝트는 Next.js 앱이라 Vercel에 무료로 배포할 수 있습니다.

배포 후에는 이런 주소가 생깁니다.

```text
https://프로젝트이름.vercel.app
```

## 2. 가장 쉬운 순서

1. GitHub 계정을 만듭니다.
2. 이 프로젝트를 GitHub 저장소로 올립니다.
3. Vercel 계정을 GitHub로 가입합니다.
4. Vercel에서 `New Project`를 누릅니다.
5. GitHub 저장소 `prompt-lab`을 선택합니다.
6. Framework Preset이 `Next.js`인지 확인합니다.
7. `Deploy`를 누릅니다.

## 3. 배포 설정값

Vercel이 보통 자동으로 잡지만, 수동으로 입력해야 한다면 아래처럼 설정합니다.

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: 비워둠
```

## 4. 배포 후 바로 확인할 것

- 홈 화면이 열리는지
- `/boards` 게시판이 열리는지
- 이미지 상세 페이지가 열리는지
- 모바일에서 글씨가 너무 크거나 겹치지 않는지

## 5. 다음 단계

지금 버전은 공개용 데모입니다. 사람들이 실제로 글을 쓰고 댓글을 남기게 하려면 Supabase를 붙여야 합니다.

필요한 기능은 아래 순서로 붙이면 됩니다.

1. Supabase 로그인
2. 게시글 DB 저장
3. 댓글 DB 저장
4. 이미지 업로드 저장소
5. 관리자 삭제/차단 기능
6. 신고 기능
