'use client'

interface Preset { label: string; days: number }

interface Props {
  preset: string
  presets: Preset[]
  customStart: string
  customEnd: string
  onPresetChange: (p: string) => void
  onCustomChange: (start: string, end: string) => void
}

export default function DateRangePicker({
  preset,
  presets,
  customStart,
  customEnd,
  onPresetChange,
  onCustomChange,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => onPresetChange(p.label)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              preset === p.label
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom range inputs */}
      <input
        type="date"
        value={customStart}
        onChange={e => onCustomChange(e.target.value, customEnd)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
      />
      <span className="text-gray-400 text-sm">→</span>
      <input
        type="date"
        value={customEnd}
        onChange={e => onCustomChange(customStart, e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
      />
    </div>
  )
}
