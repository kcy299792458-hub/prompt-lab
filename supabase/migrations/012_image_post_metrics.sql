alter table public.image_posts
  add column if not exists view_count integer not null default 0 check (view_count >= 0),
  add column if not exists copy_count integer not null default 0 check (copy_count >= 0);

create table if not exists public.image_post_metric_events (
  id uuid primary key default gen_random_uuid(),
  image_post_id uuid not null references public.image_posts(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'copy')),
  visitor_key text not null check (char_length(visitor_key) between 8 and 80),
  event_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists image_post_metric_events_post_idx
on public.image_post_metric_events(image_post_id, event_type, created_at desc);

create unique index if not exists image_post_metric_events_daily_view_idx
on public.image_post_metric_events(image_post_id, visitor_key, event_type, event_date)
where event_type = 'view';

alter table public.image_post_metric_events enable row level security;

drop policy if exists "admins can read image post metric events" on public.image_post_metric_events;
create policy "admins can read image post metric events"
on public.image_post_metric_events for select
using (public.is_admin());

create or replace function public.record_image_post_metric(
  p_image_post_id uuid,
  p_event_type text,
  p_visitor_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_type text := lower(trim(p_event_type));
  clean_key text := left(trim(coalesce(p_visitor_key, '')), 80);
  inserted_count integer := 0;
  next_view_count integer := 0;
  next_copy_count integer := 0;
begin
  if clean_type not in ('view', 'copy') then
    raise exception '기록할 항목이 올바르지 않습니다.';
  end if;

  if char_length(clean_key) < 8 then
    raise exception '방문자 정보가 올바르지 않습니다.';
  end if;

  if not exists (
    select 1 from public.image_posts
    where id = p_image_post_id
    and is_hidden = false
  ) then
    raise exception '이미지 게시글을 찾을 수 없습니다.';
  end if;

  if clean_type = 'view' then
    insert into public.image_post_metric_events (
      image_post_id,
      event_type,
      visitor_key
    )
    values (
      p_image_post_id,
      clean_type,
      clean_key
    )
    on conflict do nothing;

    get diagnostics inserted_count = row_count;

    if inserted_count > 0 then
      update public.image_posts
      set view_count = view_count + 1
      where id = p_image_post_id;
    end if;
  else
    insert into public.image_post_metric_events (
      image_post_id,
      event_type,
      visitor_key
    )
    values (
      p_image_post_id,
      clean_type,
      clean_key
    );

    update public.image_posts
    set copy_count = copy_count + 1
    where id = p_image_post_id;
  end if;

  select image_posts.view_count, image_posts.copy_count
  into next_view_count, next_copy_count
  from public.image_posts
  where id = p_image_post_id;

  return jsonb_build_object(
    'view_count', next_view_count,
    'copy_count', next_copy_count
  );
end;
$$;

grant execute on function public.record_image_post_metric(uuid, text, text)
to anon, authenticated;
