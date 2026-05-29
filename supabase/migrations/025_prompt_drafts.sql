create table if not exists public.prompt_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  prompt_body text not null check (char_length(prompt_body) between 1 and 12000),
  category text not null default '제품/광고',
  model text not null default 'GPT Image',
  aspect_ratio text not null default '4:5',
  style text not null default '',
  image_url text not null default '',
  image_urls text[] not null default '{}',
  tags text[] not null default '{}',
  source_urls text[] not null default '{}',
  source_notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'published', 'failed')),
  quality_score numeric(4, 2) check (quality_score is null or (quality_score >= 0 and quality_score <= 10)),
  risk_notes text not null default '',
  agent_name text not null default 'hermes',
  published_image_post_id uuid references public.image_posts(id) on delete set null,
  scheduled_for timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompt_drafts_status_created_at_idx
on public.prompt_drafts(status, created_at desc);

create index if not exists prompt_drafts_quality_score_idx
on public.prompt_drafts(quality_score desc nulls last);

alter table public.prompt_drafts enable row level security;

drop policy if exists "admins can read prompt drafts" on public.prompt_drafts;
create policy "admins can read prompt drafts"
on public.prompt_drafts for select
using (public.is_admin());

drop policy if exists "admins can create prompt drafts" on public.prompt_drafts;
create policy "admins can create prompt drafts"
on public.prompt_drafts for insert
with check (public.is_admin());

drop policy if exists "admins can update prompt drafts" on public.prompt_drafts;
create policy "admins can update prompt drafts"
on public.prompt_drafts for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete prompt drafts" on public.prompt_drafts;
create policy "admins can delete prompt drafts"
on public.prompt_drafts for delete
using (public.is_admin());

grant select, insert, update, delete on public.prompt_drafts to authenticated;
