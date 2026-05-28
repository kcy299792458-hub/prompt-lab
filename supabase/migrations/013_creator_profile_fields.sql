alter table public.profiles
  add column if not exists bio text not null default '' check (char_length(bio) <= 180),
  add column if not exists specialty text not null default '' check (char_length(specialty) <= 120),
  add column if not exists website_url text not null default '' check (char_length(website_url) <= 300),
  add column if not exists instagram_url text not null default '' check (char_length(instagram_url) <= 300),
  add column if not exists x_url text not null default '' check (char_length(x_url) <= 300);
