'use client'

import type { MetricName } from '@/types'
import { METRIC_LABELS } from '@/types'

interface Props {
  selected: MetricName
  onChange: (m: MetricName) => void
}

const METRICS: MetricName[] = ['ctr', 'cpc', 'cpm', 'roas', 'cpa']

export default function MetricTabs({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {METRICS.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selected === m
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {METRIC_LABELS[m]}
        </button>
      ))}
    </div>
  )
}
