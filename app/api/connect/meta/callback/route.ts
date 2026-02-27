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

  // Exchange code for short-lived token
  const tokenParams = new URLSearchParams({
    client_id:     process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri:  process.env.META_REDIRECT_URI!,
    code,
  })

  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams}`
  )

  if (!tokenRes.ok) {
    console.error('Meta token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=error`)
  }

  const shortLived = await tokenRes.json()

  // Exchange for long-lived token (~60 days)
  const longParams = new URLSearchParams({
    grant_type:        'fb_exchange_token',
    client_id:         process.env.META_APP_ID!,
    client_secret:     process.env.META_APP_SECRET!,
    fb_exchange_token: shortLived.access_token,
  })

  const longRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?${longParams}`
  )

  const longLived = longRes.ok ? await longRes.json() : shortLived
  const accessToken: string = longLived.access_token

  // Fetch the user's ad accounts
  const accountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`
  )
  const accountsData = await accountsRes.json()
  const adAccounts: { id: string; name: string }[] = accountsData.data ?? []

  const supabase = createServiceClient()

  for (const metaAccount of adAccounts) {
    const { data: account } = await supabase
      .from('ad_accounts')
      .upsert({
        company_id:          companyId,
        platform:            'meta',
        platform_account_id: metaAccount.id,
        account_name:        metaAccount.name,
        access_token:        accessToken,
        // Long-lived tokens expire in ~60 days
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      }, { onConflict: 'platform,platform_account_id' })
      .select()
      .single()

    if (account) {
      await pullDailyMetrics(account.id, 'meta', accessToken, metaAccount.id)
    }
  }

  return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=success`)
}
