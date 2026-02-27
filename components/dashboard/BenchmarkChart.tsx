'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
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
}

export default function BenchmarkChart({
  userSeries,
  benchmarkSeries,
  metric,
  showBenchmark,
}: Props) {
  // Merge user and benchmark series on date
  const dateSet = new Set([
    ...userSeries.map(d => d.date),
    ...benchmarkSeries.map(d => d.date),
  ])

  const userMap     = new Map(userSeries.map(d => [d.date, d.value]))
  const benchMap    = new Map(benchmarkSeries.map(d => [d.date, d]))

  const chartData = Array.from(dateSet)
    .sort()
    .map(date => {
      const bench = benchMap.get(date)
      return {
        date,
        you:    userMap.get(date) ?? null,
        median: bench?.median ?? null,
        p25:    bench?.p25    ?? null,
        p75:    bench?.p75    ?? null,
        // For the shaded band we use a range between p25 and p75
        band:   bench?.p25 != null && bench?.p75 != null
          ? [bench.p25, bench.p75] as [number, number]
          : null,
      }
    })

  const fmt = METRIC_FORMATS[metric]

  const formatTick = (v: number) => fmt(v)
  const formatDate = (d: string) => {
    try { return format(parseISO(d), 'MMM d') } catch { return d }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{METRIC_LABELS[metric]} over time</h2>

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
          />
          <YAxis
            tickFormatter={formatTick}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            width={70}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value != null ? fmt(value) : '—',
              name === 'you' ? 'You' : name === 'median' ? 'Benchmark (median)' : name,
            ]}
            labelFormatter={formatDate}
            contentStyle={{ fontSize: 13, borderRadius: 8 }}
          />
          <Legend
            formatter={(value) =>
              value === 'you' ? 'You' :
              value === 'median' ? 'Benchmark (median)' :
              value === 'band' ? 'Benchmark P25–P75 range' : value
            }
          />

          {/* Shaded P25-P75 band */}
          {showBenchmark && (
            <Area
              type="monotone"
              dataKey="p25"
              stroke="none"
              fill="none"
              legendType="none"
              dot={false}
              isAnimationActive={false}
            />
          )}
          {showBenchmark && (
            <Area
              type="monotone"
              dataKey="p75"
              stroke="none"
              fill="#0ea5e9"
              fillOpacity={0.08}
              legendType="square"
              name="band"
              dot={false}
              isAnimationActive={false}
            />
          )}

          {/* Benchmark median line */}
          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="median"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              name="median"
              connectNulls
            />
          )}

          {/* User's own line */}
          <Line
            type="monotone"
            dataKey="you"
            stroke="#0284c7"
            strokeWidth={2.5}
            dot={false}
            name="you"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
