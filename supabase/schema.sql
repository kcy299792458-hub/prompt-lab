create extension if not exists pgcrypto with schema extensions;

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

create type public.user_role as enum ('user', 'admin');
create type public.post_kind as enum ('image', 'board');
create type public.prompt_language as enum ('ko', 'en', 'mixed', 'negative', 'settings');
create type public.reaction_kind as enum ('like', 'save');
create type public.report_status as enum ('open', 'reviewed', 'dismissed', 'actioned');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 24),
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_nickname text;
begin
  base_nickname := coalesce(
    nullif(new.raw_user_meta_data ->> 'nickname', ''),
    split_part(new.email, '@', 1),
    'user'
  );

  insert into public.profiles (id, nickname)
  values (
    new.id,
    left(regexp_replace(base_nickname, '[^a-zA-Z0-9가-힣_]', '', 'g') || '_' || left(new.id::text, 6), 24)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table public.image_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  category text not null,
  model text not null default '',
  aspect_ratio text not null default '',
  style text not null default '',
  image_url text not null,
  image_urls text[] not null default '{}',
  tags text[] not null default '{}',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  image_post_id uuid not null references public.image_posts(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 40),
  language public.prompt_language not null,
  body text not null check (char_length(body) between 1 and 12000),
  created_at timestamptz not null default now()
);

