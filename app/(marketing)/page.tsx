import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingDifferentiators } from '@/components/landing/LandingDifferentiators'
import { LandingCTA } from '@/components/landing/LandingCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'ADIUM // Benchmark Intelligence System',
  description:
    'Benchmark your Google Ads and Meta Ads performance against anonymized industry peers. Real data, not blog averages.',
  openGraph: {
    title: 'ADIUM // Benchmark Intelligence System',
    description:
      'Benchmark your ad performance against real industry peers.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <LandingHero />
      <LandingProblem />
      <LandingDifferentiators />
      <LandingCTA />
      <LandingFooter />
    </>
  )
}
