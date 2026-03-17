import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adium.io'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Adium — Ad Benchmarks from Real Advertisers',
    template: '%s — Adium',
  },
  description:
    'Benchmark your Google Ads and Meta Ads performance against real, anonymized industry peers. Segmented by industry, spend tier, and platform.',
  openGraph: {
    title: 'Adium — Ad Benchmarks from Real Advertisers',
    description:
      'See how your CPC, CPA, CTR, and ROAS compare to advertisers with similar spend, industry, and goals.',
    type: 'website',
    siteName: 'Adium',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adium — Ad Benchmarks from Real Advertisers',
    description:
      'See how your CPC, CPA, CTR, and ROAS compare to advertisers with similar spend, industry, and goals.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
