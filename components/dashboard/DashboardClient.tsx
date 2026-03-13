'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { subDays, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import BenchmarkChart from './BenchmarkChart'
import MetricTabs from './MetricTabs'
import MetricSummaryCards from './MetricSummaryCards'
import DateRangePicker from './DateRangePicker'
import CompanySidebar from './CompanySidebar'
import type { Company, AdAccount, MetricName, DashboardData } from '@/types'
import { METRIC_LABELS, METRIC_FORMATS } from '@/types'
import { RefreshCw, Menu } from 'lucide-react'

const DATE_PRESETS = [
  { label: '24h', days: 1 },
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

interface MetricSnapshot {
  impressions: number
  clicks: number
  spend: number
  conversions: number
  conversion_value: number
  ctr: number | null
  cpc: number | null
  cpm: number | null
  cpa: number | null
  roas: number | null
  days: number
}

interface Props {
  companies: Company[]
}

export default function DashboardClient({ companies }: Props) {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const supabase    = createClient()

  const initialCompanyId = searchParams.get('company') ?? companies[0]?.id
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId)

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) ?? companies[0]
  const adAccounts: AdAccount[] = (selectedCompany as any)?.ad_accounts ?? []

  const [selectedAccountId, setSelectedAccountId] = useState<string>(adAccounts[0]?.id ?? '')
  const [selectedMetric, setSelectedMetric]       = useState<MetricName>('ctr')
  const [preset, setPreset]                        = useState('24h')
  const [customStart, setCustomStart]              = useState('')
  const [customEnd, setCustomEnd]                  = useState('')

  const [data, setData]       = useState<DashboardData | null>(null)
  const [summary, setSummary] = useState<{ current: MetricSnapshot; previous?: MetricSnapshot } | null>(null)
  const [loading, setLoading] = useState(false)
  const [pulling, setPulling]       = useState(false)
  const [error, setError]           = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

    try {
      const [benchRes, summaryRes] = await Promise.all([
        fetch(`/api/benchmarks/${selectedAccountId}?${new URLSearchParams({
          metric:     selectedMetric,
          start_date: start,
          end_date:   end,
        })}`),
        fetch(`/api/accounts/${selectedAccountId}/metrics?${new URLSearchParams({
          start_date: start,
          end_date:   end,
          compare:    'previous',
        })}`),
      ])

      if (!benchRes.ok) throw new Error('Failed to load benchmark data')
      const benchJson = await benchRes.json()
      setData(benchJson)

      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json()
        setSummary(summaryJson)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, selectedMetric, preset, customStart, customEnd])

  const handleRefreshData = async () => {
    if (!selectedAccountId || pulling) return
    setPulling(true)
    try {
      const days = DATE_PRESETS.find(p => p.label === preset)?.days ?? 1
      await fetch(`/api/accounts/${selectedAccountId}/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysBack: days }),
      })
      await fetchData()
    } finally {
      setPulling(false)
    }
  }

  useEffect(() => { fetchData() }, [fetchData])

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
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 lg:relative lg:z-0
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <CompanySidebar
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          adAccounts={adAccounts}
          selectedAccountId={selectedAccountId}
          onCompanyChange={(id) => {
            handleCompanyChange(id)
            setSidebarOpen(false)
          }}
          onAccountChange={(id) => {
            setSelectedAccountId(id)
            setSidebarOpen(false)
          }}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden bg-black border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold tracking-widest text-white">ADIUM</span>
        </div>

        {/* Top bar */}
        <div className="bg-black border-b border-white/10 px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <MetricTabs selected={selectedMetric} onChange={setSelectedMetric} />
          <div className="sm:ml-auto flex items-center gap-3">
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
            <button
              onClick={handleRefreshData}
              disabled={pulling || !selectedAccountId}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-widest text-black bg-peach hover:bg-peach-dark disabled:opacity-50 transition-colors flex-shrink-0"
              title="Pull latest data from ad platform"
            >
              <RefreshCw className={`h-3 w-3 ${pulling ? 'animate-spin' : ''}`} />
              {pulling ? 'Pulling\u2026' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 p-6">
          {adAccounts.length === 0 ? (
            <EmptyState type="no-accounts" companyId={selectedCompanyId} />
          ) : !selectedAccountId ? (
            <EmptyState type="no-accounts" companyId={selectedCompanyId} />
          ) : loading ? (
            <div className="flex items-center justify-center h-64 text-white/30 text-xs tracking-widest">
              Loading data\u2026
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-400 text-xs tracking-widest">{error}</div>
          ) : !data || data.userSeries.length === 0 ? (
            <EmptyState type="no-data" />
          ) : (
            <>
              {summary && (
                <MetricSummaryCards
                  current={summary.current}
                  previous={summary.previous}
                  onMetricClick={setSelectedMetric}
                  selectedMetric={selectedMetric}
                  benchmarkP50={(() => {
                    if (!data.benchmarkSeries.length) return null
                    const latest = data.benchmarkSeries[data.benchmarkSeries.length - 1]
                    return latest?.p50 ?? null
                  })()}
                />
              )}

              {/* Mobile benchmark summary — visible only on small screens */}
              <div className="sm:hidden mb-4 border border-white/10 p-4">
                <p className="text-[10px] text-white/30 tracking-widest mb-2">
                  {data.isHistoricalFallback ? 'Your historical' : 'Benchmark'} comparison
                </p>
                <div className="flex items-baseline gap-4">
                  <div>
                    <p className="text-[10px] text-white/30 tracking-widest">Your {METRIC_LABELS[selectedMetric]}</p>
                    <p className="text-lg font-black text-white">
                      {data.userSeries.length > 0 && data.userSeries[data.userSeries.length - 1].value != null
                        ? METRIC_FORMATS[selectedMetric](data.userSeries[data.userSeries.length - 1].value!)
                        : '\u2014'}
                    </p>
                  </div>
                  {data.benchmarkSeries.length > 0 && (
                    <div>
                      <p className="text-[10px] text-white/30 tracking-widest">P50</p>
                      <p className="text-lg font-black text-white/50">
                        {data.benchmarkSeries[data.benchmarkSeries.length - 1]?.p50 != null
                          ? METRIC_FORMATS[selectedMetric](data.benchmarkSeries[data.benchmarkSeries.length - 1].p50!)
                          : '\u2014'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart — hidden on mobile */}
              <div className="hidden sm:block border border-white/10 p-6">
                {data.spendTierLabel && (
                  <p className="text-xs text-white/30 mb-1 tracking-widest">
                    Segment: <span className="font-bold text-white/50">{data.spendTierLabel}</span>
                    {data.accountCount > 0 && (
                      <span className="ml-2 text-white/20">({data.accountCount} peers)</span>
                    )}
                  </p>
                )}

                {!data.hasEnoughPeers && !data.isHistoricalFallback && (
                  <div className="mb-4 bg-peach/10 border border-peach/30 text-peach text-xs px-4 py-2 tracking-wide">
                    Benchmark data coming soon &mdash; we need more accounts in your industry to show peer comparisons.
                  </div>
                )}

                <BenchmarkChart
                  userSeries={data.userSeries}
                  benchmarkSeries={data.benchmarkSeries}
                  metric={selectedMetric}
                  showBenchmark={data.hasEnoughPeers || !!data.isHistoricalFallback}
                  isHistoricalFallback={data.isHistoricalFallback}
                />
              </div>
            </>
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
        <p className="text-xs font-bold text-white/50 mb-2 tracking-widest">No sources connected</p>
        <p className="text-xs text-white/30 mb-4 tracking-wide">
          Connect a Google Ads or Meta Ads account to start benchmarking.
        </p>
        {companyId && (
          <button
            onClick={() => router.push(`/companies/${companyId}/connect`)}
            className="bg-peach text-black px-4 py-2 text-xs font-bold tracking-widest hover:bg-peach-dark transition-colors"
          >
            Connect source
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-xs font-bold text-white/50 mb-2 tracking-widest">No data yet</p>
      <p className="text-xs text-white/30 tracking-wide">
        Processing your ad data. Check back shortly.
      </p>
    </div>
  )
}
