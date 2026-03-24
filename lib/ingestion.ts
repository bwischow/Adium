/**
 * Data ingestion service.
 * Pulls daily account-level metrics from Google Ads or Meta and upserts
 * into daily_metrics. Called immediately on OAuth connect and nightly via cron.
 */

import { createClient } from '@supabase/supabase-js'
import { format, subDays } from 'date-fns'
import type { Platform } from '@/types'

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
  platform: Platform,
  accessToken: string,
  platformAccountId: string,
  daysBack = 1,
  loginCustomerId?: string,
): Promise<void> {
  const endDate   = new Date()
  const startDate = subDays(endDate, daysBack)

  let rows: DailyRow[]

  switch (platform) {
    case 'google_ads':
      rows = await fetchGoogleAdsMetrics(accessToken, platformAccountId, startDate, endDate, loginCustomerId)
      break
    case 'meta':
      rows = await fetchMetaMetrics(accessToken, platformAccountId, startDate, endDate)
      break
    case 'linkedin_ads':
      rows = await fetchLinkedInAdsMetrics(accessToken, platformAccountId, startDate, endDate)
      break
    case 'tiktok_ads':
      rows = await fetchTikTokAdsMetrics(accessToken, platformAccountId, startDate, endDate)
      break
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
    leads:            r.leads,
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
  leads: number
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
    leads:            0,  // Google Ads leads tracked via conversions
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
    leads:            0,  // Google Ads leads tracked via conversions
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
        leads:            r.leads,
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
    `https://graph.facebook.com/v25.0/${platformAccountId}/insights?${params}`
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
    leads:            extractLeads(item.actions),
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

/**
 * Extract lead form submissions from Meta actions array.
 * Matches lead events across common action types:
 *   - lead (standard)
 *   - onsite_conversion.lead_grouped (on-platform lead forms)
 *   - offsite_conversion.fb_pixel_lead (pixel-based)
 *   - omni_lead (cross-channel)
 */
function extractLeads(actions: any[] | undefined): number {
  if (!actions) return 0
  const leadTypes = [
    'lead',
    'onsite_conversion.lead_grouped',
    'offsite_conversion.fb_pixel_lead',
    'omni_lead',
  ]
  let total = 0
  for (const action of actions) {
    if (leadTypes.includes(action.action_type)) {
      total = Math.max(total, Number(action.value ?? 0))
    }
  }
  return total
}

// ---------------------------------------------------------------------------
// LinkedIn Ads
// ---------------------------------------------------------------------------

const LINKEDIN_API_VERSION = '202401'

async function fetchLinkedInAdsMetrics(
  accessToken: string,
  platformAccountId: string,
  startDate: Date,
  endDate: Date,
): Promise<DailyRow[]> {
  const start = {
    year:  startDate.getFullYear(),
    month: startDate.getMonth() + 1,
    day:   startDate.getDate(),
  }
  const end = {
    year:  endDate.getFullYear(),
    month: endDate.getMonth() + 1,
    day:   endDate.getDate(),
  }

  const params = new URLSearchParams({
    q:               'analytics',
    pivot:           'ACCOUNT',
    timeGranularity: 'DAILY',
    'dateRange.start.year':  String(start.year),
    'dateRange.start.month': String(start.month),
    'dateRange.start.day':   String(start.day),
    'dateRange.end.year':    String(end.year),
    'dateRange.end.month':   String(end.month),
    'dateRange.end.day':     String(end.day),
    accounts:        `urn:li:sponsoredAccount:${platformAccountId}`,
    fields:          'dateRange,impressions,clicks,costInLocalCurrency,externalWebsiteConversions,oneClickLeads',
  })

  const res = await fetchWithRetry(
    `https://api.linkedin.com/rest/adAnalytics?${params}`,
    {
      headers: {
        Authorization:               `Bearer ${accessToken}`,
        'LinkedIn-Version':          LINKEDIN_API_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  )

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`[linkedin_ads] API error ${res.status} for ${platformAccountId}:`, errBody)
    throw new Error(`LinkedIn Ads API error: ${res.status}`)
  }

  const data = await res.json()
  const elements: any[] = data.elements ?? []
  console.log(`[linkedin_ads] fetched ${elements.length} rows for ${platformAccountId}`)

  return elements.map((el: any) => {
    const dr = el.dateRange?.start
    const dateStr = dr
      ? `${dr.year}-${String(dr.month).padStart(2, '0')}-${String(dr.day).padStart(2, '0')}`
      : format(startDate, 'yyyy-MM-dd')

    return {
      date:             dateStr,
      impressions:      Number(el.impressions ?? 0),
      clicks:           Number(el.clicks ?? 0),
      spend:            Number(el.costInLocalCurrency ?? 0),
      conversions:      Number(el.externalWebsiteConversions ?? 0),
      conversion_value: 0,  // LinkedIn API does not provide conversion value/revenue
      leads:            Number(el.oneClickLeads ?? 0),
    }
  })
}

/** Used by the nightly job for LinkedIn accounts. */
export async function pullLinkedInAdsForAccount(account: {
  id: string
  platform_account_id: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
}): Promise<void> {
  let accessToken = account.access_token

  // Refresh token if expired
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    if (!account.refresh_token) {
      throw new Error('Token expired and no refresh token available')
    }
    accessToken = await refreshLinkedInToken(account.refresh_token)

    const supabase = getServiceClient()
    await supabase
      .from('ad_accounts')
      .update({
        access_token:     accessToken,
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // ~60 days
      })
      .eq('id', account.id)
  }

  await pullDailyMetrics(
    account.id,
    'linkedin_ads',
    accessToken,
    account.platform_account_id,
    1,
  )
}

async function refreshLinkedInToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     process.env.LINKEDIN_ADS_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_ADS_CLIENT_SECRET!,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to refresh LinkedIn token')
  return data.access_token
}

