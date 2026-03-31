import { AnimatedHeading } from './AnimatedHeading'

export function LandingWhatYoullLearn() {
  const items = [
    'Whether your CPC is above or below market',
    'If your conversion rate is competitive',
    'Whether your CPA is efficient for your spend tier',
    'Where your campaigns outperform peers',
    'When your performance drifts outside normal ranges',
  ]

  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">03</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">What You&apos;ll Learn</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <AnimatedHeading
            as="h2"
            animateOnScroll
            balance
            text="Within minutes you'll know:"
            className="text-3xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-8"
          />

          <ul className="space-y-4 max-w-2xl">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-peach text-xs font-bold tracking-widest mt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-base md:text-lg text-white/60 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-base text-white/40 leading-relaxed">
            Instead of guessing, you&apos;ll know exactly where you stand.
          </p>
        </div>
      </div>
    </section>
  )
}
