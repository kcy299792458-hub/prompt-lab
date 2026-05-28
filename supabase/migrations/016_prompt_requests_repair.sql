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

drop policy if exists "prompt request images are readable" on storage.objects;
create policy "prompt request images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'prompt-request-images');

drop policy if exists "anyone can upload prompt request images" on storage.objects;
create policy "anyone can upload prompt request images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'prompt-request-images');

create table if not exists public.prompt_requests (
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

create table if not exists public.prompt_request_answers (
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

create index if not exists prompt_requests_created_at_idx
on public.prompt_requests(created_at desc);

create index if not exists prompt_requests_status_idx
on public.prompt_requests(status, created_at desc);

create index if not exists prompt_request_answers_request_idx
on public.prompt_request_answers(prompt_request_id, created_at);

alter table public.prompt_requests enable row level security;
alter table public.prompt_request_answers enable row level security;

drop policy if exists "visible prompt requests are readable" on public.prompt_requests;
create policy "visible prompt requests are readable"
on public.prompt_requests for select
using (is_hidden = false);

drop policy if exists "users can create prompt requests" on public.prompt_requests;
create policy "users can create prompt requests"
on public.prompt_requests for insert
with check (auth.uid() = author_id);

drop policy if exists "authors can update prompt requests" on public.prompt_requests;
create policy "authors can update prompt requests"
on public.prompt_requests for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "visible prompt request answers are readable" on public.prompt_request_answers;
create policy "visible prompt request answers are readable"
on public.prompt_request_answers for select
using (is_hidden = false);

drop policy if exists "users can create prompt request answers" on public.prompt_request_answers;
create policy "users can create prompt request answers"
on public.prompt_request_answers for insert
with check (auth.uid() = author_id);

drop policy if exists "answer authors can update prompt request answers" on public.prompt_request_answers;
create policy "answer authors can update prompt request answers"
on public.prompt_request_answers for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

do $$
begin
  if to_regprocedure('public.is_admin()') is not null then
    drop policy if exists "admins can update prompt requests" on public.prompt_requests;
    create policy "admins can update prompt requests"
    on public.prompt_requests for update
    using (public.is_admin())
    with check (public.is_admin());

    drop policy if exists "admins can update prompt request answers" on public.prompt_request_answers;
    create policy "admins can update prompt request answers"
    on public.prompt_request_answers for update
    using (public.is_admin())
    with check (public.is_admin());
  end if;
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

  if to_regprocedure('public.enforce_write_rate_limit(text,text,uuid)') is not null then
    perform public.enforce_write_rate_limit('prompt_request', p_visitor_key, null);
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

  if to_regprocedure('public.enforce_write_rate_limit(text,text,uuid)') is not null then
    perform public.enforce_write_rate_limit('prompt_request_answer', p_visitor_key, null);
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

do $$
begin
  if to_regprocedure('public.create_guest_prompt_request(text,text,text,text,text,text,text[])') is not null then
    revoke execute on function public.create_guest_prompt_request(text,text,text,text,text,text,text[]) from public, anon, authenticated;
  end if;

  if to_regprocedure('public.create_guest_prompt_request_answer(uuid,text,text,text,text,text,text,text)') is not null then
    revoke execute on function public.create_guest_prompt_request_answer(uuid,text,text,text,text,text,text,text) from public, anon, authenticated;
  end if;

  if to_regprocedure('public.enforce_authenticated_write_rate_limit_trigger()') is not null then
    drop trigger if exists prompt_requests_authenticated_rate_limit on public.prompt_requests;
    create trigger prompt_requests_authenticated_rate_limit
    before insert on public.prompt_requests
    for each row execute function public.enforce_authenticated_write_rate_limit_trigger('prompt_request');

    drop trigger if exists prompt_request_answers_authenticated_rate_limit on public.prompt_request_answers;
    create trigger prompt_request_answers_authenticated_rate_limit
    before insert on public.prompt_request_answers
    for each row execute function public.enforce_authenticated_write_rate_limit_trigger('prompt_request_answer');
  end if;
end;
$$;

grant select on public.prompt_requests to anon, authenticated;
grant select on public.prompt_request_answers to anon, authenticated;
grant execute on function public.create_guest_prompt_request(text, text, text, text, text, text, text, text[]) to anon, authenticated;
grant execute on function public.create_guest_prompt_request_answer(uuid, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.update_guest_prompt_request_status(uuid, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
