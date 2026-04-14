'use client'

interface Props {
  current: {
    clicks: number
    impressions: number
    spend: number
    conversions: number
    all_conversions: number
  }
}

const RAW_METRICS: { key: keyof Props['current']; label: string; format: (v: number) => string }[] = [
  { key: 'clicks',          label: 'CLICKS',          format: (v) => v.toLocaleString() },
  { key: 'impressions',     label: 'IMPRESSIONS',     format: (v) => v.toLocaleString() },
  { key: 'spend',           label: 'COST',            format: (v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  { key: 'conversions',     label: 'CONVERSIONS',     format: (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
  { key: 'all_conversions', label: 'ALL CONVERSIONS', format: (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
]

export default function RawMetricsTiles({ current }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px mb-4 border border-peach/20">
      {RAW_METRICS.map(({ key, label, format }) => (
        <div key={key} className="p-3 bg-white/5">
          <p className="text-[10px] font-medium tracking-widest text-peach/50 mb-0.5">
            {label}
          </p>
          <p className="text-lg font-black text-white">
            {format(current[key])}
          </p>
        </div>
      ))}
    </div>
  )
}
