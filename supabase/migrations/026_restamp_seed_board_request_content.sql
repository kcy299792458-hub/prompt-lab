-- Give launch seed board/request rows distinct timestamps.
-- They were inserted in one SQL batch, so created_at was identical and latest sorting looked wrong.

with seed_board_times(id, created_at) as (
  values
    ('550e2ebe-bb26-4a28-9ffc-92beb243c4d3'::uuid, '2026-05-28 07:50:00+00'::timestamptz),
    ('6f8361ac-9e69-49a4-9c3c-f0f6270e5bac'::uuid, '2026-05-28 07:51:00+00'::timestamptz),
    ('db3039bd-2c84-4c83-9b1c-814c2f46f594'::uuid, '2026-05-28 07:52:00+00'::timestamptz),
    ('fba99a84-38dc-4618-bcd6-1a94d116d935'::uuid, '2026-05-28 07:53:00+00'::timestamptz),
    ('bb28b4f2-a883-46f1-8731-c1a9ac8c8d1d'::uuid, '2026-05-28 07:54:00+00'::timestamptz)
)
update public.board_posts
set
  created_at = seed_board_times.created_at,
  updated_at = seed_board_times.created_at
from seed_board_times
where board_posts.id = seed_board_times.id;

with seed_request_times(id, created_at) as (
  values
    ('5f46d115-e7c7-4e83-84ca-e39ba6f42105'::uuid, '2026-05-28 07:52:00+00'::timestamptz),
    ('032039f3-35e5-49d2-ab17-00bda8788099'::uuid, '2026-05-28 07:53:00+00'::timestamptz),
    ('cba550c3-c83e-46a7-b5c5-71718acd92ae'::uuid, '2026-05-28 07:54:00+00'::timestamptz)
)
update public.prompt_requests
set
  created_at = seed_request_times.created_at,
  updated_at = seed_request_times.created_at
from seed_request_times
where prompt_requests.id = seed_request_times.id;

notify pgrst, 'reload schema';
