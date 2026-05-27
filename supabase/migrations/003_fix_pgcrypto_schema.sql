create extension if not exists pgcrypto with schema extensions;

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
set search_path = public, extensions
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
set search_path = public, extensions
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

grant execute on function public.create_guest_board_post(text, text, text, text, text) to anon, authenticated;
grant execute on function public.create_guest_board_comment(uuid, text, text, text) to anon, authenticated;
grant execute on function public.update_guest_board_post(uuid, text, text, text, text) to anon, authenticated;
grant execute on function public.delete_guest_board_post(uuid, text) to anon, authenticated;
grant execute on function public.delete_guest_board_comment(uuid, text) to anon, authenticated;
