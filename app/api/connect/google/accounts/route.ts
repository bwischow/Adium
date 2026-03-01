import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('google_oauth_pending')?.value
  if (!raw) {
    return NextResponse.json({ error: 'No pending Google OAuth session' }, { status: 400 })
  }

  try {
    const { accounts } = JSON.parse(raw)
    return NextResponse.json({ accounts })
  } catch {
    return NextResponse.json({ error: 'Invalid session data' }, { status: 400 })
  }
}
