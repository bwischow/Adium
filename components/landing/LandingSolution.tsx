export function LandingSolution() {
  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left - section label */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">02</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">The Solution</p>
        </div>

        {/* Right - content */}
        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Adium shows how your ads compare to real advertisers like you.
          </h2>

          <div className="space-y-4 text-sm text-white/50 leading-relaxed max-w-xl">
            <p>
              Instead of generic averages, Adium benchmarks your campaigns against
              advertisers with similar:
            </p>
            <ul className="space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-peach mt-0.5">&#x2022;</span>
                <span>Industry</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-peach mt-0.5">&#x2022;</span>
                <span>Monthly ad spend</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-peach mt-0.5">&#x2022;</span>
                <span>Campaign objective</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-peach mt-0.5">&#x2022;</span>
                <span>Advertising platform</span>
              </li>
            </ul>
          </div>

          <div className="mt-10 bg-white/5 border border-white/10 px-6 py-5">
            <p className="text-sm text-white/60 leading-relaxed">
              A $5k/month SaaS advertiser shouldn&apos;t be compared to a $500k ecommerce brand.
              <br />
              <span className="text-white font-medium">Adium ensures you&apos;re comparing apples to apples.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
