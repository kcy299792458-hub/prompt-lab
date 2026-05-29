-- Restamp seeded image examples so the image gallery shows newer examples first.
-- The first seed import used insertion order as newest, which made older examples appear first.

with seed_image_times(id, created_at) as (
  values
    ('d4c9ddec-369b-49fd-864e-7f3bce35f3ae'::uuid, '2026-05-28 08:00:00+00'::timestamptz),
    ('76eab710-47c7-49c1-89b9-fcedcd55d8f3'::uuid, '2026-05-28 08:01:00+00'::timestamptz),
    ('16b84351-c403-4ed4-82b9-e69bded18603'::uuid, '2026-05-28 08:02:00+00'::timestamptz),
    ('0e0fa0ad-a587-41ea-8e70-5eb23ae0482d'::uuid, '2026-05-28 08:03:00+00'::timestamptz),
    ('b6d219b9-51c8-4747-857b-969fcc2a2e5d'::uuid, '2026-05-28 08:04:00+00'::timestamptz),
    ('b8356e86-c3c9-4eac-8876-ad169a5c9971'::uuid, '2026-05-28 08:05:00+00'::timestamptz),
    ('c431cec7-9dd6-4c69-8427-7a31835df199'::uuid, '2026-05-28 08:06:00+00'::timestamptz),
    ('5d4ad190-a13a-4704-8d28-25c54575042e'::uuid, '2026-05-28 08:07:00+00'::timestamptz),
    ('f35706f4-bfe2-4cd6-8ea9-cb296e79caeb'::uuid, '2026-05-28 08:08:00+00'::timestamptz),
    ('a7d445e1-51a7-4f7f-8aa2-43001a339ae5'::uuid, '2026-05-28 08:09:00+00'::timestamptz),
    ('cd842e75-feee-4d8b-8348-1fd4a2fa1b06'::uuid, '2026-05-28 08:10:00+00'::timestamptz),
    ('5e38bbbf-af6b-4c58-8b07-9d8376c3ab4d'::uuid, '2026-05-28 08:11:00+00'::timestamptz),
    ('3b6b1a38-c376-4d11-800d-959f88c2880d'::uuid, '2026-05-28 08:12:00+00'::timestamptz),
    ('8d760bd6-c63b-4b27-80f2-fbe6e2400ab4'::uuid, '2026-05-28 08:13:00+00'::timestamptz),
    ('ac711cbe-bf16-412f-82bf-b091124c93f0'::uuid, '2026-05-28 08:14:00+00'::timestamptz),
    ('0971e252-b6b5-4016-8ad8-101086a71e52'::uuid, '2026-05-28 08:15:00+00'::timestamptz),
    ('251bfcdc-cc42-4553-8519-0e6aa0d6803c'::uuid, '2026-05-28 08:16:00+00'::timestamptz),
    ('10440d24-d9b2-46ae-8997-c1ecaa5998a0'::uuid, '2026-05-28 08:17:00+00'::timestamptz),
    ('5b36b6bc-7f56-4a78-8b8f-908e56eaf8ec'::uuid, '2026-05-28 08:18:00+00'::timestamptz),
    ('2b82442b-93d5-4997-8d8f-a4e2a693fe03'::uuid, '2026-05-28 08:19:00+00'::timestamptz),
    ('eea212c4-6f93-4377-8b7e-7e268746e8be'::uuid, '2026-05-28 08:20:00+00'::timestamptz),
    ('054b6fd9-9609-438a-8923-3fc7a984b140'::uuid, '2026-05-28 08:21:00+00'::timestamptz),
    ('6908174e-2b9e-4f78-8f29-78da7b2eef51'::uuid, '2026-05-28 08:22:00+00'::timestamptz),
    ('d2c5a127-a4e7-4594-81fe-2016dbeca991'::uuid, '2026-05-28 08:23:00+00'::timestamptz),
    ('15870560-e75f-47a8-8645-a475de75d696'::uuid, '2026-05-28 08:24:00+00'::timestamptz),
    ('8816fc81-03ba-47b5-83a6-e6e3d19f35fc'::uuid, '2026-05-28 08:25:00+00'::timestamptz),
    ('054540dc-fb34-44c8-89fa-e63bcd571cb6'::uuid, '2026-05-28 08:26:00+00'::timestamptz),
    ('066de9bc-c4d0-4235-88ef-7f02a5b3a513'::uuid, '2026-05-28 08:27:00+00'::timestamptz),
    ('95f3b472-e89b-4cb9-87bf-8a72311b4726'::uuid, '2026-05-28 08:28:00+00'::timestamptz),
    ('57cba67d-913c-4390-8d15-08a5ce3e1e63'::uuid, '2026-05-28 08:29:00+00'::timestamptz),
    ('36d7d3b4-336a-4ea1-8c34-a8b6496cbfc1'::uuid, '2026-05-28 08:30:00+00'::timestamptz),
    ('0c07560c-adde-408a-8924-e175dc694885'::uuid, '2026-05-28 08:31:00+00'::timestamptz),
    ('2658de28-6133-4771-8cf8-615a6ecb5e5a'::uuid, '2026-05-28 08:32:00+00'::timestamptz),
    ('db65df71-cabe-42ef-8a03-050a1182ad28'::uuid, '2026-05-28 08:33:00+00'::timestamptz),
    ('84c74c47-c502-478f-82a7-fbf8951b5cd2'::uuid, '2026-05-28 08:34:00+00'::timestamptz),
    ('4f7f18e4-d771-4581-83cb-a3bb9ac72d02'::uuid, '2026-05-28 08:35:00+00'::timestamptz),
    ('8d8202b5-c447-4d02-8853-0ff445ec95df'::uuid, '2026-05-28 08:36:00+00'::timestamptz),
    ('7f9bdcbf-c698-4b83-8a49-398687501fb6'::uuid, '2026-05-28 08:37:00+00'::timestamptz),
    ('8486a4d7-fa28-4b27-8ab2-82f4fc6904d0'::uuid, '2026-05-28 08:38:00+00'::timestamptz),
    ('48323d49-f66a-4e1b-8579-3c0d6d7d42d1'::uuid, '2026-05-28 08:39:00+00'::timestamptz),
    ('192f52f4-4575-4dbd-8b14-cb963654f64b'::uuid, '2026-05-28 08:40:00+00'::timestamptz),
    ('fbe20e3c-b286-46c9-8838-10291fc84168'::uuid, '2026-05-28 08:41:00+00'::timestamptz),
    ('e0a647de-e79e-473f-83ae-60ccd9a68cd1'::uuid, '2026-05-28 08:42:00+00'::timestamptz)
)
update public.image_posts
set
  created_at = seed_image_times.created_at,
  updated_at = seed_image_times.created_at
from seed_image_times
where image_posts.id = seed_image_times.id
and image_posts.author_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006'
);

notify pgrst, 'reload schema';
