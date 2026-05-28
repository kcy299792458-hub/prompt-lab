update public.board_posts
set is_hidden = true, updated_at = now()
where id in (
  'b9a43771-2758-463e-a090-52514bc6e6bb',
  '2469015d-19e0-450e-80d0-59b982dd184b'
)
and is_hidden = false;

update public.prompt_request_answers
set is_hidden = true, updated_at = now()
where prompt_request_id in (
  select id
  from public.prompt_requests
  where is_hidden = true
)
and is_hidden = false;

notify pgrst, 'reload schema';
