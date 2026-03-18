import Link from 'next/link'

export function LandingHero() {
  return (
    <section className="min-h-screen flex flex-col pt-16">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left — headline + CTA */}
        <div className="flex-1 bg-peach border-b lg:border-b-0 lg:border-r border-black flex flex-col justify-center px-8 md:px-16 py-20 lg:py-24">
          <p className="text-xs tracking-widest text-black/50 mb-8 font-medium">
            Benchmark Intelligence System
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-[0.95] tracking-tight mb-8">
            Know if your
            <br />
            ads are
            <br />
            actually good.
          </h1>

          <p className="text-sm md:text-base text-black/70 max-w-lg mb-4 leading-relaxed normal-case">
            Benchmark your Google and Meta campaigns against real advertisers
            with similar spend, industry, and goals.
          </p>
          <p className="text-sm md:text-base text-black/70 max-w-lg mb-10 leading-relaxed normal-case">
            Adium shows you exactly how your CPC, CPA, conversion rate, and
            ROAS compare to the market.
          </p>

          <div className="pb-4">
            <Link
              href="/signup"
              className="inline-block bg-black text-peach text-sm font-bold tracking-widest px-8 py-4 hover:bg-black/80 transition-colors"
            >
              Sign up for free
            </Link>
            <p className="mt-4 text-xs text-black/50 tracking-wide normal-case">
              Read-only access. No credit card required.
            </p>
          </div>
        </div>

        {/* Right — system status panel */}
        <div className="w-full lg:w-80 bg-terminal flex flex-col">
          <div className="border-b border-black px-6 py-4">
            <p className="text-xs tracking-widest text-black/50 font-medium">System Status</p>
          </div>

          <div className="flex-1 px-6 py-6 space-y-6">
            <StatusRow label="Data Pipeline" value="Active" active />
            <StatusRow label="Peer Matching" value="Online" active />
            <StatusRow label="Benchmark Index" value="Updated Daily" active />
            <StatusRow label="Platforms" value="Google / Meta" active />
          </div>

          <div className="border-t border-black px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black animate-blink" />
              <span className="text-xs text-black/50 tracking-widest">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black border-t border-white/10 px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-white/40 tracking-widest">ADIUM V1.0</span>
        <span className="text-xs text-white/40 tracking-widest normal-case">
          Connect your ad accounts and find out where you stack up in under 60 seconds.
        </span>
        <span className="text-xs text-white/40 tracking-widest">
          {new Date().getFullYear()}
        </span>
      </div>
    </section>
  )
}

function StatusRow({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-black/60 tracking-wide">{label}</span>
      <div className="flex items-center gap-2">
        {active && <span className="w-1.5 h-1.5 bg-black" />}
        <span className="text-xs font-medium text-black tracking-wide">{value}</span>
      </div>
    </div>
  )
}
