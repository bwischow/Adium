/**
 * Alert detection and email notification logic.
 * Called as Step 4 of the nightly pipeline after benchmark aggregation.
 */

import { createClient } from '@supabase/supabase-js'
import { subDays, format } from 'date-fns'
import { deriveMetric } from './metrics'
import { sendEmail } from './email'
import { buildDriftAlertEmail, buildBenchmarkSummaryEmail } from './email-templates'
import { METRIC_LABELS, METRIC_FORMATS, PLATFORM_LABELS } from '@/types'
import type { MetricName, Platform } from '@/types'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ALL_METRICS: MetricName[] = ['cpc', 'cpm', 'ctr', 'roas', 'cpa', 'cpl']
const DRIFT_THRESHOLD = 0.20
const LOWER_IS_BETTER: MetricName[] = ['cpc', 'cpm', 'cpa', 'cpl']

interface MetricPrefs {
  cpc: boolean; cpm: boolean; ctr: boolean; roas: boolean; cpa: boolean; cpl: boolean
}

function isNegativeDrift(
  metric: MetricName,
  userValue: number,
  benchmarkP50: number
): { drifted: boolean; direction: 'above' | 'below'; pctDiff: number } {
  if (benchmarkP50 === 0) return { drifted: false, direction: 'above', pctDiff: 0 }

  const pctDiff = (userValue - benchmarkP50) / benchmarkP50
  const absPct = Math.abs(pctDiff)

  if (absPct <= DRIFT_THRESHOLD) {
    return { drifted: false, direction: pctDiff > 0 ? 'above' : 'below', pctDiff: Math.round(absPct * 100) }
  }

  // For cost metrics (lower is better), "above" benchmark is negative
  // For performance metrics (higher is better), "below" benchmark is negative
  const isAbove = pctDiff > 0
  const isNegative = LOWER_IS_BETTER.includes(metric) ? isAbove : !isAbove

  return {
    drifted: isNegative,
    direction: isAbove ? 'above' : 'below',
    pctDiff: Math.round(absPct * 100),
  }
}

function getPercentileRank(
  userValue: number,
  p50: number,
  p75: number,
  p90: number,
  metric: MetricName
): string {
  const lowerBetter = LOWER_IS_BETTER.includes(metric)

  if (lowerBetter) {
    // p90 < p75 < p50 for cost metrics (lower = better performers)
    if (userValue <= p90) return 'Top 10%'
    if (userValue <= p75) return 'Top 25%'
    if (userValue <= p50) return 'Top 50%'
    return 'Below P50'
  } else {
    if (userValue >= p90) return 'Top 10%'
    if (userValue >= p75) return 'Top 25%'
    if (userValue >= p50) return 'Top 50%'
    return 'Below P50'
  }
}

export async function sendNotificationEmails(): Promise<void> {
  const supabase = getServiceClient()
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  // Get all users with notifications enabled
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('user_id, drift_alerts, benchmark_alerts, emails_enabled')
    .eq('emails_enabled', true)

  if (!prefs || prefs.length === 0) {
    console.log('[alerts] No users with notifications enabled')
    return
  }

  for (const pref of prefs) {
    try {
      await processUserAlerts(supabase, pref, yesterday)
    } catch (err) {
      console.error(`[alerts] Error processing user ${pref.user_id}:`, err)
    }
  }
}

