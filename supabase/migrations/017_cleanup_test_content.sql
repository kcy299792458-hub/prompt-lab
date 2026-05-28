update public.board_posts
set is_hidden = true, updated_at = now()
where title like '[테스트]%'
and is_hidden = false;

update public.prompt_requests
set is_hidden = true, updated_at = now()
where title like '[테스트]%'
and is_hidden = false;

notify pgrst, 'reload schema';
