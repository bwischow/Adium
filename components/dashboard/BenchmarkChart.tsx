'use client'

import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { MetricName, DailyPoint, BenchmarkSeries } from '@/types'
import { METRIC_LABELS, METRIC_FORMATS } from '@/types'

interface Props {
  userSeries: DailyPoint[]
  benchmarkSeries: BenchmarkSeries[]
  metric: MetricName
  showBenchmark: boolean
  isHistoricalFallback?: boolean
}

export default function BenchmarkChart({
  userSeries,
  benchmarkSeries,
  metric,
  showBenchmark,
  isHistoricalFallback,
}: Props) {
  const dateSet = new Set([
    ...userSeries.map(d => d.date),
    ...benchmarkSeries.map(d => d.date),
  ])

  const userMap  = new Map(userSeries.map(d => [d.date, d.value]))
  const benchMap = new Map(benchmarkSeries.map(d => [d.date, d]))

  const chartData = Array.from(dateSet)
    .sort()
    .map(date => {
      const bench = benchMap.get(date)
      return {
        date,
        you: userMap.get(date) ?? null,
        p50: bench?.p50 ?? null,
        p75: bench?.p75 ?? null,
        p90: bench?.p90 ?? null,
      }
    })

  const fmt = METRIC_FORMATS[metric]

  const formatTick = (v: number) => fmt(v)
  const formatDate = (d: string) => {
    try { return format(parseISO(d), 'MMM d') } catch { return d }
  }

  const tooltipNames: Record<string, string> = {
    you: 'You',
    p50: isHistoricalFallback ? 'Your Median' : 'Median (50th pctl)',
    p75: isHistoricalFallback ? 'Your 75th pctl' : '75th Percentile',
    p90: isHistoricalFallback ? 'Your 90th pctl' : '90th Percentile',
  }

  return (
    <div>
      <h2 className="text-xs font-bold tracking-widest text-white/50 mb-4">
        {METRIC_LABELS[metric]} over time
      </h2>

      {isHistoricalFallback && (
        <p className="text-[10px] text-white/30 tracking-widest mb-3">
          Comparing against your own historical performance
        </p>
      )}

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            stroke="rgba(255,255,255,0.1)"
          />
          <YAxis
            tickFormatter={formatTick}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            width={70}
            stroke="rgba(255,255,255,0.1)"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value != null ? fmt(value) : '\u2014',
              tooltipNames[name] ?? name,
            ]}
            labelFormatter={formatDate}
            contentStyle={{
              fontSize: 11,
              backgroundColor: '#000',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 0,
              color: '#fff',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}
          />
          <Legend
            formatter={(value) => tooltipNames[value] ?? value}
            wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}
          />

          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="p50"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              name="p50"
              connectNulls
            />
          )}

          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="p75"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="p75"
              connectNulls
            />
          )}

          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="p90"
              stroke="#F6D6B4"
              strokeWidth={1.5}
              strokeDasharray="2 3"
              dot={false}
              name="p90"
              opacity={0.5}
              connectNulls
            />
          )}

          <Line
            type="monotone"
            dataKey="you"
            stroke="#F6D6B4"
            strokeWidth={2}
            dot={false}
            name="you"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
