create extension if not exists pgcrypto;

alter table public.board_posts
  alter column author_id drop not null;

alter table public.board_posts
  add column if not exists guest_nickname text,
  add column if not exists guest_password_hash text;

alter table public.comments
  alter column author_id drop not null;

alter table public.comments
  add column if not exists guest_nickname text,
  add column if not exists guest_password_hash text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'board_posts_author_check'
  ) then
    alter table public.board_posts
      add constraint board_posts_author_check check (
        (author_id is not null and guest_nickname is null and guest_password_hash is null) or
        (author_id is null and guest_nickname is not null and guest_password_hash is not null)
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'comments_author_check'
  ) then
    alter table public.comments
      add constraint comments_author_check check (
        (author_id is not null and guest_nickname is null and guest_password_hash is null) or
        (author_id is null and guest_nickname is not null and guest_password_hash is not null)
      );
  end if;
end;
$$;

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
    crypt(p_password, gen_salt('bf'))
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
    crypt(p_password, gen_salt('bf'))
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

grant execute on function public.create_guest_board_post(text, text, text, text, text) to anon, authenticated;
grant execute on function public.create_guest_board_comment(uuid, text, text, text) to anon, authenticated;
