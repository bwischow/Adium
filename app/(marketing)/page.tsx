import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'
import { LandingProductShowcase } from '@/components/landing/LandingProductShowcase'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingSolution } from '@/components/landing/LandingSolution'
import { LandingWhatYoullLearn } from '@/components/landing/LandingWhatYoullLearn'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingNetwork } from '@/components/landing/LandingNetwork'
import { LandingTrust } from '@/components/landing/LandingTrust'
import { LandingAudience } from '@/components/landing/LandingAudience'
import { LandingCTA } from '@/components/landing/LandingCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Adium - Know If Your Ads Are Actually Good',
  description:
    'Benchmark your Google Ads and Meta Ads campaigns against real advertisers with similar spend, industry, and goals. Free, read-only, no credit card required.',
  openGraph: {
    title: 'Adium - Know If Your Ads Are Actually Good',
    description:
      'Benchmark your CPC, CPA, conversion rate, and ROAS against real advertisers like you.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <LandingHero />
      <LandingSocialProof />
      <LandingProductShowcase />
      <LandingProblem />
      <LandingSolution />
      <LandingWhatYoullLearn />
      <LandingHowItWorks />
      <LandingNetwork />
      <LandingTrust />
      <LandingAudience />
      <LandingCTA />
      <LandingFooter />
    </>
  )
}
