create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  visitor_key text check (visitor_key is null or char_length(visitor_key) between 8 and 80),
  target_type text not null,
  target_id text not null check (char_length(target_id) between 1 and 80),
  target_title text not null default '' check (char_length(target_title) <= 200),
  target_path text not null default '' check (char_length(target_path) <= 300),
  reason text not null check (char_length(reason) between 2 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  existing_constraint text;
begin
  select constraint_name
  into existing_constraint
  from information_schema.check_constraints
  where constraint_schema = 'public'
  and constraint_name in (
    select conname
    from pg_constraint
    where conrelid = 'public.content_reports'::regclass
    and contype = 'c'
  )
  and check_clause like '%target_type%'
  limit 1;

  if existing_constraint is not null then
    execute format('alter table public.content_reports drop constraint %I', existing_constraint);
  end if;

  alter table public.content_reports
  add constraint content_reports_target_type_check
  check (
    target_type in (
      'example_prompt',
      'image_post',
      'board_post',
      'comment',
      'prompt_comment',
      'prompt_request',
      'prompt_request_answer'
    )
  );
end;
$$;

create index if not exists content_reports_status_idx
on public.content_reports(status, created_at desc);

create index if not exists content_reports_target_idx
on public.content_reports(target_type, target_id);

alter table public.content_reports enable row level security;

drop policy if exists "admins can read content reports" on public.content_reports;
create policy "admins can read content reports"
on public.content_reports for select
using (public.is_admin());

drop policy if exists "admins can update content reports" on public.content_reports;
create policy "admins can update content reports"
on public.content_reports for update
using (public.is_admin())
with check (public.is_admin());

create or replace function public.create_content_report(
  p_target_type text,
  p_target_id text,
  p_target_title text,
  p_target_path text,
  p_reason text,
  p_visitor_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_report_id uuid;
  clean_type text := trim(p_target_type);
  clean_target_id text := left(trim(p_target_id), 80);
  clean_title text := left(trim(coalesce(p_target_title, '')), 200);
  clean_path text := left(trim(coalesce(p_target_path, '')), 300);
  clean_reason text := left(trim(p_reason), 1000);
  clean_key text := nullif(left(trim(coalesce(p_visitor_key, '')), 80), '');
begin
  if clean_type not in (
    'example_prompt',
    'image_post',
    'board_post',
    'comment',
    'prompt_comment',
    'prompt_request',
    'prompt_request_answer'
  ) then
    raise exception '신고 대상이 올바르지 않습니다.';
  end if;

  if char_length(clean_target_id) < 1 then
    raise exception '신고 대상을 찾을 수 없습니다.';
  end if;

  if char_length(clean_reason) < 2 then
    raise exception '신고 사유는 2자 이상 입력해야 합니다.';
  end if;

  if clean_key is not null and char_length(clean_key) < 8 then
    raise exception '방문자 정보가 올바르지 않습니다.';
  end if;

  if clean_type = 'image_post' and not exists (
    select 1 from public.image_posts where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'board_post' and not exists (
    select 1 from public.board_posts where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'comment' and not exists (
    select 1 from public.comments where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'prompt_comment' and not exists (
    select 1 from public.prompt_comments where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'prompt_request' and not exists (
    select 1 from public.prompt_requests where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  elsif clean_type = 'prompt_request_answer' and not exists (
    select 1 from public.prompt_request_answers where id = clean_target_id::uuid and is_hidden = false
  ) then
    raise exception '신고 대상을 찾을 수 없습니다.';
  end if;

  insert into public.content_reports (
    reporter_id,
    visitor_key,
    target_type,
    target_id,
    target_title,
    target_path,
    reason
  )
  values (
    auth.uid(),
    clean_key,
    clean_type,
    clean_target_id,
    clean_title,
    clean_path,
    clean_reason
  )
  returning id into new_report_id;

  return new_report_id;
end;
$$;

grant select, update on public.content_reports to authenticated;
grant execute on function public.create_content_report(text, text, text, text, text, text)
to anon, authenticated;
