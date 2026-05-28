update public.board_posts
set is_hidden = true, updated_at = now()
where id in (
  'fabac07e-9255-4ff4-ad8b-cdc99baa49ff'
)
and is_hidden = false;

update public.prompt_requests
set is_hidden = true, updated_at = now()
where id in (
  'b6ada2a3-7168-48c7-9afd-65b5f4397e35'
)
and is_hidden = false;

with seed_posts(category, title, body) as (
  values
    (
      '공지',
      '[공지] 프롬프트랩 이용 안내',
      '프롬프트랩은 AI 이미지 결과와 실제 프롬프트를 함께 모아보는 커뮤니티입니다.

- 이미지 갤러리: 결과 이미지와 실제 사용한 프롬프트를 같이 올리는 공간
- 게시판: 잡담, 질문, 팁, 모델 비교를 자유롭게 쓰는 공간
- 프롬프트 요청: 원하는 이미지 방향을 올리고 다른 사람이 프롬프트를 답변하는 공간

게시판과 댓글은 회원가입 없이도 닉네임과 비밀번호로 작성할 수 있습니다.
이미지 업로드는 작성자 프로필과 기록을 남기기 위해 로그인 후 사용하는 방향으로 운영합니다.'
    ),
    (
      '공지',
      '[공지] 이미지 프롬프트 올릴 때 좋은 형식',
      '이미지 프롬프트를 올릴 때는 아래 정보가 있으면 다른 사람이 훨씬 쉽게 참고할 수 있습니다.

1. 결과 이미지
2. 실제 사용한 프롬프트 원문
3. 사용 모델: GPT Image 2.0
4. 잘 나온 이유나 실패하기 쉬운 조건
5. 바꾸면 느낌이 달라지는 키워드

완벽하게 정리하지 않아도 괜찮습니다. 실제로 넣었던 프롬프트와 결과 이미지만 있어도 충분히 도움이 됩니다.'
    ),
    (
      '팁/연구',
      'GPT Image 2.0 프롬프트는 너무 짧게 쓰면 손해인 듯',
      '요즘 이미지 모델은 단순히 “예쁜 사진 만들어줘”보다 구체적인 촬영 조건을 같이 쓰는 쪽이 훨씬 결과가 안정적인 것 같습니다.

예를 들면:
- 어떤 피사체인지
- 어떤 카메라/렌즈 느낌인지
- 조명 방향
- 재질과 질감
- 배경의 시대감
- 피해야 할 요소

이런 걸 한 문단 안에 넣으면 결과가 덜 랜덤하게 나오는 편입니다.'
    ),
    (
      '질문',
      '이런 프롬프트도 올려도 되나요?',
      '네. 완성된 작품 느낌이 아니어도 올려도 됩니다.

- 실패한 프롬프트
- 이상하게 망한 결과
- 특정 스타일 재현 실험
- 제품사진용 프롬프트
- 웹툰/캐릭터/배경 컨셉
- 디시나 SNS에서 본 느낌 따라 해본 실험

오히려 실패 사례가 쌓이면 다른 사람이 시행착오를 줄일 수 있습니다.'
    ),
    (
      '자유',
      '디시에서 오신 분들 피드백 부탁드립니다',
      '사이트를 막 공개 준비 중입니다.

불편한 점, 이상한 점, 더 디시처럼 직관적이면 좋겠는 부분이 있으면 아무렇게나 남겨주세요.
가입 안 해도 글과 댓글은 쓸 수 있게 해놨습니다.'
    )
)
insert into public.board_posts (
  category,
  title,
  body,
  guest_nickname,
  guest_password_hash
)
select
  seed_posts.category,
  seed_posts.title,
  seed_posts.body,
  '운영자',
  extensions.crypt('promptlab-seed-2026', extensions.gen_salt('bf'))
from seed_posts
where not exists (
  select 1
  from public.board_posts
  where board_posts.title = seed_posts.title
);

with seed_requests(title, body, request_type) as (
  values
    (
      '[예시 요청] 쇼핑몰 상세페이지용 향수 제품컷 프롬프트',
      '투명한 향수병을 고급스럽게 보여주는 제품사진 프롬프트를 찾고 있습니다.

원하는 느낌:
- 무광 또는 투명 유리병
- 고급 잡지 광고 느낌
- 브랜드 글자는 없어야 함
- 배경은 너무 복잡하지 않게
- 상세페이지 첫 이미지로 쓸 수 있는 깔끔한 구도',
      '제품사진'
    ),
    (
      '[예시 요청] 2000년대 폰카 공포 사진 느낌',
      '요즘 너무 선명한 공포 이미지 말고, 2000년대 초반 폰카로 우연히 찍힌 것 같은 이미지를 만들고 싶습니다.

원하는 요소:
- 낮은 해상도
- 플래시
- JPEG 노이즈
- 한국 아파트나 학교 같은 익숙한 장소
- 괴물이 대놓고 보이기보다 뭔가 이상한 느낌',
      '실사'
    ),
    (
      '[예시 요청] 웹툰 표지 느낌의 캐릭터 키비주얼',
      '한국 웹툰 표지처럼 보이는 캐릭터 키비주얼 프롬프트를 찾고 있습니다.

원하는 느낌:
- 세로형 표지
- 캐릭터 한 명 중심
- 배경은 서울 옥상이나 골목
- 마법/판타지 요소가 살짝 있음
- 기존 작품이나 캐릭터를 따라 하지 않는 오리지널 느낌',
      '캐릭터'
    )
)
insert into public.prompt_requests (
  title,
  body,
  guest_nickname,
  guest_password_hash,
  target_model,
  request_type
)
select
  seed_requests.title,
  seed_requests.body,
  '운영자',
  extensions.crypt('promptlab-seed-2026', extensions.gen_salt('bf')),
  'GPT Image 2.0',
  seed_requests.request_type
from seed_requests
where not exists (
  select 1
  from public.prompt_requests
  where prompt_requests.title = seed_requests.title
);

insert into public.prompt_request_answers (
  prompt_request_id,
  prompt_body,
  guest_nickname,
  guest_password_hash,
  model,
  explanation
)
select
  prompt_requests.id,
  'Create a square 1:1 premium product advertisement image of an unbranded transparent glass perfume bottle placed on softly rippled champagne silk fabric. The bottle has a heavy clear glass base, a simple rectangular silhouette, a clear cap, and warm amber liquid inside. Use a low side angle with an 80mm macro photography feeling, warm amber side light from the left, a narrow white highlight along the glass edge, delicate smoke drifting in the dark background, tiny water droplets on the bottle, and realistic caustic reflections on the silk. The composition should feel like a luxury fragrance magazine advertisement with modern clean product photography. Keep the label blank with no readable text, no logo, no brand mark, no watermark, no extra bottles, no floating object, no warped cap, and no oversaturated orange color.',
  '운영자',
  extensions.crypt('promptlab-seed-2026', extensions.gen_salt('bf')),
  'GPT Image 2.0',
  '요청 게시판 답변 예시입니다. 결과 이미지와 함께 갤러리에 올리면 더 좋습니다.'
from public.prompt_requests
where prompt_requests.title = '[예시 요청] 쇼핑몰 상세페이지용 향수 제품컷 프롬프트'
and not exists (
  select 1
  from public.prompt_request_answers
  where prompt_request_answers.prompt_request_id = prompt_requests.id
);

notify pgrst, 'reload schema';
