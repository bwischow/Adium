import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adium — How good are your ads?',
  description: 'Benchmark your paid media performance against anonymized industry peers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
