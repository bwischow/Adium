/**
 * Data ingestion service.
 * Pulls daily account-level metrics from Google Ads or Meta and upserts
 * into daily_metrics. Called immediately on OAuth connect and nightly via cron.
 */

import { createClient } from '@supabase/supabase-js'
import { format, subDays } from 'date-fns'

// Service-role client (no RLS) — only used server-side
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** Pull daily account-level metrics for one ad account. */
export async function pullDailyMetrics(
  adAccountId: string,
  platform: 'google_ads' | 'meta',
  accessToken: string,
  platformAccountId: string,
  daysBack = 1,
  loginCustomerId?: string,
): Promise<void> {
  const endDate   = new Date()
  const startDate = subDays(endDate, daysBack)

  let rows: DailyRow[]

  if (platform === 'google_ads') {
    rows = await fetchGoogleAdsMetrics(accessToken, platformAccountId, startDate, endDate, loginCustomerId)
  } else {
    rows = await fetchMetaMetrics(accessToken, platformAccountId, startDate, endDate)
  }

  if (rows.length === 0) return

  const supabase = getServiceClient()

  const upsertRows = rows.map(r => ({
    ad_account_id:    adAccountId,
    date:             r.date,
    impressions:      r.impressions,
    clicks:           r.clicks,
    spend:            r.spend,
    conversions:      r.conversions,
    conversion_value: r.conversion_value,
    pulled_at:        new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('daily_metrics')
    .upsert(upsertRows, { onConflict: 'ad_account_id,date' })

  if (error) {
    console.error(`[ingestion] upsert failed for ${adAccountId}:`, error.message)
    throw error
  }

  console.log(`[ingestion] pulled ${rows.length} rows for account ${adAccountId}`)
}

interface DailyRow {
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  conversion_value: number
}

// ---------------------------------------------------------------------------
// Google Ads
// ---------------------------------------------------------------------------

async function fetchGoogleAdsMetrics(
  accessToken: string,
  platformAccountId: string,
  startDate: Date,
  endDate: Date,
  loginCustomerId?: string,
): Promise<DailyRow[]> {
  const customerId = platformAccountId.replace(/-/g, '')

  const gaql = `
    SELECT
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM customer
    WHERE segments.date BETWEEN '${format(startDate, 'yyyy-MM-dd')}' AND '${format(endDate, 'yyyy-MM-dd')}'
    ORDER BY segments.date ASC
  `

  // login-customer-id is the MCC ID that grants access to this account.
  // For standalone accounts it equals the account's own customer ID.
  const loginId = loginCustomerId ?? customerId

  const res = await fetchWithRetry(
    `https://googleads.googleapis.com/v20/customers/${customerId}/googleAds:search`,
    {
      method: 'POST',
      headers: {
        Authorization:        `Bearer ${accessToken}`,
        'developer-token':    process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'login-customer-id':  loginId,
        'Content-Type':       'application/json',
      },
      body: JSON.stringify({ query: gaql }),
    }
  )

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`[google_ads] API error ${res.status}:`, errBody)
    throw new Error(`Google Ads API error: ${res.status}`)
  }

  const data = await res.json()
  return (data.results ?? []).map((r: any) => ({
    date:             r.segments.date,
    impressions:      Number(r.metrics.impressions ?? 0),
    clicks:           Number(r.metrics.clicks ?? 0),
    spend:            Number(r.metrics.costMicros ?? 0) / 1_000_000,
    conversions:      Number(r.metrics.conversions ?? 0),
    conversion_value: Number(r.metrics.conversionsValue ?? 0),
  }))
}

/** Used by the nightly job — has the full account row. */
export async function pullGoogleAdsForAccount(account: {
  id: string
  platform_account_id: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  login_customer_id: string | null
}): Promise<void> {
  let accessToken = account.access_token

  // Refresh token if expired
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    if (!account.refresh_token) {
      throw new Error('Token expired and no refresh token available')
    }
    accessToken = await refreshGoogleToken(account.refresh_token)

    // Persist the new token
    const supabase = getServiceClient()
    await supabase
      .from('ad_accounts')
      .update({
        access_token:     accessToken,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      })
      .eq('id', account.id)
  }

  const customerId = account.platform_account_id.replace(/-/g, '')
  const loginId    = account.login_customer_id ?? customerId

  const endDate   = new Date()
  const startDate = subDays(endDate, 1)  // nightly job: just yesterday

  const gaql = `
    SELECT
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM customer
    WHERE segments.date BETWEEN '${format(startDate, 'yyyy-MM-dd')}' AND '${format(endDate, 'yyyy-MM-dd')}'
    ORDER BY segments.date ASC
  `

  const res = await fetchWithRetry(
    `https://googleads.googleapis.com/v20/customers/${customerId}/googleAds:search`,
    {
      method: 'POST',
      headers: {
        Authorization:        `Bearer ${accessToken}`,
        'developer-token':    process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'login-customer-id':  loginId,
        'Content-Type':       'application/json',
      },
      body: JSON.stringify({ query: gaql }),
    }
  )

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`[google_ads] API error ${res.status} for ${customerId}:`, errBody)
    throw new Error(`Google Ads API error: ${res.status}`)
  }

  const data = await res.json()
  const rows: DailyRow[] = (data.results ?? []).map((r: any) => ({
    date:             r.segments.date,
    impressions:      Number(r.metrics.impressions ?? 0),
    clicks:           Number(r.metrics.clicks ?? 0),
    spend:            Number(r.metrics.costMicros ?? 0) / 1_000_000,
    conversions:      Number(r.metrics.conversions ?? 0),
    conversion_value: Number(r.metrics.conversionsValue ?? 0),
  }))

  if (rows.length === 0) return

  const supabase = getServiceClient()
  await supabase
    .from('daily_metrics')
    .upsert(
      rows.map(r => ({
        ad_account_id:    account.id,
        date:             r.date,
        impressions:      r.impressions,
        clicks:           r.clicks,
        spend:            r.spend,
        conversions:      r.conversions,
        conversion_value: r.conversion_value,
        pulled_at:        new Date().toISOString(),
      })),
      { onConflict: 'ad_account_id,date' }
    )

  console.log(`[google_ads] pulled ${rows.length} rows for account ${customerId}`)
}

