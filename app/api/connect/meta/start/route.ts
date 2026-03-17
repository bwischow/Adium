import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400 })

  const state = Buffer.from(JSON.stringify({ companyId, userId: user.id })).toString('base64url')

  const params = new URLSearchParams({
    client_id:    process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    state,
    scope:        'ads_read,ads_management,pages_read_engagement,pages_show_list,read_insights,pages_manage_metadata,pages_manage_ads',
  })

  return NextResponse.redirect(
    `https://www.facebook.com/v25.0/dialog/oauth?${params}`
  )
}
