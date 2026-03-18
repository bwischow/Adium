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
          <p className="text-xs tracking-widest text-white/40 mb-2 font-medium">03</p>
          <p className="text-xs tracking-widest text-white/50 font-medium">What You&apos;ll Learn</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Within minutes you&apos;ll know:
          </h2>

          <ul className="space-y-4 max-w-xl">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-peach text-xs font-bold tracking-widest mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-white/70 leading-relaxed normal-case">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-white/50 leading-relaxed normal-case">
            Instead of guessing, you&apos;ll know exactly where you stand.
          </p>
        </div>
      </div>
    </section>
  )
}