async function refreshGoogleToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to refresh Google token')
  return data.access_token
}

// ---------------------------------------------------------------------------
// Meta Ads
// ---------------------------------------------------------------------------

async function fetchMetaMetrics(
  accessToken: string,
  platformAccountId: string,
  startDate: Date,
  endDate: Date
): Promise<DailyRow[]> {
  const timeRange = JSON.stringify({
    since: format(startDate, 'yyyy-MM-dd'),
    until: format(endDate, 'yyyy-MM-dd'),
  })

  const params = new URLSearchParams({
    access_token:   accessToken,
    time_range:     timeRange,
    fields:         'date_start,impressions,clicks,spend,actions,action_values',
    level:          'account',
    time_increment: '1',
    limit:          '90',
  })

  const res = await fetchWithRetry(
    `https://graph.facebook.com/v19.0/${platformAccountId}/insights?${params}`
  )

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`[meta] API error ${res.status} for ${platformAccountId}:`, errBody)
    throw new Error(`Meta Ads API error: ${res.status}`)
  }

  const data = await res.json()

  if (data.error) {
    console.error(`[meta] Graph API error for ${platformAccountId}:`, data.error)
    throw new Error(`Meta Graph API error: ${data.error.message}`)
  }

  const items: any[] = data.data ?? []
  console.log(`[meta] fetched ${items.length} insight rows for ${platformAccountId}`)

  return items.map(item => ({
    date:             item.date_start,
    impressions:      Number(item.impressions ?? 0),
    clicks:           Number(item.clicks ?? 0),
    spend:            Number(item.spend ?? 0),
    conversions:      extractConversions(item.actions),
    conversion_value: extractConversionValue(item.action_values),
  }))
}

/**
 * Extract total conversions from Meta actions array.
 * Matches purchase events across all common action types:
 *   - offsite_conversion.fb_pixel_purchase (pixel-based)
 *   - omni_purchase (cross-channel)
 *   - purchase (standard)
 * Falls back to 0 if none found.
 */
function extractConversions(actions: any[] | undefined): number {
  if (!actions) return 0
  const purchaseTypes = [
    'offsite_conversion.fb_pixel_purchase',
    'omni_purchase',
    'purchase',
  ]
  let total = 0
  for (const action of actions) {
    if (purchaseTypes.includes(action.action_type)) {
      total = Math.max(total, Number(action.value ?? 0))
    }
  }
  return total
}

/**
 * Extract total conversion value from Meta action_values array.
 * Same matching logic as extractConversions.
 */
function extractConversionValue(actionValues: any[] | undefined): number {
  if (!actionValues) return 0
  const purchaseTypes = [
    'offsite_conversion.fb_pixel_purchase',
    'omni_purchase',
    'purchase',
  ]
  let total = 0
  for (const action of actionValues) {
    if (purchaseTypes.includes(action.action_type)) {
      total = Math.max(total, Number(action.value ?? 0))
    }
  }
  return total
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** Fetch with up to 3 retries and exponential backoff. */
async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options)
      if (res.ok || res.status < 500) return res  // don't retry 4xx
      throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      lastError = err as Error
      const waitMs = 1000 * Math.pow(2, attempt)
      console.warn(`[ingestion] Attempt ${attempt + 1} failed, retrying in ${waitMs}ms…`)
      await new Promise(r => setTimeout(r, waitMs))
    }
  }
  throw lastError
}
