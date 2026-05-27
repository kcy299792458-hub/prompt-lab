insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prompt-images',
  'prompt-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "prompt images are readable" on storage.objects;
create policy "prompt images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'prompt-images');

drop policy if exists "logged in users can upload prompt images" on storage.objects;
create policy "logged in users can upload prompt images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'prompt-images');

alter table public.image_posts
  add column if not exists image_urls text[] not null default '{}';
