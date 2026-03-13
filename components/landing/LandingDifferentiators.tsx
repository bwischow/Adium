export function LandingDifferentiators() {
  return (
    <section className="border-b border-white/10">
      <div className="px-8 md:px-12 py-6 border-b border-white/10">
        <p className="text-xs tracking-widest text-white/30 font-medium">The Exchange</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <FeatureCard
          number="01"
          title="Connect Your Accounts"
          description="Link your Google or Meta Ads. Your performance data is anonymized and added to the industry pool — your identity is never shared."
          bg="bg-peach"
          textColor="text-black"
        />
        <FeatureCard
          number="02"
          title="Give Data, Get Data"
          description="Every advertiser contributes, every advertiser benefits. The more accounts in the pool, the sharper your benchmarks become."
          bg="bg-terminal"
          textColor="text-black"
        />
        <FeatureCard
          number="03"
          title="Always Current, Always Real"
          description="Benchmarks recalculate nightly from live pool data. No stale reports, no six-month-old snapshots — just the market as it is right now."
          bg="bg-white"
          textColor="text-black"
        />
      </div>
    </section>
  )
}

function FeatureCard({
  number,
  title,
  description,
  bg,
  textColor,
}: {
  number: string
  title: string
  description: string
  bg: string
  textColor: string
}) {
  return (
    <div className={`${bg} px-8 md:px-10 py-12 flex flex-col`}>
      <p className={`text-xs tracking-widest ${textColor} opacity-30 mb-6 font-medium`}>
        {number}
      </p>
      <h3 className={`text-lg font-bold ${textColor} mb-4 tracking-tight`}>
        {title}
      </h3>
      <p className={`text-sm ${textColor} opacity-60 leading-relaxed`}>
        {description}
      </p>
    </div>
  )
}
