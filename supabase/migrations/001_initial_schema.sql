-- ============================================================
-- Adium — Initial Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type platform_type as enum ('google_ads', 'meta');

-- ------------------------------------------------------------
-- INDUSTRIES (static lookup, seeded below)
-- ------------------------------------------------------------
create table industries (
  id   serial primary key,
  name text not null,
  slug text not null unique
);

insert into industries (name, slug) values
  ('E-commerce / DTC',      'ecommerce-dtc'),
  ('SaaS / Software',       'saas-software'),
  ('Local Services',        'local-services'),
  ('Healthcare / Wellness', 'healthcare-wellness'),
  ('Financial Services',    'financial-services'),
  ('Education / EdTech',    'education-edtech'),
  ('Real Estate',           'real-estate'),
  ('Other',                 'other');

-- ------------------------------------------------------------
-- USER PROFILES (extends Supabase Auth users)
-- ------------------------------------------------------------
create table user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- COMPANIES
-- ------------------------------------------------------------
create table companies (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  industry_id int  not null references industries(id),
  created_at  timestamptz not null default now()
);

create index companies_user_id_idx on companies(user_id);

-- ------------------------------------------------------------
-- AD ACCOUNTS
-- ------------------------------------------------------------
create table ad_accounts (
  id                  uuid primary key default uuid_generate_v4(),
  company_id          uuid not null references companies(id) on delete cascade,
  platform            platform_type not null,
  platform_account_id text not null,
  account_name        text not null default '',
  access_token        text not null,
  refresh_token       text,
  token_expires_at    timestamptz,
  is_active           boolean not null default true,
  connected_at        timestamptz not null default now(),

  unique (platform, platform_account_id)
);

create index ad_accounts_company_id_idx on ad_accounts(company_id);

-- ------------------------------------------------------------
-- DAILY METRICS
-- ------------------------------------------------------------
create table daily_metrics (
  id               uuid primary key default uuid_generate_v4(),
  ad_account_id    uuid not null references ad_accounts(id) on delete cascade,
  date             date not null,
  impressions      bigint not null default 0,
  clicks           bigint not null default 0,
  spend            numeric(12,2) not null default 0,
  conversions      numeric(10,2) not null default 0,
  conversion_value numeric(12,2) not null default 0,
  pulled_at        timestamptz not null default now(),

  unique (ad_account_id, date)
);

create index daily_metrics_account_date_idx on daily_metrics(ad_account_id, date desc);

-- ------------------------------------------------------------
-- ACCOUNT SPEND TIERS (recalculated nightly)
-- ------------------------------------------------------------
create table account_spend_tiers (
  id                uuid primary key default uuid_generate_v4(),
  ad_account_id     uuid not null references ad_accounts(id) on delete cascade,
  industry_id       int  not null references industries(id),
  platform          platform_type not null,
  quartile          smallint not null check (quartile between 1 and 4),
  trailing_30d_spend numeric(12,2) not null default 0,
  calculated_at     timestamptz not null default now(),

  unique (ad_account_id)
);

-- ------------------------------------------------------------
-- BENCHMARK CACHE (precomputed nightly)
-- ------------------------------------------------------------
create table benchmark_cache (
  id             uuid primary key default uuid_generate_v4(),
  industry_id    int not null references industries(id),
  platform       platform_type not null,
  spend_quartile smallint,  -- NULL = full-industry fallback
  date           date not null,
  metric_name    text not null,
  avg_value      numeric(12,4),
  median_value   numeric(12,4),
  p25_value      numeric(12,4),
  p75_value      numeric(12,4),
  account_count  int not null default 0,
  calculated_at  timestamptz not null default now(),

  unique (industry_id, platform, spend_quartile, date, metric_name)
);

create index benchmark_cache_lookup_idx
  on benchmark_cache(industry_id, platform, spend_quartile, metric_name, date desc);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

-- user_profiles: users can only read/update their own profile
alter table user_profiles enable row level security;
create policy "Users can read own profile"
  on user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on user_profiles for update using (auth.uid() = id);

-- companies: users can only CRUD their own companies
alter table companies enable row level security;
create policy "Users can manage own companies"
  on companies for all using (auth.uid() = user_id);

-- ad_accounts: users can manage accounts belonging to their companies
alter table ad_accounts enable row level security;
create policy "Users can manage ad accounts of own companies"
  on ad_accounts for all using (
    exists (
      select 1 from companies
      where companies.id = ad_accounts.company_id
        and companies.user_id = auth.uid()
    )
  );

-- daily_metrics: readable if the ad_account belongs to the user
alter table daily_metrics enable row level security;
create policy "Users can read own daily metrics"
  on daily_metrics for select using (
    exists (
      select 1 from ad_accounts
      join companies on companies.id = ad_accounts.company_id
      where ad_accounts.id = daily_metrics.ad_account_id
        and companies.user_id = auth.uid()
    )
  );

-- account_spend_tiers: readable if the ad_account belongs to the user
alter table account_spend_tiers enable row level security;
create policy "Users can read own spend tiers"
  on account_spend_tiers for select using (
    exists (
      select 1 from ad_accounts
      join companies on companies.id = ad_accounts.company_id
      where ad_accounts.id = account_spend_tiers.ad_account_id
        and companies.user_id = auth.uid()
    )
  );

-- industries: public read
alter table industries enable row level security;
create policy "Industries are publicly readable"
  on industries for select using (true);

-- benchmark_cache: public read (already anonymized aggregates)
alter table benchmark_cache enable row level security;
create policy "Benchmark cache is publicly readable"
  on benchmark_cache for select using (true);
