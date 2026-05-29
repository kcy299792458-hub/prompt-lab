create or replace function public.delete_member_comment(
  p_comment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_comment public.comments%rowtype;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select *
  into matched_comment
  from public.comments
  where id = p_comment_id
  and author_id = auth.uid()
  and is_hidden = false;

  if not found then
    raise exception '본인이 작성한 댓글을 찾을 수 없습니다.';
  end if;

  update public.comments
  set is_hidden = true, updated_at = now()
  where id = p_comment_id
  and author_id = auth.uid();
end;
$$;

grant execute on function public.delete_member_comment(uuid)
to authenticated;

notify pgrst, 'reload schema';
