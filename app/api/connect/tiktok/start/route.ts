import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const missingVars = ['TIKTOK_ADS_APP_ID', 'TIKTOK_ADS_REDIRECT_URI'].filter(
    key => !process.env[key]
  )
  if (missingVars.length > 0) {
    console.error('Missing TikTok Ads env vars:', missingVars)
    return NextResponse.json(
      { error: `Missing environment variables: ${missingVars.join(', ')}` },
      { status: 500 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400 })

  const state = Buffer.from(JSON.stringify({ companyId, userId: user.id })).toString('base64url')

  // TikTok uses app_id (not client_id) and scopes are configured in developer portal
  const params = new URLSearchParams({
    app_id:       process.env.TIKTOK_ADS_APP_ID!,
    redirect_uri: process.env.TIKTOK_ADS_REDIRECT_URI!,
    state,
  })

  return NextResponse.redirect(
    `https://business-api.tiktok.com/portal/auth?${params}`
  )
}