// ---------------------------------------------------------------------------
// TikTok Ads
// ---------------------------------------------------------------------------

async function fetchTikTokAdsMetrics(
  accessToken: string,
  platformAccountId: string,
  startDate: Date,
  endDate: Date,
): Promise<DailyRow[]> {
  const params = new URLSearchParams({
    advertiser_id: platformAccountId,
    report_type:   'BASIC',
    data_level:    'AUCTION_ADVERTISER',
    dimensions:    JSON.stringify(['stat_time_day']),
    metrics:       JSON.stringify([
      'impressions', 'clicks', 'spend',
      'conversion', 'total_purchase_value',
    ]),
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date:   format(endDate, 'yyyy-MM-dd'),
    page_size:  '90',
  })

  const res = await fetchWithRetry(
    `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${params}`,
    {
      headers: { 'Access-Token': accessToken },
    }
  )

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`[tiktok_ads] API error ${res.status} for ${platformAccountId}:`, errBody)
    throw new Error(`TikTok Ads API error: ${res.status}`)
  }

  const body = await res.json()

  // TikTok wraps responses: { code: 0, message: "OK", data: { list: [...] } }
  if (body.code !== 0) {
    console.error(`[tiktok_ads] API error for ${platformAccountId}:`, body.message)
    throw new Error(`TikTok Ads API error: ${body.message}`)
  }

  const items: any[] = body.data?.list ?? []
  console.log(`[tiktok_ads] fetched ${items.length} rows for ${platformAccountId}`)

  return items.map((item: any) => {
    const metrics = item.metrics ?? {}
    const dimensions = item.dimensions ?? {}
    // TikTok returns dates as "YYYY-MM-DD HH:MM:SS", take date portion
    const dateStr = (dimensions.stat_time_day ?? '').split(' ')[0]

    return {
      date:             dateStr,
      impressions:      Number(metrics.impressions ?? 0),
      clicks:           Number(metrics.clicks ?? 0),
      spend:            Number(metrics.spend ?? 0),
      conversions:      Number(metrics.conversion ?? 0),
      conversion_value: Number(metrics.total_purchase_value ?? 0),
      leads:            0,
    }
  })
}

/** Used by the nightly job for TikTok accounts. */
export async function pullTikTokAdsForAccount(account: {
  id: string
  platform_account_id: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
}): Promise<void> {
  let accessToken = account.access_token

  // TikTok tokens expire quickly (~24h). Refresh if expired.
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    if (!account.refresh_token) {
      throw new Error('Token expired and no refresh token available')
    }
    const refreshed = await refreshTikTokToken(account.refresh_token)
    accessToken = refreshed.accessToken

    const supabase = getServiceClient()
    await supabase
      .from('ad_accounts')
      .update({
        access_token:     accessToken,
        token_expires_at: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
      })
      .eq('id', account.id)
  }

  await pullDailyMetrics(
    account.id,
    'tiktok_ads',
    accessToken,
    account.platform_account_id,
    1,
  )
}

async function refreshTikTokToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id:        process.env.TIKTOK_ADS_APP_ID!,
      secret:        process.env.TIKTOK_ADS_APP_SECRET!,
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  const body = await res.json()
  if (body.code !== 0 || !body.data?.access_token) {
    throw new Error(`Failed to refresh TikTok token: ${body.message}`)
  }
  return {
    accessToken: body.data.access_token,
    expiresIn:   body.data.expires_in ?? 86400,
  }
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
