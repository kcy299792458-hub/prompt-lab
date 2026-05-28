create or replace function public.delete_guest_prompt_request(
  p_prompt_request_id uuid,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  matched_request public.prompt_requests%rowtype;
begin
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
  set is_hidden = true, updated_at = now()
  where id = p_prompt_request_id;

  update public.prompt_request_answers
  set is_hidden = true, updated_at = now()
  where prompt_request_id = p_prompt_request_id
  and is_hidden = false;
end;
$$;

create or replace function public.delete_guest_prompt_request_answer(
  p_answer_id uuid,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  matched_answer public.prompt_request_answers%rowtype;
begin
  select *
  into matched_answer
  from public.prompt_request_answers
  where id = p_answer_id
  and author_id is null
  and is_hidden = false;

  if not found then
    raise exception '답변을 찾을 수 없습니다.';
  end if;

  if matched_answer.guest_password_hash is null or matched_answer.guest_password_hash <> extensions.crypt(p_password, matched_answer.guest_password_hash) then
    raise exception '비밀번호가 맞지 않습니다.';
  end if;

  update public.prompt_request_answers
  set is_hidden = true, updated_at = now()
  where id = p_answer_id;
end;
$$;

grant execute on function public.delete_guest_prompt_request(uuid, text) to anon, authenticated;
grant execute on function public.delete_guest_prompt_request_answer(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
