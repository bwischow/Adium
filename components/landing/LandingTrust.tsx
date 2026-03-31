import { AnimatedHeading } from './AnimatedHeading'

export function LandingTrust() {
  const items = [
    { label: "We don't edit campaigns", icon: '&#x2717;' },
    { label: "We don't change budgets", icon: '&#x2717;' },
    { label: "We don't launch ads", icon: '&#x2717;' },
  ]

  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">06</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">Trust &amp; Security</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <AnimatedHeading
            as="h2"
            animateOnScroll
            balance
            text="Your data stays private."
            className="text-3xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-8"
          />

          <p className="text-base md:text-lg text-white/50 leading-relaxed max-w-2xl mb-6">
            Adium only uses read-only API access. That means:
          </p>

          <div className="space-y-3 mb-8">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-red-400 text-sm font-bold" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <span className="text-base md:text-lg text-white/60">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-base md:text-lg text-white/50 leading-relaxed max-w-2xl">
            <p>
              All benchmark data is fully anonymized before entering the dataset.
            </p>
            <p className="text-white/70 font-medium">
              Your account performance is never visible to other advertisers.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
