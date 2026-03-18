export function LandingHowItWorks() {
  return (
    <section className="border-b border-white/10">
      <div className="px-8 md:px-12 py-6 border-b border-white/10">
        <p className="text-xs tracking-widest text-white/30 font-medium uppercase">
          How It Works
        </p>
      </div>

      <div className="px-8 md:px-12 py-8 border-b border-white/10">
        <h2 className="text-2xl md:text-3xl font-black text-white leading-[1.05] tracking-tight">
          Adium is a data exchange for advertising performance.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <StepCard number="01" title="Connect" description="Link your Google or Meta Ads account with read-only access." bg="bg-peach" />
        <StepCard number="02" title="Anonymize" description="Campaign data is anonymized and aggregated into the peer pool." bg="bg-terminal" />
        <StepCard number="03" title="Benchmark" description="Adium generates segmented benchmarks for your industry and spend tier." bg="bg-white" />
        <StepCard number="04" title="Compare" description="See exactly how your campaigns perform relative to similar advertisers." bg="bg-peach" />
      </div>

      <div className="px-8 md:px-12 py-6 border-t border-white/10">
        <p className="text-xs text-white/30 tracking-wide">
          The more advertisers who participate, the better the benchmarks become.
        </p>
      </div>
    </section>
  )
}

function StepCard({ number, title, description, bg }: { number: string; title: string; description: string; bg: string }) {
  return (
    <div className={`${bg} px-8 md:px-8 py-10 flex flex-col`}>
      <p className="text-xs tracking-widest text-black/30 mb-4 font-medium uppercase">{number}</p>
      <h3 className="text-lg font-bold text-black mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-black/60 leading-relaxed">{description}</p>
    </div>
  )
}
