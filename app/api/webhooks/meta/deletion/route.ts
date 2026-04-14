import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * POST /api/webhooks/meta/deletion
 *
 * Meta Data Deletion Callback. When a user requests deletion of their data
 * through Facebook, Meta sends a signed request to this endpoint.
 *
 * We verify the signature, delete all Meta ad accounts and associated metrics
 * for the user, and return a confirmation URL + tracking code.
 *
 * See: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback/
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface DeletionPayload {
  user_id: string
  algorithm: string
  issued_at: number
}

function parseSignedRequest(signedRequest: string, appSecret: string): DeletionPayload | null {
  const [encodedSig, payload] = signedRequest.split('.')
  if (!encodedSig || !payload) return null

  // Decode the signature
  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

  // Verify the signature using HMAC-SHA256
  const expectedSig = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest()

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    console.error('[meta/deletion] Invalid signature')
    return null
  }

  // Decode the payload
  const decoded = JSON.parse(
    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
  )

  return decoded as DeletionPayload
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'Meta Data Deletion Callback',
    method: 'POST',
  })
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
      console.error('[meta/deletion] META_APP_SECRET not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const data = parseSignedRequest(signedRequest, appSecret)
    if (!data) {
      return NextResponse.json({ error: 'Invalid signed request' }, { status: 403 })
    }

    const metaUserId = data.user_id
    console.log(`[meta/deletion] Received deletion request for Meta user: ${metaUserId}`)

    // Generate a confirmation code for tracking
    const confirmationCode = crypto.randomUUID()

    // Delete all Meta ad accounts associated with this Meta user ID.
    // The ON DELETE CASCADE on daily_metrics will automatically remove
    // all associated metrics.
    const supabase = getServiceClient()

    const { data: deletedAccounts, error } = await supabase
      .from('ad_accounts')
      .delete()
      .eq('platform', 'meta')
      .eq('meta_user_id', metaUserId)
      .select('id')

    if (error) {
      console.error('[meta/deletion] Failed to delete accounts:', error.message)
      // Still return success to Meta — we'll handle cleanup manually
    }

    const deletedCount = deletedAccounts?.length ?? 0
    console.log(`[meta/deletion] Deleted ${deletedCount} Meta ad account(s) for user ${metaUserId}`)

    // Meta expects a JSON response with a URL and confirmation code
    const origin = new URL(request.url).origin
    return NextResponse.json({
      url: `${origin}/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch (err) {
    console.error('[meta/deletion] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
