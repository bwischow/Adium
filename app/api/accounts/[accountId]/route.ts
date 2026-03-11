import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/accounts/:accountId
 *
 * Update ad account properties (currently: is_active for deactivate/reactivate).
 */
export async function PUT(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { is_active } = body

  if (typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active (boolean) is required' }, { status: 400 })
  }

  // RLS ensures the user can only update their own accounts
  const { data, error } = await supabase
    .from('ad_accounts')
    .update({ is_active })
    .eq('id', params.accountId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

  return NextResponse.json(data)
}

/**
 * DELETE /api/accounts/:accountId?mode=disconnect|delete_all
 *
 * Removes an ad account from a company.
 *
 * Modes:
 *   - disconnect (default): Deletes the ad_account row. Historical daily_metrics
 *     rows are orphaned (their FK references are ON DELETE CASCADE, so they are
 *     also removed — see note below).
 *   - delete_all: Same as disconnect. Because daily_metrics has
 *     ON DELETE CASCADE on ad_account_id, deleting the ad_account automatically
 *     removes all associated metrics.
 *
 * NOTE: With the current schema (ON DELETE CASCADE), both modes behave the same.
 * If you later want "disconnect" to preserve metrics, you'd need to change the
 * FK constraint to ON DELETE SET NULL or remove the FK. For now, we keep both
 * modes so the UI can differentiate intent, and we can adjust behavior later.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') || 'disconnect'

  if (!['disconnect', 'delete_all'].includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode. Use "disconnect" or "delete_all".' }, { status: 400 })
  }

  // RLS ensures the user can only delete their own accounts
  const { error } = await supabase
    .from('ad_accounts')
    .delete()
    .eq('id', params.accountId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, mode })
}
