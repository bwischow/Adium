export function LandingSocialProof() {
  return (
    <section className="border-b border-white/10">
      <div className="px-8 md:px-12 py-6 border-b border-white/10">
        <p className="text-xs tracking-widest text-white/30 font-medium">
          Benchmarks powered by real ad accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <StatCard value="$48M+" label="Monthly ad spend analyzed" />
        <StatCard value="1,000s" label="Campaigns in the dataset" />
        <StatCard value="Nightly" label="Benchmarks updated continuously" />
      </div>
    </section>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-8 md:px-10 py-10 flex flex-col">
      <p className="text-2xl md:text-3xl font-black text-peach tracking-tight mb-2">{value}</p>
      <p className="text-xs text-white/40 tracking-wide normal-case">{label}</p>
    </div>
  )
}
