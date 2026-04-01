-- 009_waitlist.sql — Waitlist signups table

create table waitlist_signups (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  company    text not null,
  industry   text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive unique constraint on email
create unique index waitlist_signups_email_unique
  on waitlist_signups (lower(email));

-- RLS enabled with no policies = only service role can access
alter table waitlist_signups enable row level security;
