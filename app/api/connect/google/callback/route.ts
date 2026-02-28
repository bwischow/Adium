import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { pullDailyMetrics } from '@/lib/ingestion'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  let companyId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    companyId = decoded.companyId
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      redirect_uri:  process.env.GOOGLE_ADS_REDIRECT_URI!,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    console.error('Google token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=error`)
  }

  const tokens = await tokenRes.json()

  // Fetch accessible customer accounts from Google Ads API
  const customerRes = await fetch(
    'https://googleads.googleapis.com/v16/customers:listAccessibleCustomers',
    {
      headers: {
        Authorization:          `Bearer ${tokens.access_token}`,
        'developer-token':      process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    }
  )

  if (!customerRes.ok) {
    console.error('listAccessibleCustomers failed:', customerRes.status, await customerRes.text())
    return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=error`)
  }

  let resourceNames: string[] = []
  try {
    const customerData = await customerRes.json()
    resourceNames = Array.isArray(customerData?.resourceNames) ? customerData.resourceNames : []
  } catch {
    console.error('listAccessibleCustomers: invalid JSON response')
    return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=error`)
  }

  const supabase = createServiceClient()

  for (const resourceName of resourceNames) {
    // resourceName looks like "customers/1234567890"
    const platformAccountId = resourceName.replace('customers/', '')

    const { data: account } = await supabase
      .from('ad_accounts')
      .upsert({
        company_id:          companyId,
        platform:            'google_ads',
        platform_account_id: platformAccountId,
        account_name:        `Google Ads ${platformAccountId}`,
        access_token:        tokens.access_token,
        refresh_token:       tokens.refresh_token ?? null,
        token_expires_at:    tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        is_active:           true,
      }, { onConflict: 'platform,platform_account_id' })
      .select()
      .single()

    if (account) {
      // Trigger immediate data pull for last 30 days
      await pullDailyMetrics(account.id, 'google_ads', tokens.access_token)
    }
  }

  return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=success`)
}
