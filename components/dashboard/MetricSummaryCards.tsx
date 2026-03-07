'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { METRIC_FORMATS, METRIC_LABELS } from '@/types'
import type { MetricName } from '@/types'

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
  current: MetricSnapshot
  previous?: MetricSnapshot
  onMetricClick?: (metric: MetricName) => void
  selectedMetric?: MetricName
}

const CARD_METRICS: { key: MetricName; higherIsBetter: boolean }[] = [
  { key: 'ctr',  higherIsBetter: true },
  { key: 'cpc',  higherIsBetter: false },
  { key: 'cpm',  higherIsBetter: false },
  { key: 'cpa',  higherIsBetter: false },
  { key: 'roas', higherIsBetter: true },
]

function pctChange(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null
  return (current - previous) / previous
}

export default function MetricSummaryCards({ current, previous, onMetricClick, selectedMetric }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {CARD_METRICS.map(({ key, higherIsBetter }) => {
        const value  = current[key]
        const prev   = previous?.[key] ?? null
        const change = pctChange(value, prev)
        const fmt    = METRIC_FORMATS[key]
        const isSelected = selectedMetric === key

        let trend: 'up' | 'down' | 'flat' = 'flat'
        if (change != null && Math.abs(change) > 0.005) {
          trend = change > 0 ? 'up' : 'down'
        }

        const isPositive = trend === 'flat' ? null :
          (trend === 'up' && higherIsBetter) || (trend === 'down' && !higherIsBetter)

        return (
          <button
            key={key}
            onClick={() => onMetricClick?.(key)}
            className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${
              isSelected
                ? 'border-brand-500 ring-2 ring-brand-100'
                : 'border-gray-200'
            }`}
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {METRIC_LABELS[key]}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {value != null ? fmt(value) : '—'}
            </p>
            {change != null && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                isPositive === null ? 'text-gray-400' :
                isPositive ? 'text-green-600' : 'text-red-500'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                <span>{Math.abs(change * 100).toFixed(1)}%</span>
                <span className="text-gray-400">vs prior</span>
              </div>
            )}
          </button>
        )
      })}

      {/* Conversions card (raw number, not a derived metric) */}
      <button
        onClick={() => onMetricClick?.('cpa')}
        className="bg-white rounded-xl border border-gray-200 p-4 text-left transition-all hover:shadow-md lg:col-span-5 sm:col-span-3 col-span-2"
      >
        <div className="flex items-center gap-8 flex-wrap">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Conversions
            </p>
            <p className="text-xl font-bold text-gray-900">
              {current.conversions.toFixed(0)}
            </p>
            {previous && (
              <ChangeIndicator
                current={current.conversions}
                previous={previous.conversions}
                higherIsBetter
              />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Spend
            </p>
            <p className="text-xl font-bold text-gray-900">
              ${current.spend.toFixed(2)}
            </p>
            {previous && (
              <ChangeIndicator
                current={current.spend}
                previous={previous.spend}
                higherIsBetter={false}
              />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Clicks
            </p>
            <p className="text-xl font-bold text-gray-900">
              {current.clicks.toLocaleString()}
            </p>
            {previous && (
              <ChangeIndicator
                current={current.clicks}
                previous={previous.clicks}
                higherIsBetter
              />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Impressions
            </p>
            <p className="text-xl font-bold text-gray-900">
              {current.impressions.toLocaleString()}
            </p>
            {previous && (
              <ChangeIndicator
                current={current.impressions}
                previous={previous.impressions}
                higherIsBetter
              />
            )}
          </div>
        </div>
      </button>
    </div>
  )
}

function ChangeIndicator({
  current,
  previous,
  higherIsBetter,
}: {
  current: number
  previous: number
  higherIsBetter: boolean
}) {
  const change = pctChange(current, previous)
  if (change == null) return null

  let trend: 'up' | 'down' | 'flat' = 'flat'
  if (Math.abs(change) > 0.005) {
    trend = change > 0 ? 'up' : 'down'
  }

  const isPositive = trend === 'flat' ? null :
    (trend === 'up' && higherIsBetter) || (trend === 'down' && !higherIsBetter)

  return (
    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
      isPositive === null ? 'text-gray-400' :
      isPositive ? 'text-green-600' : 'text-red-500'
    }`}>
      {trend === 'up' ? (
        <TrendingUp className="h-3 w-3" />
      ) : trend === 'down' ? (
        <TrendingDown className="h-3 w-3" />
      ) : (
        <Minus className="h-3 w-3" />
      )}
      <span>{Math.abs(change * 100).toFixed(1)}%</span>
    </div>
  )
}
