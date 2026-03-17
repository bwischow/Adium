-- Notification preferences per user (email alerts)
create table notification_preferences (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  emails_enabled    boolean not null default true,
  drift_alerts      jsonb not null default '{"cpc":true,"cpm":true,"ctr":true,"roas":true,"cpa":true,"cpl":true}',
  benchmark_alerts  jsonb not null default '{"cpc":true,"cpm":true,"ctr":true,"roas":true,"cpa":true,"cpl":true}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id)
);

alter table notification_preferences enable row level security;

create policy "Users can manage own notification preferences"
  on notification_preferences for all using (auth.uid() = user_id);