create table public.board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  guest_nickname text check (guest_nickname is null or char_length(guest_nickname) between 2 and 24),
  guest_password_hash text,
  category text not null,
  title text not null check (char_length(title) between 2 and 100),
  body text not null check (char_length(body) between 1 and 20000),
  image_urls text[] not null default '{}',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_posts_author_check check (
    (author_id is not null and guest_nickname is null and guest_password_hash is null) or
    (author_id is null and guest_nickname is not null and guest_password_hash is not null)
  )
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  guest_nickname text check (guest_nickname is null or char_length(guest_nickname) between 2 and 24),
  guest_password_hash text,
  image_post_id uuid references public.image_posts(id) on delete cascade,
  board_post_id uuid references public.board_posts(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_single_parent check (
    (image_post_id is not null and board_post_id is null) or
    (image_post_id is null and board_post_id is not null)
  ),
  constraint comments_author_check check (
    (author_id is not null and guest_nickname is null and guest_password_hash is null) or
    (author_id is null and guest_nickname is not null and guest_password_hash is not null)
  )
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_post_id uuid references public.image_posts(id) on delete cascade,
  board_post_id uuid references public.board_posts(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  constraint reactions_single_parent check (
    (image_post_id is not null and board_post_id is null) or
    (image_post_id is null and board_post_id is not null)
  ),
  constraint reactions_unique_image unique (user_id, image_post_id, kind),
  constraint reactions_unique_board unique (user_id, board_post_id, kind)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  image_post_id uuid references public.image_posts(id) on delete cascade,
  board_post_id uuid references public.board_posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (char_length(reason) between 2 and 1000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint reports_single_target check (
    ((image_post_id is not null)::int +
     (board_post_id is not null)::int +
     (comment_id is not null)::int) = 1
  )
);

create index image_posts_created_at_idx on public.image_posts(created_at desc);
create index board_posts_created_at_idx on public.board_posts(created_at desc);
create index comments_image_post_idx on public.comments(image_post_id, created_at);
create index comments_board_post_idx on public.comments(board_post_id, created_at);
create index reactions_image_post_idx on public.reactions(image_post_id);
create index reactions_board_post_idx on public.reactions(board_post_id);
create index reports_status_idx on public.reports(status, created_at desc);

alter table public.profiles enable row level security;
alter table public.image_posts enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.board_posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  );
$$;

create policy "profiles are readable"
on public.profiles for select
using (true);

create policy "users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "visible image posts are readable"
on public.image_posts for select
using (is_hidden = false);

create policy "users can create image posts"
on public.image_posts for insert
with check (auth.uid() = author_id);

create policy "authors can update image posts"
on public.image_posts for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "admins can moderate image posts"
on public.image_posts for update
using (public.is_admin())
with check (public.is_admin());

create policy "authors can delete image posts"
on public.image_posts for delete
using (auth.uid() = author_id);

create policy "prompt versions are readable through visible image posts"
on public.prompt_versions for select
using (
  exists (
    select 1 from public.image_posts
    where image_posts.id = prompt_versions.image_post_id
    and image_posts.is_hidden = false
  )
);

create policy "image post authors can create prompt versions"
on public.prompt_versions for insert
with check (
  exists (
    select 1 from public.image_posts
    where image_posts.id = prompt_versions.image_post_id
    and image_posts.author_id = auth.uid()
  )
);

create policy "visible board posts are readable"
on public.board_posts for select
using (is_hidden = false);

create policy "users can create board posts"
on public.board_posts for insert
with check (auth.uid() = author_id);

create policy "authors can update board posts"
on public.board_posts for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "admins can moderate board posts"
on public.board_posts for update
using (public.is_admin())
with check (public.is_admin());

create policy "authors can delete board posts"
on public.board_posts for delete
using (auth.uid() = author_id);

create policy "visible comments are readable"
on public.comments for select
using (is_hidden = false);

create policy "users can create comments"
on public.comments for insert
with check (auth.uid() = author_id);

create policy "authors can update comments"
on public.comments for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "admins can moderate comments"
on public.comments for update
using (public.is_admin())
with check (public.is_admin());

create policy "authors can delete comments"
on public.comments for delete
using (auth.uid() = author_id);

create policy "reactions are readable"
on public.reactions for select
using (true);

create policy "users can create own reactions"
on public.reactions for insert
with check (auth.uid() = user_id);

create policy "users can delete own reactions"
on public.reactions for delete
using (auth.uid() = user_id);

create policy "users can create reports"
on public.reports for insert
with check (auth.uid() = reporter_id);

create policy "users can read own reports"
on public.reports for select
using (auth.uid() = reporter_id);

create policy "admins can read all reports"
on public.reports for select
using (public.is_admin());

create policy "admins can update reports"
on public.reports for update
using (public.is_admin())
with check (public.is_admin());

create policy "board images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'board-images');

create policy "anyone can upload board images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'board-images');

create policy "prompt images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'prompt-images');

create policy "logged in users can upload prompt images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'prompt-images');

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
set search_path = public
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

create or replace function public.create_guest_board_comment(
  p_board_post_id uuid,
  p_body text,
  p_guest_nickname text,
  p_password text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_comment_id uuid;
  clean_nickname text;
begin
  clean_nickname := left(trim(p_guest_nickname), 24);

  if char_length(clean_nickname) < 2 then
    raise exception '닉네임은 2자 이상이어야 합니다.';
  end if;

  if char_length(p_password) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다.';
  end if;

  insert into public.comments (
    board_post_id,
    body,
    guest_nickname,
    guest_password_hash
  )
  values (
    p_board_post_id,
    trim(p_body),
    clean_nickname,
    extensions.crypt(p_password, extensions.gen_salt('bf'))
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

grant execute on function public.create_guest_board_post(text, text, text, text, text, text[]) to anon, authenticated;
grant execute on function public.create_guest_board_comment(uuid, text, text, text) to anon, authenticated;

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
set search_path = public
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

create or replace function public.delete_guest_board_post(
  p_board_post_id uuid,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public
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
    raise exception '삭제할 게시글을 찾을 수 없습니다.';
  end if;

  if matched_post.guest_password_hash is null or matched_post.guest_password_hash <> extensions.crypt(p_password, matched_post.guest_password_hash) then
    raise exception '비밀번호가 맞지 않습니다.';
  end if;

  update public.board_posts
  set is_hidden = true, updated_at = now()
  where id = p_board_post_id;
end;
$$;

create or replace function public.delete_guest_board_comment(
  p_comment_id uuid,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_comment public.comments%rowtype;
begin
  select *
  into matched_comment
  from public.comments
  where id = p_comment_id
  and author_id is null
  and is_hidden = false;

  if not found then
    raise exception '삭제할 댓글을 찾을 수 없습니다.';
  end if;

  if matched_comment.guest_password_hash is null or matched_comment.guest_password_hash <> extensions.crypt(p_password, matched_comment.guest_password_hash) then
    raise exception '비밀번호가 맞지 않습니다.';
  end if;

  update public.comments
  set is_hidden = true, updated_at = now()
  where id = p_comment_id;
end;
$$;

grant execute on function public.update_guest_board_post(uuid, text, text, text, text, text[]) to anon, authenticated;
grant execute on function public.delete_guest_board_post(uuid, text) to anon, authenticated;
grant execute on function public.delete_guest_board_comment(uuid, text) to anon, authenticated;

create table public.prompt_reactions (
  id uuid primary key default gen_random_uuid(),
  prompt_id integer not null check (prompt_id > 0),
  visitor_key text not null check (char_length(visitor_key) between 8 and 80),
  kind text not null check (kind in ('like', 'save')),
  created_at timestamptz not null default now(),
  unique (prompt_id, visitor_key, kind)
);

create table public.prompt_comments (
  id uuid primary key default gen_random_uuid(),
  prompt_id integer not null check (prompt_id > 0),
  guest_nickname text not null check (char_length(guest_nickname) between 2 and 24),
  guest_password_hash text not null,
  body text not null check (char_length(body) between 1 and 3000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prompt_reactions_prompt_idx on public.prompt_reactions(prompt_id, kind);
create index prompt_comments_prompt_idx on public.prompt_comments(prompt_id, created_at);

alter table public.prompt_reactions enable row level security;
alter table public.prompt_comments enable row level security;

create policy "prompt reactions are readable"
on public.prompt_reactions for select
using (true);

create policy "visible prompt comments are readable"
on public.prompt_comments for select
using (is_hidden = false);

create or replace function public.toggle_prompt_reaction(
  p_prompt_id integer,
  p_visitor_key text,
  p_kind text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_key text;
  clean_kind text;
begin
  clean_key := left(trim(p_visitor_key), 80);
  clean_kind := trim(p_kind);

  if p_prompt_id <= 0 then
    raise exception 'Invalid prompt id.';
  end if;

  if char_length(clean_key) < 8 then
    raise exception 'Invalid visitor key.';
  end if;

  if clean_kind not in ('like', 'save') then
    raise exception 'Invalid reaction kind.';
  end if;

  if exists (
    select 1
    from public.prompt_reactions
    where prompt_id = p_prompt_id
    and visitor_key = clean_key
    and kind = clean_kind
  ) then
    delete from public.prompt_reactions
    where prompt_id = p_prompt_id
    and visitor_key = clean_key
    and kind = clean_kind;

    return false;
  end if;

  insert into public.prompt_reactions (prompt_id, visitor_key, kind)
  values (p_prompt_id, clean_key, clean_kind);

  return true;
end;
$$;

create or replace function public.create_guest_prompt_comment(
  p_prompt_id integer,
  p_body text,
  p_guest_nickname text,
  p_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_comment_id uuid;
  clean_nickname text;
begin
  clean_nickname := left(trim(p_guest_nickname), 24);

  if p_prompt_id <= 0 then
    raise exception 'Invalid prompt id.';
  end if;

  if char_length(clean_nickname) < 2 then
    raise exception 'Nickname must be at least 2 characters.';
  end if;

  if char_length(p_password) < 4 then
    raise exception 'Password must be at least 4 characters.';
  end if;

  insert into public.prompt_comments (
    prompt_id,
    body,
    guest_nickname,
    guest_password_hash
  )
  values (
    p_prompt_id,
    trim(p_body),
    clean_nickname,
    extensions.crypt(p_password, extensions.gen_salt('bf'))
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

create or replace function public.delete_guest_prompt_comment(
  p_comment_id uuid,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  matched_comment public.prompt_comments%rowtype;
begin
  select *
  into matched_comment
  from public.prompt_comments
  where id = p_comment_id
  and is_hidden = false;

  if not found then
    raise exception 'Comment not found.';
  end if;

  if matched_comment.guest_password_hash <> extensions.crypt(p_password, matched_comment.guest_password_hash) then
    raise exception 'Password does not match.';
  end if;

  update public.prompt_comments
  set is_hidden = true, updated_at = now()
  where id = p_comment_id;
end;
$$;

grant select on public.prompt_reactions to anon, authenticated;
grant select on public.prompt_comments to anon, authenticated;
grant execute on function public.toggle_prompt_reaction(integer, text, text) to anon, authenticated;
grant execute on function public.create_guest_prompt_comment(integer, text, text, text) to anon, authenticated;
grant execute on function public.delete_guest_prompt_comment(uuid, text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prompt-request-images',
  'prompt-request-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

create table public.prompt_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  guest_nickname text check (guest_nickname is null or char_length(guest_nickname) between 2 and 24),
  guest_password_hash text,
  title text not null check (char_length(title) between 2 and 100),
  body text not null check (char_length(body) between 1 and 12000),
  target_model text not null default '',
  request_type text not null default '기타',
  reference_image_urls text[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'resolved')),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prompt_requests_author_check check (
    (author_id is not null and guest_nickname is null and guest_password_hash is null) or
    (author_id is null and guest_nickname is not null and guest_password_hash is not null)
  )
);

create table public.prompt_request_answers (
  id uuid primary key default gen_random_uuid(),
  prompt_request_id uuid not null references public.prompt_requests(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  guest_nickname text check (guest_nickname is null or char_length(guest_nickname) between 2 and 24),
  guest_password_hash text,
  prompt_body text not null check (char_length(prompt_body) between 1 and 12000),
  negative_prompt text not null default '',
  model text not null default '',
  settings text not null default '',
  explanation text not null default '',
  is_accepted boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prompt_request_answers_author_check check (
    (author_id is not null and guest_nickname is null and guest_password_hash is null) or
    (author_id is null and guest_nickname is not null and guest_password_hash is not null)
  )
);

create index prompt_requests_created_at_idx on public.prompt_requests(created_at desc);
create index prompt_requests_status_idx on public.prompt_requests(status, created_at desc);
create index prompt_request_answers_request_idx on public.prompt_request_answers(prompt_request_id, created_at);

alter table public.prompt_requests enable row level security;
alter table public.prompt_request_answers enable row level security;

create policy "prompt request images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'prompt-request-images');

create policy "anyone can upload prompt request images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'prompt-request-images');

create policy "visible prompt requests are readable"
on public.prompt_requests for select
using (is_hidden = false);

create policy "users can create prompt requests"
on public.prompt_requests for insert
with check (auth.uid() = author_id);

create policy "authors can update prompt requests"
on public.prompt_requests for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "visible prompt request answers are readable"
on public.prompt_request_answers for select
using (is_hidden = false);

create policy "users can create prompt request answers"
on public.prompt_request_answers for insert
with check (auth.uid() = author_id);

create policy "answer authors can update prompt request answers"
on public.prompt_request_answers for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create or replace function public.create_guest_prompt_request(
  p_title text,
  p_body text,
  p_guest_nickname text,
  p_password text,
  p_target_model text default '',
  p_request_type text default '기타',
  p_reference_image_urls text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_request_id uuid;
  clean_nickname text;
begin
  clean_nickname := left(trim(p_guest_nickname), 24);

  if char_length(clean_nickname) < 2 then
    raise exception '닉네임은 2자 이상이어야 합니다.';
  end if;

  if char_length(p_password) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다.';
  end if;

  insert into public.prompt_requests (
    title,
    body,
    guest_nickname,
    guest_password_hash,
    target_model,
    request_type,
    reference_image_urls
  )
  values (
    trim(p_title),
    trim(p_body),
    clean_nickname,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    trim(p_target_model),
    trim(p_request_type),
    coalesce(p_reference_image_urls, '{}'::text[])
  )
  returning id into new_request_id;

  return new_request_id;
end;
$$;

create or replace function public.create_guest_prompt_request_answer(
  p_prompt_request_id uuid,
  p_prompt_body text,
  p_guest_nickname text,
  p_password text,
  p_negative_prompt text default '',
  p_model text default '',
  p_settings text default '',
  p_explanation text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_answer_id uuid;
  clean_nickname text;
begin
  clean_nickname := left(trim(p_guest_nickname), 24);

  if char_length(clean_nickname) < 2 then
    raise exception '닉네임은 2자 이상이어야 합니다.';
  end if;

  if char_length(p_password) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다.';
  end if;

  insert into public.prompt_request_answers (
    prompt_request_id,
    prompt_body,
    guest_nickname,
    guest_password_hash,
    negative_prompt,
    model,
    settings,
    explanation
  )
  values (
    p_prompt_request_id,
    trim(p_prompt_body),
    clean_nickname,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    trim(p_negative_prompt),
    trim(p_model),
    trim(p_settings),
    trim(p_explanation)
  )
  returning id into new_answer_id;

  return new_answer_id;
end;
$$;

create or replace function public.update_guest_prompt_request_status(
  p_prompt_request_id uuid,
  p_password text,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  matched_request public.prompt_requests%rowtype;
  clean_status text;
begin
  clean_status := trim(p_status);

  if clean_status not in ('open', 'resolved') then
    raise exception '상태 값이 올바르지 않습니다.';
  end if;

  select *
  into matched_request
  from public.prompt_requests
  where id = p_prompt_request_id
  and author_id is null
  and is_hidden = false;

  if not found then
    raise exception '요청 글을 찾을 수 없습니다.';
  end if;

  if matched_request.guest_password_hash is null or matched_request.guest_password_hash <> extensions.crypt(p_password, matched_request.guest_password_hash) then
    raise exception '비밀번호가 맞지 않습니다.';
  end if;

  update public.prompt_requests
  set status = clean_status, updated_at = now()
  where id = p_prompt_request_id;
end;
$$;

grant select on public.prompt_requests to anon, authenticated;
grant select on public.prompt_request_answers to anon, authenticated;
grant execute on function public.create_guest_prompt_request(text, text, text, text, text, text, text[]) to anon, authenticated;
grant execute on function public.create_guest_prompt_request_answer(uuid, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.update_guest_prompt_request_status(uuid, text, text) to anon, authenticated;

create table if not exists public.board_reactions (
  id uuid primary key default gen_random_uuid(),
  board_post_id uuid not null references public.board_posts(id) on delete cascade,
  visitor_key text not null check (char_length(visitor_key) between 8 and 80),
  kind text not null default 'recommend' check (kind = 'recommend'),
  created_at timestamptz not null default now(),
  unique (board_post_id, visitor_key, kind)
);

create index if not exists board_reactions_post_idx
on public.board_reactions(board_post_id, kind);

alter table public.board_reactions enable row level security;

drop policy if exists "board reactions are readable" on public.board_reactions;
create policy "board reactions are readable"
on public.board_reactions for select
using (true);

create or replace function public.toggle_board_reaction(
  p_board_post_id uuid,
  p_visitor_key text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_key text;
begin
  clean_key := left(trim(p_visitor_key), 80);

  if p_board_post_id is null then
    raise exception 'Invalid board post id.';
  end if;

  if char_length(clean_key) < 8 then
    raise exception 'Invalid visitor key.';
  end if;

  if not exists (
    select 1
    from public.board_posts
    where id = p_board_post_id
    and is_hidden = false
  ) then
    raise exception 'Board post not found.';
  end if;

  if exists (
    select 1
    from public.board_reactions
    where board_post_id = p_board_post_id
    and visitor_key = clean_key
    and kind = 'recommend'
  ) then
    delete from public.board_reactions
    where board_post_id = p_board_post_id
    and visitor_key = clean_key
    and kind = 'recommend';

    return false;
  end if;

  insert into public.board_reactions (board_post_id, visitor_key, kind)
  values (p_board_post_id, clean_key, 'recommend');

  return true;
end;
$$;

grant select on public.board_reactions to anon, authenticated;
grant execute on function public.toggle_board_reaction(uuid, text) to anon, authenticated;

drop policy if exists "admins can moderate prompt comments" on public.prompt_comments;
create policy "admins can moderate prompt comments"
on public.prompt_comments for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can moderate prompt requests" on public.prompt_requests;
create policy "admins can moderate prompt requests"
on public.prompt_requests for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can moderate prompt request answers" on public.prompt_request_answers;
create policy "admins can moderate prompt request answers"
on public.prompt_request_answers for update
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  visitor_key text check (visitor_key is null or char_length(visitor_key) between 8 and 80),
  target_type text not null check (
    target_type in (
      'image_post',
      'board_post',
      'comment',
      'prompt_comment',
      'prompt_request',
      'prompt_request_answer'
    )
  ),
  target_id text not null check (char_length(target_id) between 1 and 80),
  target_title text not null default '' check (char_length(target_title) <= 200),
  target_path text not null default '' check (char_length(target_path) <= 300),
  reason text not null check (char_length(reason) between 2 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_reports_status_idx
on public.content_reports(status, created_at desc);

create index if not exists content_reports_target_idx
on public.content_reports(target_type, target_id);

alter table public.content_reports enable row level security;

drop policy if exists "admins can read content reports" on public.content_reports;
create policy "admins can read content reports"
on public.content_reports for select
using (public.is_admin());

drop policy if exists "admins can update content reports" on public.content_reports;
create policy "admins can update content reports"
on public.content_reports for update
using (public.is_admin())
with check (public.is_admin());

create or replace function public.create_content_report(
  p_target_type text,
  p_target_id text,
  p_target_title text,
  p_target_path text,
  p_reason text,
  p_visitor_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_report_id uuid;
  clean_type text := trim(p_target_type);
  clean_target_id text := left(trim(p_target_id), 80);
  clean_title text := left(trim(coalesce(p_target_title, '')), 200);
  clean_path text := left(trim(coalesce(p_target_path, '')), 300);
  clean_reason text := left(trim(p_reason), 1000);
  clean_key text := nullif(left(trim(coalesce(p_visitor_key, '')), 80), '');
begin
  if clean_type not in (
    'image_post',
    'board_post',
    'comment',
    'prompt_comment',
    'prompt_request',
    'prompt_request_answer'
  ) then
    raise exception '신고 대상이 올바르지 않습니다.';
  end if;

  if char_length(clean_target_id) < 1 then
    raise exception '신고 대상을 찾을 수 없습니다.';
  end if;

  if char_length(clean_reason) < 2 then
    raise exception '신고 사유는 2자 이상 입력해야 합니다.';
  end if;

  if clean_key is not null and char_length(clean_key) < 8 then
    raise exception '방문자 정보가 올바르지 않습니다.';
  end if;

  if clean_type = 'image_post' and not exists (
    select 1 from public.image_posts where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'board_post' and not exists (
    select 1 from public.board_posts where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'comment' and not exists (
    select 1 from public.comments where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'prompt_comment' and not exists (
    select 1 from public.prompt_comments where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'prompt_request' and not exists (
    select 1 from public.prompt_requests where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'prompt_request_answer' and not exists (
    select 1 from public.prompt_request_answers where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  end if;

  insert into public.content_reports (
    reporter_id,
    visitor_key,
    target_type,
    target_id,
    target_title,
    target_path,
    reason
  )
  values (
    auth.uid(),
    clean_key,
    clean_type,
    clean_target_id,
    clean_title,
    clean_path,
    clean_reason
  )
  returning id into new_report_id;

  return new_report_id;
end;
$$;

grant select, update on public.content_reports to authenticated;
grant execute on function public.create_content_report(text, text, text, text, text, text)
to anon, authenticated;
