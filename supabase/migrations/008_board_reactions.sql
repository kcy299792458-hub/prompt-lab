create table if not exists public.board_reactions (
  id uuid primary key default gen_random_uuid(),
  board_post_id uuid not null references public.board_posts(id) on delete cascade,
  visitor_key text not null check (char_length(visitor_key) between 8 and 80),
  kind text not null default 'recommend' check (kind = 'recommend'),
  created_at timestamptz not null default now(),
  unique (board_post_id, visitor_key, kind)
);

create index if not exists board_reactions_post_idx
on public.board_reactions(board_post_id, kind);

alter table public.board_reactions enable row level security;

drop policy if exists "board reactions are readable" on public.board_reactions;
create policy "board reactions are readable"
on public.board_reactions for select
using (true);

create or replace function public.toggle_board_reaction(
  p_board_post_id uuid,
  p_visitor_key text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_key text;
begin
  clean_key := left(trim(p_visitor_key), 80);

  if p_board_post_id is null then
    raise exception 'Invalid board post id.';
  end if;

  if char_length(clean_key) < 8 then
    raise exception 'Invalid visitor key.';
  end if;

  if not exists (
    select 1
    from public.board_posts
    where id = p_board_post_id
    and is_hidden = false
  ) then
    raise exception 'Board post not found.';
  end if;

  if exists (
    select 1
    from public.board_reactions
    where board_post_id = p_board_post_id
    and visitor_key = clean_key
    and kind = 'recommend'
  ) then
    delete from public.board_reactions
    where board_post_id = p_board_post_id
    and visitor_key = clean_key
    and kind = 'recommend';

    return false;
  end if;

  insert into public.board_reactions (board_post_id, visitor_key, kind)
  values (p_board_post_id, clean_key, 'recommend');

  return true;
end;
$$;

grant select on public.board_reactions to anon, authenticated;
grant execute on function public.toggle_board_reaction(uuid, text) to anon, authenticated;
