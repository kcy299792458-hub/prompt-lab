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

drop function if exists public.create_guest_board_post(text, text, text, text, text);
create or replace function public.create_guest_board_post(
  p_category text,
  p_title text,
  p_body text,
  p_guest_nickname text,
  p_password text,
  p_image_urls text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_post_id uuid;
  clean_nickname text;
begin
  clean_nickname := left(trim(p_guest_nickname), 24);

  if char_length(clean_nickname) < 2 then
    raise exception '닉네임은 2자 이상이어야 합니다.';
  end if;

  if char_length(p_password) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다.';
  end if;

  insert into public.board_posts (
    category,
    title,
    body,
    image_urls,
    guest_nickname,
    guest_password_hash
  )
  values (
    trim(p_category),
    trim(p_title),
    trim(p_body),
    coalesce(p_image_urls, '{}'::text[]),
    clean_nickname,
    extensions.crypt(p_password, extensions.gen_salt('bf'))
  )
  returning id into new_post_id;

  return new_post_id;
end;
$$;

drop function if exists public.update_guest_board_post(uuid, text, text, text, text);
create or replace function public.update_guest_board_post(
  p_board_post_id uuid,
  p_title text,
  p_body text,
  p_category text,
  p_password text,
  p_image_urls text[] default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  matched_post public.board_posts%rowtype;
begin
  select *
  into matched_post
  from public.board_posts
  where id = p_board_post_id
  and author_id is null
  and is_hidden = false;

  if not found then
    raise exception '수정할 게시글을 찾을 수 없습니다.';
  end if;

  if matched_post.guest_password_hash is null or matched_post.guest_password_hash <> extensions.crypt(p_password, matched_post.guest_password_hash) then
    raise exception '비밀번호가 맞지 않습니다.';
  end if;

  update public.board_posts
  set
    title = trim(p_title),
    body = trim(p_body),
    category = trim(p_category),
    image_urls = coalesce(p_image_urls, image_urls),
    updated_at = now()
  where id = p_board_post_id;
end;
$$;

grant execute on function public.create_guest_board_post(text, text, text, text, text, text[]) to anon, authenticated;
grant execute on function public.update_guest_board_post(uuid, text, text, text, text, text[]) to anon, authenticated;
