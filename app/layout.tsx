import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adium — How good are your ads?',
  description: 'Benchmark your paid media performance against anonymized industry peers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
