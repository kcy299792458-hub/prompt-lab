create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  );
$$;

drop policy if exists "admins can moderate image posts" on public.image_posts;
create policy "admins can moderate image posts"
on public.image_posts for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can moderate board posts" on public.board_posts;
create policy "admins can moderate board posts"
on public.board_posts for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can moderate comments" on public.comments;
create policy "admins can moderate comments"
on public.comments for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can moderate prompt comments" on public.prompt_comments;
create policy "admins can moderate prompt comments"
on public.prompt_comments for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can moderate prompt requests" on public.prompt_requests;
create policy "admins can moderate prompt requests"
on public.prompt_requests for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can moderate prompt request answers" on public.prompt_request_answers;
create policy "admins can moderate prompt request answers"
on public.prompt_request_answers for update
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.is_admin() to anon, authenticated;
