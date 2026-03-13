/**
 * Nightly pipeline — runs in order:
 * 1. Pull yesterday's metrics for all active ad accounts
 * 2. Recalculate spend tiers (quartiles per industry × platform)
 * 3. Recompute benchmark_cache for yesterday
 *
 * Triggered by /api/cron/nightly (protected by CRON_SECRET).
 */

import { createClient } from '@supabase/supabase-js'
import { subDays, format } from 'date-fns'
import { pullGoogleAdsForAccount } from './ingestion'
import { deriveMetric } from './metrics'
import type { MetricName, Platform } from '@/types'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const METRICS: MetricName[] = ['cpc', 'cpm', 'ctr', 'roas', 'cpa']

// ---------------------------------------------------------------------------
// Step 1 — Data pull
// ---------------------------------------------------------------------------

export async function runDataPull(): Promise<void> {
  const supabase = getServiceClient()

  const { data: accounts, error } = await supabase
    .from('ad_accounts')
    .select('id, platform, platform_account_id, access_token, refresh_token, token_expires_at')
    .eq('is_active', true)

  if (error) throw error

  for (const account of accounts ?? []) {
    try {
      if (account.platform === 'google_ads') {
        await pullGoogleAdsForAccount(account)
      } else {
        // Meta — pull yesterday using the stored access token
        const yesterday = subDays(new Date(), 1)
        const params = new URLSearchParams({
          access_token:   account.access_token,
          time_range:     JSON.stringify({
            since: format(yesterday, 'yyyy-MM-dd'),
            until: format(yesterday, 'yyyy-MM-dd'),
          }),
          fields:         'date_start,impressions,clicks,spend,actions,action_values',
          level:          'account',
          time_increment: '1',
        })

        const res = await fetch(
          `https://graph.facebook.com/v19.0/${account.platform_account_id}/insights?${params}`
        )

        if (res.status === 401) {
          // Token expired — mark inactive and continue
          await supabase
            .from('ad_accounts')
            .update({ is_active: false })
            .eq('id', account.id)
          console.warn(`[pipeline] Meta token expired for account ${account.id}, marked inactive`)
          continue
        }

        const data = await res.json()
        const items: any[] = data.data ?? []

        if (items.length > 0) {
          const rows = items.map((item: any) => ({
            ad_account_id:    account.id,
            date:             item.date_start,
            impressions:      Number(item.impressions ?? 0),
            clicks:           Number(item.clicks ?? 0),
            spend:            Number(item.spend ?? 0),
            conversions:      extractActionValue(item.actions, 'purchase'),
            conversion_value: extractActionValue(item.action_values, 'purchase'),
            pulled_at:        new Date().toISOString(),
          }))

          await supabase
            .from('daily_metrics')
            .upsert(rows, { onConflict: 'ad_account_id,date' })
        }
      }
    } catch (err) {
      console.error(`[pipeline] data pull failed for account ${account.id}:`, err)
      // Continue with other accounts
    }
  }
}

function extractActionValue(actions: any[] | undefined, type: string): number {
  if (!actions) return 0
  const match = actions.find(a =>
    a.action_type === `offsite_conversion.fb_pixel_${type}` ||
    a.action_type === `omni_${type}`
  )
  return match ? Number(match.value) : 0
}

// ---------------------------------------------------------------------------
// Step 2 — Spend tier calculation
// ---------------------------------------------------------------------------

