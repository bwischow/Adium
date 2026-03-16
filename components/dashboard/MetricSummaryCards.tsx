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
  benchmarkP50?: number | null
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

export default function MetricSummaryCards({ current, previous, onMetricClick, selectedMetric, benchmarkP50 }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px mb-6 border border-white/20">
      {CARD_METRICS.map(({ key, higherIsBetter }, i) => {
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
            className={`p-4 text-left transition-colors ${
              isSelected
                ? 'bg-peach text-black'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <p className={`text-xs font-medium tracking-widest mb-1 ${
              isSelected ? 'text-black/50' : 'text-white/40'
            }`}>
              {METRIC_LABELS[key]}
            </p>
            <p className={`text-xl font-black ${isSelected ? 'text-black' : 'text-white'}`}>
              {value != null ? fmt(value) : '\u2014'}
            </p>
            {change != null && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                isPositive === null
                  ? (isSelected ? 'text-black/40' : 'text-white/30')
                  : isPositive
                    ? 'text-green-400'
                    : 'text-red-400'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                <span>{Math.abs(change * 100).toFixed(1)}%</span>
                <span className={isSelected ? 'text-black/30' : 'text-white/20'}>vs prior</span>
              </div>
            )}
            {isSelected && benchmarkP50 != null && (
              <p className={`text-[10px] mt-1 tracking-widest ${
                isSelected ? 'text-black/40' : 'text-white/30'
              }`}>
                Median: {fmt(benchmarkP50)}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
