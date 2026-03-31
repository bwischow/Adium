import { AnimatedHeading } from './AnimatedHeading'

export function LandingProductShowcase() {
  return (
    <section className="border-b border-white/10">
      <div className="px-8 md:px-12 py-6 border-b border-white/10">
        <p className="text-xs tracking-widest text-white/30 font-medium uppercase">
          The Product
        </p>
      </div>

      <div className="px-8 md:px-12 py-8 border-b border-white/10">
        <AnimatedHeading
          as="h2"
          animateOnScroll
          balance
          text="See exactly where you stand."
          className="text-3xl md:text-5xl font-black text-white leading-[1.05] tracking-tight"
        />
      </div>

      <div className="px-4 md:px-12 py-12 md:py-16">
        {/* Dashboard mockup container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Annotation: Six core KPIs */}
          <Annotation
            label="Six core KPIs at a glance"
            position="top-left"
            className="hidden md:block absolute -top-2 left-[15%] -translate-y-full"
          />

          {/* Annotation: Real-time trends */}
          <Annotation
            label="Real-time trend tracking"
            position="top-right"
            className="hidden md:block absolute -top-2 right-[5%] -translate-y-full"
          />

          {/* The dashboard frame */}
          <div className="border border-white/20 bg-void overflow-hidden">
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-48 bg-terminal border-r border-black/10 flex-shrink-0">
                <div className="px-4 py-4 border-b border-black/10">
                  <p className="text-xs font-black tracking-widest text-black/80 uppercase">Adium</p>
                </div>
                <div className="px-4 py-3 border-b border-black/10">
                  <p className="text-[10px] text-black/40 tracking-wide uppercase mb-2">Company</p>
                  <p className="text-xs font-bold text-black/70">Acme Corp</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] text-black/40 tracking-wide uppercase mb-3">Sources</p>
                  <div className="space-y-2">
                    <SourcePill icon="G" name="Google Ads" />
                    <SourcePill icon="M" name="Meta Ads" />
                  </div>
                </div>
                <div className="mt-auto px-4 py-3 border-t border-black/10">
                  <p className="text-[10px] text-black/40 tracking-wide">2 accounts connected</p>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Metric tabs */}
                <div className="flex items-center gap-0 border-b border-white/10 overflow-x-auto">
                  <MetricTab label="CTR" value="2.4%" active={false} />
                  <MetricTab label="CPC" value="$3.21" active />
                  <MetricTab label="CPM" value="$18.50" active={false} />
                  <MetricTab label="ROAS" value="2.8x" active={false} />
                  <MetricTab label="CPA" value="$24.10" active={false} />
                  <MetricTab label="CPL" value="$6.75" active={false} />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <div className="flex items-center gap-1">
                    <DatePill label="7d" active={false} />
                    <DatePill label="30d" active />
                    <DatePill label="90d" active={false} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 tracking-wide uppercase">SaaS &middot; $10k-25k/mo</span>
                    <span className="text-[10px] bg-white/10 text-peach px-2 py-0.5 tracking-wide font-medium">12 peers in segment</span>
                  </div>
                </div>

                {/* Metric summary cards */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/5 border-b border-white/10">
                  <SummaryCard label="CTR" value="2.4%" trend="+0.3%" up />
                  <SummaryCard label="CPC" value="$3.21" trend="-$0.45" up selected />
                  <SummaryCard label="CPM" value="$18.50" trend="+$1.20" up={false} />
                  <SummaryCard label="ROAS" value="2.8x" trend="+0.4x" up />
                  <SummaryCard label="CPA" value="$24.10" trend="-$3.50" up />
                  <SummaryCard label="CPL" value="$6.75" trend="-$0.90" up />
                </div>

                {/* Chart area */}
                <div className="relative px-4 py-6 md:px-6 md:py-8">
                  <ChartMockup />

                  {/* Chart legend */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-[3px] bg-peach rounded-full" />
                      <span className="text-[10px] text-white/50 tracking-wide font-medium">Your CPC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-[3px] bg-white/45 rounded-full" />
                      <span className="text-[10px] text-white/50 tracking-wide font-medium">P50 Peer Median</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-[3px] bg-teal-300/50 rounded-full" />
                      <span className="text-[10px] text-white/50 tracking-wide font-medium">P75 Peer Top Quartile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Annotation: Your metrics vs the market */}
          <Annotation
            label="Your metrics vs. the market"
            position="bottom-left"
            className="hidden md:block absolute -bottom-2 left-[20%] translate-y-full"
          />

          {/* Annotation: Segmented by industry */}
          <Annotation
            label="Segmented by industry & spend"
            position="bottom-right"
            className="hidden md:block absolute -bottom-2 right-[5%] translate-y-full"
          />
        </div>

        {/* Mobile annotations (stacked below) */}
        <div className="md:hidden mt-8 grid grid-cols-2 gap-3">
          <MobileAnnotation label="Six core KPIs at a glance" />
          <MobileAnnotation label="Real-time trend tracking" />
          <MobileAnnotation label="Your metrics vs. the market" />
          <MobileAnnotation label="Segmented by industry & spend" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SourcePill({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 bg-black/10 flex items-center justify-center text-[9px] font-bold text-black/60">
        {icon}
      </span>
      <span className="text-[10px] text-black/50">{name}</span>
    </div>
  )
}

function MetricTab({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div
      className={`px-3 md:px-4 py-3 flex flex-col items-center gap-0.5 border-r border-white/10 flex-shrink-0 ${
        active ? 'bg-peach' : 'bg-transparent'
      }`}
    >
      <span className={`text-[9px] tracking-widest font-medium uppercase ${active ? 'text-black/50' : 'text-white/30'}`}>
        {label}
      </span>
      <span className={`text-xs font-bold tracking-tight ${active ? 'text-black' : 'text-white/60'}`}>
        {value}
      </span>
    </div>
  )
}

function DatePill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 text-[10px] tracking-wide font-medium ${
        active ? 'bg-white/10 text-white/60' : 'text-white/25'
      }`}
    >
      {label}
    </span>
  )
}

function SummaryCard({
  label,
  value,
  trend,
  up,
  selected,
}: {
  label: string
  value: string
  trend: string
  up: boolean
  selected?: boolean
}) {
  return (
    <div className={`px-3 py-3 ${selected ? 'bg-peach' : 'bg-transparent'}`}>
      <p className={`text-[9px] tracking-widest font-medium uppercase mb-1 ${selected ? 'text-black/40' : 'text-white/25'}`}>
        {label}
      </p>
      <p className={`text-sm font-bold tracking-tight ${selected ? 'text-black' : 'text-white/70'}`}>
        {value}
      </p>
      <p className={`text-[10px] mt-0.5 ${up ? (selected ? 'text-green-800' : 'text-green-400') : (selected ? 'text-red-800' : 'text-red-400')}`}>
        {up ? '\u2191' : '\u2193'} {trend}
      </p>
    </div>
  )
}

function ChartMockup() {
  return (
    <svg viewBox="0 0 500 180" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="0"
          y1={i * 35 + 10}
          x2="500"
          y2={i * 35 + 10}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="4 4"
        />
      ))}

      {/* P75 line - teal/cyan, solid, bold */}
      <polyline
        points="0,115 60,110 120,113 180,107 240,105 300,103 360,100 420,97 500,95"
        fill="none"
        stroke="#5EEAD4"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <circle cx="500" cy="95" r="3" fill="#5EEAD4" opacity="0.5" />

      {/* P50 median line - white, solid, bold */}
      <polyline
        points="0,88 60,85 120,91 180,83 240,80 300,84 360,78 420,75 500,72"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <circle cx="500" cy="72" r="3" fill="#ffffff" opacity="0.45" />

      {/* Your CPC line - peach, thickest */}
      <polyline
        points="0,98 60,82 120,70 180,75 240,58 300,62 360,48 420,42 500,32"
        fill="none"
        stroke="#F6D6B4"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="500" cy="32" r="5" fill="#F6D6B4" />

      {/* "You" label pinned to the line */}
      <text x="470" y="24" fill="#F6D6B4" fontSize="10" fontWeight="bold" fontFamily="inherit">YOU</text>

      {/* X-axis labels */}
      {['Feb 18', 'Feb 25', 'Mar 4', 'Mar 11', 'Mar 18'].map((label, i) => (
        <text
          key={i}
          x={i * 125}
          y="175"
          fill="rgba(255,255,255,0.2)"
          fontSize="9"
          fontFamily="inherit"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

function Annotation({
  label,
  position,
  className,
}: {
  label: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}) {
  const isTop = position.startsWith('top')

  return (
    <div className={className}>
      <div className={`flex flex-col items-center gap-1 ${isTop ? '' : 'flex-col-reverse'}`}>
        <span className="text-[11px] text-peach font-bold tracking-wide uppercase whitespace-nowrap">
          {label}
        </span>
        <span className="text-peach text-lg leading-none">{isTop ? '\u2193' : '\u2191'}</span>
      </div>
    </div>
  )
}

function MobileAnnotation({ label }: { label: string }) {
  return (
    <div className="border border-white/10 px-3 py-2.5 flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-peach flex-shrink-0" />
      <span className="text-xs text-white/50 tracking-wide">{label}</span>
    </div>
  )
}