export async function runSpendTierCalculation(): Promise<void> {
  const supabase = getServiceClient()

  // Get all active accounts with their company industry
  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, company:companies(industry_id)')
    .eq('is_active', true)

  if (!accounts || accounts.length === 0) return

  // For each account, compute trailing 30d spend
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const spendMap: Map<string, { spend: number; industryId: number; platform: Platform }> = new Map()

  for (const account of accounts) {
    const company = Array.isArray(account.company) ? account.company[0] : account.company
    const industryId: number = company?.industry_id ?? 8  // fallback: Other

    const { data: metrics } = await supabase
      .from('daily_metrics')
      .select('spend')
      .eq('ad_account_id', account.id)
      .gte('date', thirtyDaysAgo)

    const totalSpend = (metrics ?? []).reduce((sum, r) => sum + Number(r.spend), 0)

    spendMap.set(account.id, {
      spend:      totalSpend,
      industryId,
      platform:   account.platform as Platform,
    })
  }

  // Group by industry × platform to compute quartile boundaries
  const groups = new Map<string, { id: string; spend: number }[]>()

  for (const [accountId, { spend, industryId, platform }] of Array.from(spendMap)) {
    const key = `${industryId}::${platform}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push({ id: accountId, spend })
  }

  const upsertRows: any[] = []

  for (const [key, entries] of Array.from(groups)) {
    const [industryIdStr, platform] = key.split('::')
    const industryId = Number(industryIdStr)

    // Sort ascending by spend for quartile assignment
    entries.sort((a, b) => a.spend - b.spend)
    const n = entries.length

    entries.forEach((entry, i) => {
      // Percentile rank → quartile (1-4)
      const pct = (i + 1) / n
      const quartile = pct <= 0.25 ? 1 : pct <= 0.5 ? 2 : pct <= 0.75 ? 3 : 4

      upsertRows.push({
        ad_account_id:      entry.id,
        industry_id:        industryId,
        platform,
        quartile,
        trailing_30d_spend: entry.spend,
        calculated_at:      new Date().toISOString(),
      })
    })
  }

  if (upsertRows.length > 0) {
    await supabase
      .from('account_spend_tiers')
      .upsert(upsertRows, { onConflict: 'ad_account_id' })

    console.log(`[pipeline] spend tiers updated for ${upsertRows.length} accounts`)
  }
}

// ---------------------------------------------------------------------------
// Step 3 — Benchmark aggregation
// ---------------------------------------------------------------------------

export async function runBenchmarkAggregation(targetDate?: string): Promise<void> {
  const supabase   = getServiceClient()
  const date = targetDate ?? format(subDays(new Date(), 1), 'yyyy-MM-dd')

  // Get all daily_metrics for the target date, joined with spend tier info
  const { data: rows } = await supabase
    .from('daily_metrics')
    .select(`
      impressions, clicks, spend, conversions, conversion_value,
      ad_account:ad_accounts!inner(
        id, platform,
        company:companies!inner(industry_id),
        spend_tier:account_spend_tiers(quartile)
      )
    `)
    .eq('date', date)

  if (!rows || rows.length === 0) {
    console.log(`[pipeline] no metrics for ${date}, skipping benchmark aggregation`)
    return
  }

  // Build a flat list: { metric values, industry_id, platform, quartile }
  type FlatRow = {
    cpc: number | null; cpm: number | null; ctr: number | null
    roas: number | null; cpa: number | null
    industryId: number; platform: string; quartile: number | null
  }

  const flat: FlatRow[] = rows.map((r: any) => {
    const account  = Array.isArray(r.ad_account) ? r.ad_account[0] : r.ad_account
    const company  = Array.isArray(account.company) ? account.company[0] : account.company
    const tierArr  = account.spend_tier ?? []
    const tier     = Array.isArray(tierArr) ? tierArr[0] : tierArr

    return {
      cpc:  deriveMetric(r, 'cpc'),
      cpm:  deriveMetric(r, 'cpm'),
      ctr:  deriveMetric(r, 'ctr'),
      roas: deriveMetric(r, 'roas'),
      cpa:  deriveMetric(r, 'cpa'),
      industryId: company?.industry_id ?? 8,
      platform:   account.platform,
      quartile:   tier?.quartile ?? null,
    }
  })

  // Aggregate by industry × platform × quartile (and also industry × platform only)
  type SegmentKey = string  // `${industryId}::${platform}::${quartile|null}`

  const segments = new Map<SegmentKey, FlatRow[]>()

  for (const row of flat) {
    // Per-quartile segment
    const key1 = `${row.industryId}::${row.platform}::${row.quartile}`
    if (!segments.has(key1)) segments.set(key1, [])
    segments.get(key1)!.push(row)

    // Full-industry segment (quartile = null)
    const key2 = `${row.industryId}::${row.platform}::null`
    if (!segments.has(key2)) segments.set(key2, [])
    segments.get(key2)!.push(row)
  }

  const cacheRows: any[] = []

  for (const [key, segRows] of Array.from(segments)) {
    const [industryIdStr, platform, quartileStr] = key.split('::')
    const industryId = Number(industryIdStr)
    const quartile   = quartileStr === 'null' ? null : Number(quartileStr)

    // Minimum account thresholds
    const threshold = quartile === null ? 5 : 20
    if (segRows.length < threshold) continue

    for (const metric of METRICS) {
      const values = segRows
        .map(r => r[metric])
        .filter((v): v is number => v !== null)
        .sort((a, b) => a - b)

      if (values.length === 0) continue

      cacheRows.push({
        industry_id:    industryId,
        platform,
        spend_quartile: quartile,
        date,
        metric_name:    metric,
        avg_value:      mean(values),
        median_value:   percentile(values, 50),
        p25_value:      percentile(values, 25),
        p75_value:      percentile(values, 75),
        p90_value:      percentile(values, 90),
        account_count:  values.length,
        calculated_at:  new Date().toISOString(),
      })
    }
  }

  if (cacheRows.length > 0) {
    await supabase
      .from('benchmark_cache')
      .upsert(cacheRows, {
        onConflict: 'industry_id,platform,spend_quartile,date,metric_name',
      })

    console.log(`[pipeline] benchmark_cache updated: ${cacheRows.length} rows for ${date}`)
  }
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}
