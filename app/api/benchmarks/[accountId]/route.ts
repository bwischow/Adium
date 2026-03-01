/**
 * GET /api/benchmarks/:accountId
 * Query params: metric, start_date, end_date
 *
 * Returns two time series:
 *   userSeries  — user's own daily derived metric values
 *   benchmarkSeries — median + P25/P75 from benchmark_cache for their segment
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deriveMetric } from '@/lib/metrics'
import type { MetricName, DashboardData, Platform, SpendQuartile } from '@/types'
import { SPEND_TIER_LABELS } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const metric     = (searchParams.get('metric') ?? 'ctr') as MetricName
  const startDate  = searchParams.get('start_date') ?? ''
  const endDate    = searchParams.get('end_date')   ?? ''

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'start_date and end_date required' }, { status: 400 })
  }

  // Verify the account belongs to the user
  const { data: account, error: accountErr } = await supabase
    .from('ad_accounts')
    .select('id, platform, company:companies!inner(industry_id, user_id)')
    .eq('id', params.accountId)
    .single()

  if (accountErr || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const company = Array.isArray(account.company) ? account.company[0] : account.company
  if (company.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const platform   = account.platform as Platform
  const industryId = company.industry_id as number

  // --- User's daily metrics ---
  const { data: rawMetrics } = await supabase
    .from('daily_metrics')
    .select('date, impressions, clicks, spend, conversions, conversion_value')
    .eq('ad_account_id', params.accountId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  const userSeries = (rawMetrics ?? []).map(row => ({
    date:  row.date,
    value: deriveMetric(row, metric),
  }))

  // --- Spend tier for this account ---
  const { data: tierRow } = await supabase
    .from('account_spend_tiers')
    .select('quartile')
    .eq('ad_account_id', params.accountId)
    .single()

  const quartile = tierRow?.quartile as SpendQuartile | null | undefined
  const spendTierLabel = quartile ? SPEND_TIER_LABELS[quartile] : null

  // Try quartile-level benchmark first; fall back to full-industry
  const benchmarkQuery = (q: number | null) =>
    supabase
      .from('benchmark_cache')
      .select('date, median_value, p25_value, p75_value, account_count')
      .eq('industry_id', industryId)
      .eq('platform', platform)
      .eq('metric_name', metric)
      .gte('date', startDate)
      .lte('date', endDate)
      .is('spend_quartile', q)
      .order('date', { ascending: true })

  let { data: benchRows } = quartile
    ? await benchmarkQuery(quartile)
    : await benchmarkQuery(null)

  // If quartile-level is empty, fall back to full-industry
  if ((!benchRows || benchRows.length === 0) && quartile) {
    const fallback = await benchmarkQuery(null)
    benchRows = fallback.data
  }

  const benchmarkSeries = (benchRows ?? []).map(row => ({
    date:   row.date,
    median: row.median_value,
    p25:    row.p25_value,
    p75:    row.p75_value,
  }))

  // Determine if there are enough peers for meaningful benchmarks
  const maxCount = benchRows?.reduce((m, r) => Math.max(m, r.account_count ?? 0), 0) ?? 0
  const hasEnoughPeers = maxCount >= 5

  const result: DashboardData = {
    userSeries,
    benchmarkSeries,
    accountCount: maxCount,
    hasEnoughPeers,
    spendTierLabel,
  }

  return NextResponse.json(result)
}
