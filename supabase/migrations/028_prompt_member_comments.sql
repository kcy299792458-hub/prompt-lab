alter table public.prompt_comments
  add column if not exists author_id uuid references public.profiles(id) on delete set null;

alter table public.prompt_comments
  alter column guest_nickname drop not null,
  alter column guest_password_hash drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'prompt_comments_author_check'
  ) then
    alter table public.prompt_comments
      add constraint prompt_comments_author_check check (
        (
          author_id is not null
          and guest_nickname is null
          and guest_password_hash is null
        ) or (
          author_id is null
          and guest_nickname is not null
          and guest_password_hash is not null
        )
      );
  end if;
end $$;

create index if not exists prompt_comments_author_idx
on public.prompt_comments(author_id, created_at desc);

drop policy if exists "members can create prompt comments" on public.prompt_comments;
create policy "members can create prompt comments"
on public.prompt_comments for insert
to authenticated
with check (
  auth.uid() = author_id
  and guest_nickname is null
  and guest_password_hash is null
);

drop policy if exists "members can update own prompt comments" on public.prompt_comments;
create policy "members can update own prompt comments"
on public.prompt_comments for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create or replace function public.create_member_prompt_comment(
  p_prompt_id integer,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_comment_id uuid;
  clean_body text := trim(p_body);
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if p_prompt_id <= 0 then
    raise exception '프롬프트를 찾을 수 없습니다.';
  end if;

  if char_length(clean_body) < 1 then
    raise exception '댓글 내용을 입력하세요.';
  end if;

  perform public.enforce_write_rate_limit('prompt_comment', null, auth.uid());

  insert into public.prompt_comments (
    prompt_id,
    author_id,
    body
  )
  values (
    p_prompt_id,
    auth.uid(),
    clean_body
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

create or replace function public.delete_member_prompt_comment(
  p_comment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_comment public.prompt_comments%rowtype;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select *
  into matched_comment
  from public.prompt_comments
  where id = p_comment_id
  and author_id = auth.uid()
  and is_hidden = false;

  if not found then
    raise exception '본인이 작성한 댓글을 찾을 수 없습니다.';
  end if;

  update public.prompt_comments
  set is_hidden = true, updated_at = now()
  where id = p_comment_id
  and author_id = auth.uid();
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
  and author_id is null
  and guest_password_hash is not null
  and is_hidden = false;

  if not found then
    raise exception '삭제할 댓글을 찾을 수 없습니다.';
  end if;

  if matched_comment.guest_password_hash <> extensions.crypt(p_password, matched_comment.guest_password_hash) then
    raise exception '비밀번호가 맞지 않습니다.';
  end if;

  update public.prompt_comments
  set is_hidden = true, updated_at = now()
  where id = p_comment_id
  and author_id is null;
end;
$$;

grant insert, update on public.prompt_comments to authenticated;
grant execute on function public.create_member_prompt_comment(integer, text)
to authenticated;
grant execute on function public.delete_member_prompt_comment(uuid)
to authenticated;
grant execute on function public.delete_guest_prompt_comment(uuid, text)
to anon, authenticated;

notify pgrst, 'reload schema';
