create or replace function public.create_guest_image_comment(
  p_image_post_id uuid,
  p_body text,
  p_guest_nickname text,
  p_password text,
  p_visitor_key text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_comment_id uuid;
  clean_nickname text;
  clean_body text;
begin
  clean_nickname := left(trim(p_guest_nickname), 24);
  clean_body := trim(p_body);

  if not exists (
    select 1 from public.image_posts
    where id = p_image_post_id
    and is_hidden = false
  ) then
    raise exception '이미지 게시글을 찾을 수 없습니다.';
  end if;

  if char_length(clean_nickname) < 2 then
    raise exception '닉네임은 2자 이상이어야 합니다.';
  end if;

  if char_length(p_password) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다.';
  end if;

  if char_length(clean_body) < 1 then
    raise exception '댓글 내용을 입력하세요.';
  end if;

  if to_regprocedure('public.enforce_write_rate_limit(text,text,uuid)') is not null then
    perform public.enforce_write_rate_limit('image_comment', p_visitor_key, null);
  end if;

  insert into public.comments (
    image_post_id,
    body,
    guest_nickname,
    guest_password_hash
  )
  values (
    p_image_post_id,
    clean_body,
    clean_nickname,
    extensions.crypt(p_password, extensions.gen_salt('bf'))
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

create or replace function public.delete_guest_image_comment(
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
  and image_post_id is not null
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

grant execute on function public.create_guest_image_comment(uuid, text, text, text, text)
to anon, authenticated;

grant execute on function public.delete_guest_image_comment(uuid, text)
to anon, authenticated;

notify pgrst, 'reload schema';
