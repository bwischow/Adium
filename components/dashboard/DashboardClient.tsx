'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { subDays, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import BenchmarkChart from './BenchmarkChart'
import MetricTabs from './MetricTabs'
import DateRangePicker from './DateRangePicker'
import CompanySidebar from './CompanySidebar'
import type { Company, AdAccount, MetricName, DashboardData } from '@/types'

const DATE_PRESETS = [
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

interface Props {
  companies: Company[]
}

export default function DashboardClient({ companies }: Props) {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const supabase    = createClient()

  // Derive initial company from URL param or first company
  const initialCompanyId = searchParams.get('company') ?? companies[0]?.id
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId)

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) ?? companies[0]
  const adAccounts: AdAccount[] = (selectedCompany as any)?.ad_accounts ?? []

  const [selectedAccountId, setSelectedAccountId] = useState<string>(adAccounts[0]?.id ?? '')
  const [selectedMetric, setSelectedMetric]       = useState<MetricName>('ctr')
  const [preset, setPreset]                        = useState('30d')
  const [customStart, setCustomStart]              = useState('')
  const [customEnd, setCustomEnd]                  = useState('')

  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Compute the active date range
  const getDateRange = (): { start: string; end: string } => {
    if (preset === 'custom' && customStart && customEnd) {
      return { start: customStart, end: customEnd }
    }
    const days = DATE_PRESETS.find(p => p.label === preset)?.days ?? 30
    return {
      start: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      end:   format(new Date(), 'yyyy-MM-dd'),
    }
  }

  const fetchData = useCallback(async () => {
    if (!selectedAccountId) return
    setLoading(true)
    setError('')

    const { start, end } = getDateRange()
    const params = new URLSearchParams({
      metric:     selectedMetric,
      start_date: start,
      end_date:   end,
    })

    try {
      const res = await fetch(`/api/benchmarks/${selectedAccountId}?${params}`)
      if (!res.ok) throw new Error('Failed to load benchmark data')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, selectedMetric, preset, customStart, customEnd])

  useEffect(() => { fetchData() }, [fetchData])

  // Reset account selection when company changes
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId)
    const company = companies.find(c => c.id === companyId)
    const accounts: AdAccount[] = (company as any)?.ad_accounts ?? []
    setSelectedAccountId(accounts[0]?.id ?? '')
    router.replace(`/dashboard?company=${companyId}`, { scroll: false })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <CompanySidebar
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        adAccounts={adAccounts}
        selectedAccountId={selectedAccountId}
        onCompanyChange={handleCompanyChange}
        onAccountChange={setSelectedAccountId}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-wrap">
          <MetricTabs selected={selectedMetric} onChange={setSelectedMetric} />
          <div className="ml-auto flex items-center gap-2">
            <DateRangePicker
              preset={preset}
              presets={DATE_PRESETS}
              customStart={customStart}
              customEnd={customEnd}
              onPresetChange={setPreset}
              onCustomChange={(start, end) => {
                setCustomStart(start)
                setCustomEnd(end)
                setPreset('custom')
              }}
            />
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 p-6">
          {adAccounts.length === 0 ? (
            <EmptyState type="no-accounts" companyId={selectedCompanyId} />
          ) : !selectedAccountId ? (
            <EmptyState type="no-accounts" companyId={selectedCompanyId} />
          ) : loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading data…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
          ) : !data || data.userSeries.length === 0 ? (
            <EmptyState type="no-data" />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Spend tier badge */}
              {data.spendTierLabel && (
                <p className="text-sm text-gray-500 mb-1">
                  Your segment: <span className="font-medium">{data.spendTierLabel}</span>
                  {data.accountCount > 0 && (
                    <span className="ml-2 text-gray-400">({data.accountCount} peers)</span>
                  )}
                </p>
              )}

              {!data.hasEnoughPeers && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2">
                  Benchmark data coming soon — we need more accounts in your industry to show peer comparisons.
                </div>
              )}

              <BenchmarkChart
                userSeries={data.userSeries}
                benchmarkSeries={data.benchmarkSeries}
                metric={selectedMetric}
                showBenchmark={data.hasEnoughPeers}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ type, companyId }: { type: 'no-accounts' | 'no-data'; companyId?: string }) {
  const router = useRouter()

  if (type === 'no-accounts') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg font-medium text-gray-700 mb-2">No ad accounts connected</p>
        <p className="text-sm text-gray-500 mb-4">
          Connect a Google Ads or Meta Ads account to start benchmarking.
        </p>
        {companyId && (
          <button
            onClick={() => router.push(`/companies/${companyId}/connect`)}
            className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700"
          >
            Connect an account
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-lg font-medium text-gray-700 mb-2">No data yet</p>
      <p className="text-sm text-gray-500">
        We&apos;re processing your ad data. Check back shortly.
      </p>
    </div>
  )
}
