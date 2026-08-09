-- Run once in the Supabase SQL editor. Re-runnable.

-- ---------------------------------------------------------------------------
-- Runtime-editable rows. Unlike everything above these are written by the app
-- itself (server actions, service role) rather than by `npm run db:push`.

create table if not exists campaign_budgets (
  campaign_id       uuid primary key references campaigns (id) on delete cascade,
  -- Daily spend ceiling in dollars and daily impression ceiling.
  spend_limit       numeric not null,
  impression_limit  int     not null,
  updated_at        timestamptz not null default now()
);

-- Single-row table: the signed-in user's profile. `id` is pinned to 'me'.
create table if not exists user_profile (
  id          text primary key default 'me' check (id = 'me'),
  timezone    text not null,
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  company     text not null,
  country     text not null,
  phone       text not null,
  updated_at  timestamptz not null default now()
);

alter table campaign_budgets enable row level security;
alter table user_profile     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['campaign_budgets', 'user_profile']
  loop
    execute format('drop policy if exists %I on %I', t || '_read', t);
    execute format(
      'create policy %I on %I for select to anon, authenticated using (true)',
      t || '_read', t);
  end loop;
end $$;
