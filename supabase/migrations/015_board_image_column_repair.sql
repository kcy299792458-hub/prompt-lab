insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'board-images',
  'board-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "board images are readable" on storage.objects;
create policy "board images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'board-images');

drop policy if exists "anyone can upload board images" on storage.objects;
create policy "anyone can upload board images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'board-images');

alter table public.board_posts
  add column if not exists image_urls text[] not null default '{}';

notify pgrst, 'reload schema';
