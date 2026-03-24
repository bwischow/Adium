import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * POST /api/webhooks/meta/deauthorize
 *
 * Meta Deauthorize Callback. When a user removes Adium from their Facebook
 * account settings, Meta sends a signed request to this endpoint.
 *
 * We verify the signature and deactivate all Meta ad accounts for the user,
 * stopping future data pulls while preserving historical data until the user
 * explicitly deletes it or the retention policy kicks in.
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function parseSignedRequest(signedRequest: string, appSecret: string): { user_id: string } | null {
  const [encodedSig, payload] = signedRequest.split('.')
  if (!encodedSig || !payload) return null

  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

  const expectedSig = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest()

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    console.error('[meta/deauthorize] Invalid signature')
    return null
  }

  const decoded = JSON.parse(
    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
  )

  return decoded
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const signedRequest = formData.get('signed_request') as string

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
    }

    const appSecret = process.env.META_APP_SECRET
    if (!appSecret) {
      console.error('[meta/deauthorize] META_APP_SECRET not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const data = parseSignedRequest(signedRequest, appSecret)
    if (!data) {
      return NextResponse.json({ error: 'Invalid signed request' }, { status: 403 })
    }

    const metaUserId = data.user_id
    console.log(`[meta/deauthorize] User ${metaUserId} deauthorized the app`)

    // Deactivate all Meta ad accounts for this user and clear tokens.
    // We don't delete data immediately — the retention policy or explicit
    // user deletion handles that. But we must stop pulling data since the
    // token is now revoked.
    const supabase = getServiceClient()

    const { data: updatedAccounts, error } = await supabase
      .from('ad_accounts')
      .update({
        is_active: false,
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
      })
      .eq('platform', 'meta')
      .eq('meta_user_id', metaUserId)
      .select('id')

    if (error) {
      console.error('[meta/deauthorize] Failed to deactivate accounts:', error.message)
    }

    const updatedCount = updatedAccounts?.length ?? 0
    console.log(`[meta/deauthorize] Deactivated ${updatedCount} Meta ad account(s) for user ${metaUserId}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[meta/deauthorize] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
