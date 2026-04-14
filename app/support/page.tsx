import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support - Adium',
  description: 'Get help with your Adium account, report issues, or contact our team.',
}

export default function SupportPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
        >
          &larr; Back to Adium
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Support</h1>
        <p className="text-sm text-gray-400 mb-10">
          Get help with your account, report issues, or contact our team
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">General Support</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about using Adium, account issues, or technical problems, email us at{' '}
              <a
                href="mailto:support@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                support@adium.com
              </a>
              . We aim to respond within one business day.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Report an Issue</h2>
            <p className="text-gray-600 leading-relaxed">
              If you encounter a bug, data discrepancy, or unexpected behavior, please email{' '}
              <a
                href="mailto:support@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                support@adium.com
              </a>{' '}
              with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed mt-2">
              <li>A description of the issue</li>
              <li>The ad platform and account affected (if applicable)</li>
              <li>Steps to reproduce the problem</li>
              <li>Any error messages you see</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Privacy and Data Requests
            </h2>
            <p className="text-gray-600 leading-relaxed">
              For data deletion requests, privacy inquiries, or to exercise your data rights,
              contact us at{' '}
              <a
                href="mailto:privacy@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                privacy@adium.com
              </a>
              . You can also manage your data directly from your{' '}
              <strong>Company Settings &rarr; Connected Accounts</strong> tab, or visit our{' '}
              <Link
                href="/data-deletion"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                Data Deletion page
              </Link>{' '}
              for detailed instructions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Security Vulnerabilities</h2>
            <p className="text-gray-600 leading-relaxed">
              If you discover a security vulnerability, please report it responsibly to{' '}
              <a
                href="mailto:security@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                security@adium.com
              </a>
              . Do not disclose security issues publicly until we have had an opportunity to
              address them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Legal</h2>
            <p className="text-gray-600 leading-relaxed">
              For legal inquiries, terms of service questions, or partnership requests, contact{' '}
              <a
                href="mailto:legal@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                legal@adium.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
