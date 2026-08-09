-- Epom DSP clone — build-time data store.
-- Run once in the Supabase SQL editor (or `psql "$DATABASE_URL" -f supabase/schema.sql`),
-- then `npm run db:push` to seed and `npm run db:pull` to regenerate src/lib/*.ts.
--
-- Only the two generated sources live here: the campaign roster (with its days and
-- creatives) and the creative-asset library. Audiences, the billing ledger and every
-- funnel metric stay derived in TypeScript — they are functions of these rows.
--
-- `ordinal` on every table preserves the array order the TS files are written back in.

create table if not exists campaigns (
  id                uuid primary key,
  ordinal           int  not null,
  slug              text not null unique,
  name              text not null,
  product           text not null,
  product_label     text not null,
  -- Payout per conversion and bid ceiling per impression, in dollars.
  payout            numeric not null,
  default_price     numeric not null,
  ecpm              numeric not null,
  -- Paused by the buyer rather than run to the end of its flight.
  paused            boolean not null default false,
  -- Fake roster entry added for demo purposes — sorts below the real campaigns.
  synthetic         boolean not null default false,
  starts_on         date not null,
  ends_on           date not null,
  -- The offer this campaign buys for, flattened out of `Campaign.offer`.
  offer_id          text not null,
  offer_network_id  text not null,
  offer_network     text not null,
  offer_app         text not null,
  offer_site        text not null,
  offer_raw         text not null
);

-- Real per-day traffic. Impressions are present only on days the source measured them.
create table if not exists campaign_days (
  campaign_id  uuid not null references campaigns (id) on delete cascade,
  day          date not null,
  clicks       int  not null,
  conversions  int  not null,
  impressions  int,
  primary key (campaign_id, day)
);

create table if not exists campaign_creatives (
  id           text primary key,
  campaign_id  uuid not null references campaigns (id) on delete cascade,
  ordinal      int  not null,
  name         text not null,
  src          text not null,
  video        boolean not null,
  size         text not null,
  price        text not null
);

create table if not exists creative_folders (
  id       text primary key,
  ordinal  int  not null,
  name     text not null
);

create table if not exists creative_assets (
  id             text primary key,
  ordinal        int  not null,
  name           text not null,
  folder_id      text not null references creative_folders (id) on delete cascade,
  preview_url    text not null,
  dimensions     text not null,
  width          int,
  height         int,
  file_size_kb   int  not null,
  type           text not null check (type in ('JPG', 'PNG', 'GIF', 'MP4', 'HTML5')),
  created_on     date not null
);

-- The site is a public read-only clone: anon may select, only the service role writes.
alter table campaigns          enable row level security;
alter table campaign_days      enable row level security;
alter table campaign_creatives enable row level security;
alter table creative_folders   enable row level security;
alter table creative_assets    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['campaigns', 'campaign_days', 'campaign_creatives',
                           'creative_folders', 'creative_assets']
  loop
    -- Policies have no IF NOT EXISTS, so drop first to keep this file re-runnable.
    execute format('drop policy if exists %I on %I', t || '_read', t);
    execute format(
      'create policy %I on %I for select to anon, authenticated using (true)',
      t || '_read', t);
  end loop;
end $$;

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
-- Run once in the Supabase SQL editor. Re-runnable.
-- Widens campaign_budgets so the whole budget — not just the limits — is editable.
-- Defaults match the flight the cloned page shows, so the existing row keeps them.

alter table campaign_budgets
  add column if not exists starts_at   timestamptz not null default '2026-07-28T07:03:00Z',
  add column if not exists ends_at     timestamptz not null default '2026-07-31T23:59:00Z',
  add column if not exists even_pacing boolean     not null default false;
