import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { Company } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: companies } = await supabase
    .from('companies')
    .select('*, industry:industries(id, name, slug), ad_accounts(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!companies || companies.length === 0) {
    redirect('/companies/new')
  }

  return <DashboardClient companies={companies as Company[]} />
}
