'use client'

import type { MetricName } from '@/types'
import { METRIC_LABELS } from '@/types'

interface Props {
  selected: MetricName
  onChange: (m: MetricName) => void
}

const METRICS: MetricName[] = ['ctr', 'cpc', 'cpm', 'roas', 'cpa', 'cpl']

export default function MetricTabs({ selected, onChange }: Props) {
  return (
    <div className="flex border border-white/20 overflow-x-auto">
      {METRICS.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold tracking-widest transition-colors border-r border-white/20 last:border-r-0 flex-shrink-0 ${
            selected === m
              ? 'bg-peach text-black'
              : 'bg-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          {METRIC_LABELS[m]}
        </button>
      ))}
    </div>
  )
}
