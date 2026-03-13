import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Adium',
  description: 'Terms and conditions for using the Adium ad benchmarking platform.',
}

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
        >
          &larr; Back to Adium
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 13, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By creating an account or using Adium, you agree to be bound by these Terms of
              Service. If you do not agree to these terms, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Adium is an ad benchmarking platform. You connect your Google Ads and/or Meta Ads
              accounts, and we provide performance benchmarks comparing your metrics against
              anonymized industry peers. The service pulls read-only performance data from your
              connected ad accounts and displays it alongside aggregate benchmarks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Account Registration</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed">
              <li>You must provide a valid email address and accurate information.</li>
              <li>
                You are responsible for maintaining the security of your account credentials.
              </li>
              <li>You must be at least 18 years old to use the service.</li>
              <li>Each account is for a single person or entity.</li>
              <li>
                You are responsible for all activity that occurs under your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Ad Platform Connections and Authorization
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 leading-relaxed">
              <li>
                By connecting a Google Ads or Meta Ads account, you represent that you have
                authorization to grant Adium read-only access to that account&rsquo;s performance
                data.
              </li>
              <li>
                If you are an agency connecting client accounts, you represent that you have your
                client&rsquo;s consent to share their ad performance data with Adium for
                benchmarking purposes.
              </li>
              <li>
                Adium accesses data in <strong>read-only mode</strong>. We do not modify your ad
                campaigns, budgets, bids, or any other settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed">
              <li>
                Attempt to reverse-engineer benchmark data to identify individual accounts or users
              </li>
              <li>Use the service for any unlawful purpose</li>
              <li>Interfere with or disrupt the service or its infrastructure</li>
              <li>Automate access to the service beyond normal browser usage</li>
              <li>
                Share your account credentials or allow others to access your account
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data and Benchmarking</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 leading-relaxed">
              <li>
                Your ad performance data contributes to anonymized, aggregated benchmarks. By using
                the service, you consent to this aggregation.
              </li>
              <li>
                Benchmarks are provided &ldquo;as-is&rdquo; and are based on data contributed by
                other users. We do not guarantee their accuracy, completeness, or suitability for
                any specific business decision.
              </li>
              <li>
                You retain ownership of your raw ad performance data. Adium retains the right to
                use aggregated, anonymized benchmark data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Adium service, brand, design, and technology are owned by Adium. Benchmark
              methodologies, aggregation algorithms, and presentation formats are proprietary. You
              may not copy, modify, or distribute any part of the service without our written
              consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Service Availability and Changes
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed">
              <li>Adium is provided on an &ldquo;as-is&rdquo; basis. We do not guarantee 100% uptime.</li>
              <li>We may modify, suspend, or discontinue features at any time.</li>
              <li>We will make reasonable efforts to notify you of material changes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Pricing and Beta</h2>
            <p className="text-gray-600 leading-relaxed">
              Adium is currently offered as a free service. If pricing is introduced in the future,
              you will be given advance notice and the option to continue or terminate your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Adium is not liable for business decisions made based on benchmark data. The service
              is provided without warranties of any kind, express or implied, including but not
              limited to warranties of merchantability, fitness for a particular purpose, or
              non-infringement. To the maximum extent permitted by law, our total liability is
              limited to the amount you have paid for the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Termination</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed">
              <li>You may close your account at any time by contacting us.</li>
              <li>
                We may terminate or suspend your account if you violate these terms.
              </li>
              <li>
                Upon termination, your data will be deleted in accordance with our{' '}
                <Link
                  href="/privacy"
                  className="text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to These Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms of Service from time to time. Continued use of the service
              after changes constitutes acceptance of the updated terms. Material changes will be
              communicated via the email address associated with your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about these Terms of Service, please contact us at{' '}
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
