-- Run once in the Supabase SQL editor. Re-runnable.
-- Widens campaign_budgets so the whole budget — not just the limits — is editable.
-- Defaults match the flight the cloned page shows, so the existing row keeps them.

alter table campaign_budgets
  add column if not exists starts_at   timestamptz not null default '2026-07-28T07:03:00Z',
  add column if not exists ends_at     timestamptz not null default '2026-07-31T23:59:00Z',
  add column if not exists even_pacing boolean     not null default false;