async function processUserAlerts(
  supabase: ReturnType<typeof getServiceClient>,
  pref: { user_id: string; drift_alerts: MetricPrefs; benchmark_alerts: MetricPrefs },
  targetDate: string
) {
  // Get user email
  const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(pref.user_id)
  if (userErr || !user?.email) return

  // Get user's companies and active ad accounts
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, industry_id')
    .eq('user_id', pref.user_id)

  if (!companies || companies.length === 0) return

  for (const company of companies) {
    const { data: accounts } = await supabase
      .from('ad_accounts')
      .select('id, account_name, platform, company_id')
      .eq('company_id', company.id)
      .eq('is_active', true)

    if (!accounts || accounts.length === 0) continue

    for (const account of accounts) {
      // Get yesterday's metrics for this account
      const { data: metricsRow } = await supabase
        .from('daily_metrics')
        .select('impressions, clicks, spend, conversions, conversion_value, leads')
        .eq('ad_account_id', account.id)
        .eq('date', targetDate)
        .single()

      if (!metricsRow) continue

      // Get spend tier
      const { data: tierRow } = await supabase
        .from('account_spend_tiers')
        .select('quartile')
        .eq('ad_account_id', account.id)
        .single()

      const quartile = tierRow?.quartile ?? null

      // Get benchmarks for this segment
      let benchmarkQuery = supabase
        .from('benchmark_cache')
        .select('metric_name, median_value, p75_value, p90_value')
        .eq('industry_id', company.industry_id)
        .eq('platform', account.platform)
        .eq('date', targetDate)

      if (quartile) {
        benchmarkQuery = benchmarkQuery.eq('spend_quartile', quartile)
      } else {
        benchmarkQuery = benchmarkQuery.is('spend_quartile', null)
      }

      const { data: benchRows } = await benchmarkQuery

      if (!benchRows || benchRows.length === 0) continue

      const benchmarkMap = new Map(
        benchRows.map(r => [r.metric_name, { p50: r.median_value, p75: r.p75_value, p90: r.p90_value }])
      )

      // --- Drift alerts ---
      const driftAlerts = pref.drift_alerts
      const drifts: Array<{
        metric: MetricName
        userValue: number
        benchmarkP50: number
        direction: 'above' | 'below'
        pctDiff: number
      }> = []

      for (const metric of ALL_METRICS) {
        if (!driftAlerts[metric]) continue

        const userValue = deriveMetric(metricsRow, metric)
        const bench = benchmarkMap.get(metric)
        if (userValue == null || !bench) continue

        const result = isNegativeDrift(metric, userValue, bench.p50)
        if (result.drifted) {
          drifts.push({
            metric,
            userValue,
            benchmarkP50: bench.p50,
            direction: result.direction,
            pctDiff: result.pctDiff,
          })
        }
      }

      if (drifts.length > 0) {
        const { subject, html } = buildDriftAlertEmail({
          companyName: company.name,
          accountName: account.account_name,
          platform: PLATFORM_LABELS[account.platform as Platform] ?? account.platform,
          drifts,
        })
        await sendEmail({ to: user.email, subject, html })
        console.log(`[alerts] Sent drift alert to ${user.email} for ${account.account_name} (${drifts.length} metrics)`)
      }

      // --- Benchmark summary ---
      const benchAlerts = pref.benchmark_alerts
      const hasAnyBenchmarkAlert = ALL_METRICS.some(m => benchAlerts[m])
      if (!hasAnyBenchmarkAlert) continue

      const benchmarkMetrics = ALL_METRICS
        .filter(m => benchAlerts[m])
        .map(m => {
          const userValue = deriveMetric(metricsRow, m)
          const bench = benchmarkMap.get(m)
          if (!bench) return null
          return {
            metric: m,
            benchmarkP50: bench.p50,
            userValue,
            percentileRank: userValue != null
              ? getPercentileRank(userValue, bench.p50, bench.p75, bench.p90, m)
              : '\u2014',
          }
        })
        .filter((m): m is NonNullable<typeof m> => m !== null)

      if (benchmarkMetrics.length > 0) {
        const { subject, html } = buildBenchmarkSummaryEmail({
          companyName: company.name,
          date: targetDate,
          metrics: benchmarkMetrics,
        })
        await sendEmail({ to: user.email, subject, html })
        console.log(`[alerts] Sent benchmark summary to ${user.email} for ${company.name}`)
      }
    }
  }
}
