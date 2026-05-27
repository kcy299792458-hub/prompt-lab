create table if not exists public.prompt_reactions (
  id uuid primary key default gen_random_uuid(),
  prompt_id integer not null check (prompt_id > 0),
  visitor_key text not null check (char_length(visitor_key) between 8 and 80),
  kind text not null check (kind in ('like', 'save')),
  created_at timestamptz not null default now(),
  unique (prompt_id, visitor_key, kind)
);

create table if not exists public.prompt_comments (
  id uuid primary key default gen_random_uuid(),
  prompt_id integer not null check (prompt_id > 0),
  guest_nickname text not null check (char_length(guest_nickname) between 2 and 24),
  guest_password_hash text not null,
  body text not null check (char_length(body) between 1 and 3000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompt_reactions_prompt_idx
on public.prompt_reactions(prompt_id, kind);

create index if not exists prompt_comments_prompt_idx
on public.prompt_comments(prompt_id, created_at);

alter table public.prompt_reactions enable row level security;
alter table public.prompt_comments enable row level security;

drop policy if exists "prompt reactions are readable" on public.prompt_reactions;
create policy "prompt reactions are readable"
on public.prompt_reactions for select
using (true);

drop policy if exists "visible prompt comments are readable" on public.prompt_comments;
create policy "visible prompt comments are readable"
on public.prompt_comments for select
using (is_hidden = false);

create or replace function public.toggle_prompt_reaction(
  p_prompt_id integer,
  p_visitor_key text,
  p_kind text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_key text;
  clean_kind text;
begin
  clean_key := left(trim(p_visitor_key), 80);
  clean_kind := trim(p_kind);

  if p_prompt_id <= 0 then
    raise exception 'Invalid prompt id.';
  end if;

  if char_length(clean_key) < 8 then
    raise exception 'Invalid visitor key.';
  end if;

  if clean_kind not in ('like', 'save') then
    raise exception 'Invalid reaction kind.';
  end if;

  if exists (
    select 1
    from public.prompt_reactions
    where prompt_id = p_prompt_id
    and visitor_key = clean_key
    and kind = clean_kind
  ) then
    delete from public.prompt_reactions
    where prompt_id = p_prompt_id
    and visitor_key = clean_key
    and kind = clean_kind;

    return false;
  end if;

  insert into public.prompt_reactions (prompt_id, visitor_key, kind)
  values (p_prompt_id, clean_key, clean_kind);

  return true;
end;
$$;

create or replace function public.create_guest_prompt_comment(
  p_prompt_id integer,
  p_body text,
  p_guest_nickname text,
  p_password text
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
  and is_hidden = false;

  if not found then
    raise exception 'Comment not found.';
  end if;

  if matched_comment.guest_password_hash <> extensions.crypt(p_password, matched_comment.guest_password_hash) then
    raise exception 'Password does not match.';
  end if;

  update public.prompt_comments
  set is_hidden = true, updated_at = now()
  where id = p_comment_id;
end;
$$;

grant select on public.prompt_reactions to anon, authenticated;
grant select on public.prompt_comments to anon, authenticated;
grant execute on function public.toggle_prompt_reaction(integer, text, text) to anon, authenticated;
grant execute on function public.create_guest_prompt_comment(integer, text, text, text) to anon, authenticated;
grant execute on function public.delete_guest_prompt_comment(uuid, text) to anon, authenticated;
