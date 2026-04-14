/**
 * GET /api/accounts/:accountId/metrics
 * Returns computed KPI metrics for the given date range.
 * Query params: start_date, end_date, compare (optional: "previous" to include prior period)
 *
 * Returns: { current: MetricSnapshot, previous?: MetricSnapshot }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, format, differenceInDays, parseISO } from 'date-fns'

export interface MetricSnapshot {
  impressions: number
  clicks: number
  spend: number
  conversions: number
  all_conversions: number
  conversion_value: number
  leads: number
  ctr: number | null
  cpc: number | null
  cpm: number | null
  cpa: number | null
  cpl: number | null
  roas: number | null
  days: number
}

function computeSnapshot(rows: any[]): MetricSnapshot {
  const impressions      = rows.reduce((s, r) => s + Number(r.impressions ?? 0), 0)
  const clicks           = rows.reduce((s, r) => s + Number(r.clicks ?? 0), 0)
  const spend            = rows.reduce((s, r) => s + Number(r.spend ?? 0), 0)
  const conversions      = rows.reduce((s, r) => s + Number(r.conversions ?? 0), 0)
  const all_conversions  = rows.reduce((s, r) => s + Number(r.all_conversions ?? 0), 0)
  const conversion_value = rows.reduce((s, r) => s + Number(r.conversion_value ?? 0), 0)
  const leads            = rows.reduce((s, r) => s + Number(r.leads ?? 0), 0)

  return {
    impressions,
    clicks,
    spend,
    conversions,
    all_conversions,
    conversion_value,
    leads,
    ctr: impressions > 0 ? clicks / impressions : null,
    cpc: clicks > 0 ? spend / clicks : null,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : null,
    cpa: conversions > 0 ? spend / conversions : null,
    cpl: leads > 0 ? spend / leads : null,
    roas: spend > 0 ? conversion_value / spend : null,
    days: rows.length,
  }
}

export async function GET(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify account belongs to user
  const { data: account, error: accountErr } = await supabase
    .from('ad_accounts')
    .select('id, company:companies!inner(user_id)')
    .eq('id', params.accountId)
    .single()

  if (accountErr || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const company = Array.isArray(account.company) ? account.company[0] : account.company
  if (company.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const endDate   = searchParams.get('end_date')   ?? format(new Date(), 'yyyy-MM-dd')
  const startDate = searchParams.get('start_date') ?? format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const compare   = searchParams.get('compare')    ?? ''

  // Fetch current period
  const { data: currentRows } = await supabase
    .from('daily_metrics')
    .select('impressions, clicks, spend, conversions, all_conversions, conversion_value, leads')
    .eq('ad_account_id', params.accountId)
    .gte('date', startDate)
    .lte('date', endDate)

  const current = computeSnapshot(currentRows ?? [])

  let previous: MetricSnapshot | undefined

  if (compare === 'previous') {
    const periodDays = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
    const prevEnd   = format(subDays(parseISO(startDate), 1), 'yyyy-MM-dd')
    const prevStart = format(subDays(parseISO(startDate), periodDays), 'yyyy-MM-dd')

    const { data: prevRows } = await supabase
      .from('daily_metrics')
      .select('impressions, clicks, spend, conversions, all_conversions, conversion_value, leads')
      .eq('ad_account_id', params.accountId)
      .gte('date', prevStart)
      .lte('date', prevEnd)

    previous = computeSnapshot(prevRows ?? [])
  }

  return NextResponse.json({ current, previous })
}
