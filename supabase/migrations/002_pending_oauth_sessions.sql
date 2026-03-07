-- ============================================================
-- Adium — Pending OAuth Sessions
-- Stores temporary OAuth session data server-side during the
-- account selection step (replaces the cookie-based approach).
-- ============================================================

create table pending_oauth_sessions (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references companies(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  platform      platform_type not null,
  access_token  text not null,
  refresh_token text,
  expires_in    int,
  accounts      jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  consumed_at   timestamptz  -- set when accounts are selected; prevents replay
);

-- Index for cleanup queries (delete stale unconsumed sessions)
create index pending_oauth_sessions_cleanup_idx
  on pending_oauth_sessions(created_at)
  where consumed_at is null;

-- RLS enabled with no policies = service-role only access
alter table pending_oauth_sessions enable row level security;
