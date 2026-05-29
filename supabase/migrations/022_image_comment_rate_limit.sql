alter table public.write_rate_limit_events
drop constraint if exists write_rate_limit_events_action_type_check;

alter table public.write_rate_limit_events
add constraint write_rate_limit_events_action_type_check
check (
  action_type in (
    'image_post',
    'image_comment',
    'board_post',
    'board_comment',
    'prompt_comment',
    'prompt_request',
    'prompt_request_answer'
  )
);

create or replace function public.enforce_write_rate_limit(
  p_action_type text,
  p_visitor_key text default null,
  p_actor_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_type text := trim(p_action_type);
  clean_key text := nullif(left(trim(coalesce(p_visitor_key, '')), 80), '');
  clean_actor uuid := coalesce(p_actor_id, auth.uid());
  short_limit integer;
  day_limit integer;
  short_count integer;
  day_count integer;
begin
  if clean_type not in (
    'image_post',
    'image_comment',
    'board_post',
    'board_comment',
    'prompt_comment',
    'prompt_request',
    'prompt_request_answer'
  ) then
    raise exception '작성 유형이 올바르지 않습니다.';
  end if;

  if clean_actor is null and (clean_key is null or char_length(clean_key) < 8) then
    raise exception '방문자 정보를 확인할 수 없습니다. 새로고침 후 다시 시도하세요.';
  end if;

  if clean_type in ('image_post', 'board_post', 'prompt_request') then
    short_limit := 5;
    day_limit := 50;
  else
    short_limit := 12;
    day_limit := 120;
  end if;

  select count(*)
  into short_count
  from public.write_rate_limit_events
  where action_type = clean_type
  and created_at > now() - interval '10 minutes'
  and (
    (clean_actor is not null and actor_id = clean_actor) or
    (clean_actor is null and visitor_key = clean_key)
  );

  if short_count >= short_limit then
    raise exception '짧은 시간에 작성이 너무 많습니다. 잠시 후 다시 시도하세요.';
  end if;

  select count(*)
  into day_count
  from public.write_rate_limit_events
  where action_type = clean_type
  and created_at > now() - interval '1 day'
  and (
    (clean_actor is not null and actor_id = clean_actor) or
    (clean_actor is null and visitor_key = clean_key)
  );

  if day_count >= day_limit then
    raise exception '오늘 작성 횟수가 너무 많습니다. 내일 다시 시도하세요.';
  end if;

  insert into public.write_rate_limit_events (
    actor_id,
    visitor_key,
    action_type
  )
  values (
    clean_actor,
    case when clean_actor is null then clean_key else null end,
    clean_type
  );
end;
$$;

grant execute on function public.enforce_write_rate_limit(text, text, uuid)
to anon, authenticated;

notify pgrst, 'reload schema';
