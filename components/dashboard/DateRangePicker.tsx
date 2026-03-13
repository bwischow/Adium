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
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex border border-white/20">
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => onPresetChange(p.label)}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-bold tracking-widest transition-colors border-r border-white/20 last:border-r-0 ${
              preset === p.label
                ? 'bg-white text-black'
                : 'bg-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <input
          type="date"
          value={customStart}
          onChange={e => onCustomChange(e.target.value, customEnd)}
          className="border border-white/20 bg-transparent px-2 py-1 text-xs text-white/70 focus:outline-none focus:border-peach"
        />
        <span className="text-white/30 text-xs">&rarr;</span>
        <input
          type="date"
          value={customEnd}
          onChange={e => onCustomChange(customStart, e.target.value)}
          className="border border-white/20 bg-transparent px-2 py-1 text-xs text-white/70 focus:outline-none focus:border-peach"
        />
      </div>
    </div>
  )
}
