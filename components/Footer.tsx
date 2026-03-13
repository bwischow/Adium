import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
        <span>&copy; {new Date().getFullYear()} Adium. All rights reserved.</span>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  )
}
