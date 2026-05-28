create table if not exists public.write_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete cascade,
  visitor_key text check (visitor_key is null or char_length(visitor_key) between 8 and 80),
  action_type text not null check (
    action_type in (
      'image_post',
      'board_post',
      'board_comment',
      'prompt_comment',
      'prompt_request',
      'prompt_request_answer'
    )
  ),
  created_at timestamptz not null default now(),
  constraint write_rate_limit_actor_check check (
    actor_id is not null or visitor_key is not null
  )
);

create index if not exists write_rate_limit_events_actor_idx
on public.write_rate_limit_events(actor_id, action_type, created_at desc);

create index if not exists write_rate_limit_events_visitor_idx
on public.write_rate_limit_events(visitor_key, action_type, created_at desc);

alter table public.write_rate_limit_events enable row level security;

drop policy if exists "admins can read write rate limit events" on public.write_rate_limit_events;
create policy "admins can read write rate limit events"
on public.write_rate_limit_events for select
using (public.is_admin());

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

create or replace function public.enforce_authenticated_write_rate_limit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_id is null then
    return new;
  end if;

  perform public.enforce_write_rate_limit(TG_ARGV[0], null, new.author_id);
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.image_posts') is not null then
    drop trigger if exists image_posts_authenticated_rate_limit on public.image_posts;
    create trigger image_posts_authenticated_rate_limit
    before insert on public.image_posts
    for each row execute function public.enforce_authenticated_write_rate_limit_trigger('image_post');
  end if;

  if to_regclass('public.board_posts') is not null then
    drop trigger if exists board_posts_authenticated_rate_limit on public.board_posts;
    create trigger board_posts_authenticated_rate_limit
    before insert on public.board_posts
    for each row execute function public.enforce_authenticated_write_rate_limit_trigger('board_post');
  end if;

  if to_regclass('public.comments') is not null then
    drop trigger if exists comments_authenticated_rate_limit on public.comments;
    create trigger comments_authenticated_rate_limit
    before insert on public.comments
    for each row execute function public.enforce_authenticated_write_rate_limit_trigger('board_comment');
  end if;

  if to_regclass('public.prompt_requests') is not null then
    drop trigger if exists prompt_requests_authenticated_rate_limit on public.prompt_requests;
    create trigger prompt_requests_authenticated_rate_limit
    before insert on public.prompt_requests
    for each row execute function public.enforce_authenticated_write_rate_limit_trigger('prompt_request');
  end if;

  if to_regclass('public.prompt_request_answers') is not null then
    drop trigger if exists prompt_request_answers_authenticated_rate_limit on public.prompt_request_answers;
    create trigger prompt_request_answers_authenticated_rate_limit
    before insert on public.prompt_request_answers
    for each row execute function public.enforce_authenticated_write_rate_limit_trigger('prompt_request_answer');
  end if;
end;
$$;

create or replace function public.create_guest_board_post(
  p_category text,
  p_title text,
  p_body text,
  p_guest_nickname text,
  p_password text,
  p_visitor_key text,
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

  perform public.enforce_write_rate_limit('board_post', p_visitor_key, null);

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
begin
  clean_nickname := left(trim(p_guest_nickname), 24);

  if char_length(clean_nickname) < 2 then
    raise exception '닉네임은 2자 이상이어야 합니다.';
  end if;

  if char_length(p_password) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다.';
  end if;

  perform public.enforce_write_rate_limit('board_comment', p_visitor_key, null);

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

create or replace function public.create_guest_prompt_comment(
  p_prompt_id integer,
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

  perform public.enforce_write_rate_limit('prompt_comment', p_visitor_key, null);

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

create or replace function public.create_guest_prompt_request(
  p_title text,
  p_body text,
  p_guest_nickname text,
  p_password text,
  p_visitor_key text,
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

  perform public.enforce_write_rate_limit('prompt_request', p_visitor_key, null);

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
  p_visitor_key text,
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

  perform public.enforce_write_rate_limit('prompt_request_answer', p_visitor_key, null);

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

do $$
begin
  if to_regprocedure('public.create_guest_board_post(text,text,text,text,text)') is not null then
    revoke execute on function public.create_guest_board_post(text,text,text,text,text) from public, anon, authenticated;
  end if;
  if to_regprocedure('public.create_guest_board_post(text,text,text,text,text,text[])') is not null then
    revoke execute on function public.create_guest_board_post(text,text,text,text,text,text[]) from public, anon, authenticated;
  end if;
  if to_regprocedure('public.create_guest_board_comment(uuid,text,text,text)') is not null then
    revoke execute on function public.create_guest_board_comment(uuid,text,text,text) from public, anon, authenticated;
  end if;
  if to_regprocedure('public.create_guest_prompt_comment(integer,text,text,text)') is not null then
    revoke execute on function public.create_guest_prompt_comment(integer,text,text,text) from public, anon, authenticated;
  end if;
  if to_regprocedure('public.create_guest_prompt_request(text,text,text,text,text,text,text[])') is not null then
    revoke execute on function public.create_guest_prompt_request(text,text,text,text,text,text,text[]) from public, anon, authenticated;
  end if;
  if to_regprocedure('public.create_guest_prompt_request_answer(uuid,text,text,text,text,text,text,text)') is not null then
    revoke execute on function public.create_guest_prompt_request_answer(uuid,text,text,text,text,text,text,text) from public, anon, authenticated;
  end if;
end;
$$;

grant execute on function public.enforce_write_rate_limit(text, text, uuid) to anon, authenticated;
grant execute on function public.create_guest_board_post(text, text, text, text, text, text, text[]) to anon, authenticated;
grant execute on function public.create_guest_board_comment(uuid, text, text, text, text) to anon, authenticated;
grant execute on function public.create_guest_prompt_comment(integer, text, text, text, text) to anon, authenticated;
grant execute on function public.create_guest_prompt_request(text, text, text, text, text, text, text, text[]) to anon, authenticated;
grant execute on function public.create_guest_prompt_request_answer(uuid, text, text, text, text, text, text, text, text) to anon, authenticated;
