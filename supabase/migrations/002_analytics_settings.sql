-- Run once in the Supabase SQL editor. Re-runnable.
-- Stores the three "User Analytics Settings" action slots.

create table if not exists user_analytics_settings (
  id               text primary key default 'me' check (id = 'me'),
  action_0_title   text not null default 'Action 0',
  action_0_multi   boolean not null default false,
  action_1_title   text not null default 'Action 1',
  action_1_multi   boolean not null default false,
  action_2_title   text not null default 'Action 2',
  action_2_multi   boolean not null default false,
  updated_at       timestamptz not null default now()
);

alter table user_analytics_settings enable row level security;

do $$
begin
  execute 'drop policy if exists user_analytics_settings_read on user_analytics_settings';
  execute 'create policy user_analytics_settings_read on user_analytics_settings for select to anon, authenticated using (true)';
end $$;
