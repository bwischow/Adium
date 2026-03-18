export function LandingAudience() {
  const audiences = [
    'Growth marketers',
    'Performance agencies',
    'Startup founders running ads',
    'Ecommerce operators',
    'Marketing consultants',
  ]

  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/40 mb-2 font-medium">07</p>
          <p className="text-xs tracking-widest text-white/50 font-medium">Who It&apos;s For</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Built for teams running serious advertising.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            {audiences.map((audience, i) => (
              <div key={i} className="flex items-center gap-3 border border-white/10 px-4 py-3">
                <span className="w-1.5 h-1.5 bg-peach flex-shrink-0" />
                <span className="text-sm text-white/70 normal-case">{audience}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-white/50 leading-relaxed normal-case">
            If you spend money on ads, you should know how you compare.
          </p>
        </div>
      </div>
    </section>
  )
}
