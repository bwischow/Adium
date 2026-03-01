# Adium

**How good are your ads?** — Glassdoor for paid marketing data.

Adium lets advertisers compare their Google Ads and Meta Ads performance against anonymized industry peers, segmented by industry and spend tier.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database / Auth | Supabase (Postgres + RLS + Auth) |
| Hosting | Vercel |
| Charts | Recharts |
| Ad APIs | Google Ads API (GAQL), Meta Marketing API |

---

## Quick Start

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Once created, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` / public key
   - `service_role` key (click Reveal)
3. In the **SQL Editor**, run the entire contents of `supabase/migrations/001_initial_schema.sql`

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in your Supabase keys and ad platform credentials
```

### 3. Install and run

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Environment Variables

All variables live in `.env.local` (never commit this file).

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Google Ads API
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_REDIRECT_URI=http://localhost:3000/api/connect/google/callback

# Meta Ads API
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=http://localhost:3000/api/connect/meta/callback

# Cron job protection (any random string)
CRON_SECRET=...
```

---

## API Credentials Setup

### Google Ads

1. [Google Cloud Console](https://console.cloud.google.com/) → Create/select project
2. Enable **Google Ads API**
3. Create **OAuth 2.0 credentials** (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/connect/google/callback`
5. Apply for a **Developer Token** at [ads.google.com/aw/apicenter](https://ads.google.com/aw/apicenter)

### Meta (Facebook) Ads

1. [developers.facebook.com](https://developers.facebook.com/) → Create app
2. Add **Marketing API** product
3. Add redirect URI: `http://localhost:3000/api/connect/meta/callback`
4. Request `ads_read` and `ads_management` permissions

---

## Project Structure

```
app/
  (auth)/login|signup/    — Auth pages
  api/
    companies/            — Company CRUD
    connect/google|meta/  — OAuth start + callback
    benchmarks/[accountId]— Dashboard data API
    cron/nightly/         — Nightly pipeline endpoint
  companies/new/          — Onboarding: create company
  companies/[id]/connect/ — Connect ad account
  dashboard/              — Main dashboard
components/dashboard/     — Chart, sidebar, tabs, date picker
lib/
  supabase/               — Client + server Supabase helpers
  ingestion.ts            — Pull metrics from ad APIs
  pipeline.ts             — Nightly: spend tiers + benchmark aggregation
  metrics.ts              — Derived metric formulas
supabase/migrations/      — SQL schema + RLS + seed
types/index.ts            — Shared TypeScript types
vercel.json               — Cron schedule (4am UTC daily)
```

---

## Data Model

```
users → companies → ad_accounts → daily_metrics
                  ↘ account_spend_tiers
industries (static)
benchmark_cache (nightly aggregates)
```

Key rules:
- Industry is self-selected per company during onboarding
- Spend tier is a dynamic quartile (Q1–Q4) computed nightly from trailing 30-day spend within industry × platform
- Benchmarks require **5+ accounts** (industry-level) or **20+** (quartile-level) — below threshold shows no benchmark
- All benchmark data is aggregated; individual account data is never exposed

---

## Nightly Pipeline

Runs at 4am UTC via Vercel Cron (`vercel.json`):

1. **Data pull** — fetch yesterday's account-level metrics from Google Ads + Meta for all active accounts
2. **Spend tier calculation** — compute trailing 30d spend quartiles per industry × platform
3. **Benchmark aggregation** — compute avg/median/P25/P75 per segment and write to `benchmark_cache`

Trigger manually:
```bash
curl -X POST http://localhost:3000/api/cron/nightly \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... (repeat for each variable)
```

Production OAuth redirect URIs must be updated to your Vercel domain in both Google Cloud Console and Meta Developers.

---

## V1 Scope

**In:** auth, company CRUD, Google Ads + Meta OAuth, account-level daily ingestion, dynamic spend tiers, nightly benchmark pipeline, dashboard with line chart

**Out (future):** campaign-level benchmarks, team access, portfolio view, alerts, export, billing, TikTok/LinkedIn, custom industries
