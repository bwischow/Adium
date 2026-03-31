import { AnimatedHeading } from './AnimatedHeading'

export function LandingAudience() {
  const audiences = [
    'Growth marketers',
    'Performance agencies',
    'Startup founders running ads',
    'Ecommerce operators',
    'Marketing consultants',
    'First-time advertisers',
    'Small business owners',
  ]

  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">07</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">Who It&apos;s For</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <AnimatedHeading
            as="h2"
            animateOnScroll
            balance
            text="Built for anyone spending money on ads."
            className="text-3xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-8"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            {audiences.map((audience, i) => (
              <div key={i} className="flex items-center gap-3 border border-white/10 px-4 py-3">
                <span className="w-1.5 h-1.5 bg-peach flex-shrink-0" />
                <span className="text-base text-white/60">{audience}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-base text-white/40 leading-relaxed">
            If you spend money on ads, you should know how you compare.
          </p>
        </div>
      </div>
    </section>
  )
}
