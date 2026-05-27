create extension if not exists pgcrypto with schema extensions;

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

create or replace function public.create_guest_board_post(
  p_category text,
  p_title text,
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
    guest_nickname,
    guest_password_hash
  )
  values (
    trim(p_category),
    trim(p_title),
    trim(p_body),
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

grant execute on function public.create_guest_board_post(text, text, text, text, text) to anon, authenticated;
grant execute on function public.create_guest_board_comment(uuid, text, text, text) to anon, authenticated;

create or replace function public.update_guest_board_post(
  p_board_post_id uuid,
  p_title text,
  p_body text,
  p_category text,
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

grant execute on function public.update_guest_board_post(uuid, text, text, text, text) to anon, authenticated;
grant execute on function public.delete_guest_board_post(uuid, text) to anon, authenticated;
grant execute on function public.delete_guest_board_comment(uuid, text) to anon, authenticated;
