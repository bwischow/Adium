import Link from 'next/link'

export function LandingHero() {
  return (
    <section className="min-h-screen flex flex-col pt-16">
      {/* Hero - full-width centered */}
      <div className="flex-1 bg-peach flex flex-col items-center justify-center px-8 md:px-16 py-20 lg:py-24 text-center">
        <p className="text-xs tracking-widest text-black/40 mb-8 font-medium uppercase">
          Ad Benchmarking for Real Advertisers
        </p>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-[0.95] tracking-tight mb-8 max-w-3xl">
          Know if your ads
          <br />
          are actually good.
        </h1>

        <p className="text-base md:text-lg text-black/50 max-w-xl mb-10 leading-relaxed">
          Connect your Google or Meta Ads account and instantly see how your CPC,
          CPA, and ROAS compare to advertisers with similar spend, industry, and
          goals.
        </p>

        <div>
          <Link
            href="/signup"
            className="inline-block bg-black text-peach text-sm font-bold tracking-widest px-10 py-4 hover:bg-black/80 transition-colors uppercase"
          >
            Join The Waitlist - Free
          </Link>
          <p className="mt-4 text-xs text-black/35 tracking-wide">
            Be the first to know when we launch.
          </p>
        </div>
      </div>

      {/* Status bar - compact horizontal, replaces the old side panel */}
      <div className="bg-terminal border-t border-black">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-3">
          <StatusPill label="Data Pipeline" value="Active" />
          <StatusPill label="Peer Matching" value="Online" />
          <StatusPill label="Benchmarks" value="Updated Nightly" />
          <StatusPill label="Platforms" value="Google · Meta" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-black animate-blink rounded-full" />
            <span className="text-xs text-black/40 tracking-widest uppercase">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-black border-t border-white/10 px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-white/30 tracking-widest">ADIUM</span>
        <span className="text-xs text-white/30 tracking-widest hidden sm:block">
          Benchmark intelligence for digital advertisers.
        </span>
        <span className="text-xs text-white/30 tracking-widest">
          {new Date().getFullYear()}
        </span>
      </div>
    </section>
  )
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-1 bg-black/30 rounded-full" />
      <span className="text-xs text-black/40 tracking-wide">{label}</span>
      <span className="text-xs font-semibold text-black/70 tracking-wide">{value}</span>
    </div>
  )
}
