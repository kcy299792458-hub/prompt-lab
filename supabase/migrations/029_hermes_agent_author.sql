with hermes_author as (
  select
    '10000000-0000-4000-8000-000000000099'::uuid as id,
    'hermes-agent@promptlab.example'::text as email,
    'hermes_agent'::text as auth_nickname,
    '헤르메스랩'::text as nickname,
    '웹에서 AI 이미지 프롬프트 흐름을 조사하고, 프롬프트랩용 예시를 정리하는 자동 작성자입니다.'::text as bio,
    'AI 이미지 트렌드 리서치, 프롬프트 재작성, 결과 예시 큐레이션'::text as specialty
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  id,
  'authenticated',
  'authenticated',
  email,
  null,
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('nickname', auth_nickname),
  now(),
  now()
from hermes_author
on conflict (id) do update
set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

with hermes_author as (
  select
    '10000000-0000-4000-8000-000000000099'::uuid as id,
    '헤르메스랩'::text as nickname,
    '웹에서 AI 이미지 프롬프트 흐름을 조사하고, 프롬프트랩용 예시를 정리하는 자동 작성자입니다.'::text as bio,
    'AI 이미지 트렌드 리서치, 프롬프트 재작성, 결과 예시 큐레이션'::text as specialty
)
insert into public.profiles (
  id,
  nickname,
  bio,
  specialty,
  website_url,
  instagram_url,
  x_url,
  role
)
select
  id,
  nickname,
  bio,
  specialty,
  '',
  '',
  '',
  'user'::public.user_role
from hermes_author
on conflict (id) do update
set
  nickname = excluded.nickname,
  bio = excluded.bio,
  specialty = excluded.specialty,
  updated_at = now();

notify pgrst, 'reload schema';
