import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Adium',
  description: 'How Adium collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
        >
          &larr; Back to Adium
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 24, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Adium (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the
              Adium platform. This Privacy Policy explains how we collect, use, and protect
              information when you use our ad benchmarking service. By using Adium, you consent to
              the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Account Information</h3>
            <p className="text-gray-600 leading-relaxed">
              When you create an account, we collect your full name and email address. Authentication
              is handled through Supabase Auth.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Company Information</h3>
            <p className="text-gray-600 leading-relaxed">
              During onboarding, you provide a company name and select an industry classification.
              This information is used to group your benchmarks with relevant peers.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Ad Platform Data</h3>
            <p className="text-gray-600 leading-relaxed">
              When you connect your ad platform accounts via OAuth, we access read-only
              performance metrics including impressions, clicks, spend, conversions, and conversion
              value. We support connections to Google Ads, Meta Ads, LinkedIn Ads, and TikTok Ads.
              We do <strong>not</strong> access:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed mt-2">
              <li>Your ad creative content or copy</li>
              <li>Audience targeting settings</li>
              <li>Billing or payment information</li>
              <li>Personal data of the people who see your ads</li>
              <li>Campaign management or configuration settings</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">OAuth Tokens</h3>
            <p className="text-gray-600 leading-relaxed">
              We store encrypted OAuth access and refresh tokens to maintain your ad platform
              connections. These tokens grant read-only access only.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Usage Data</h3>
            <p className="text-gray-600 leading-relaxed">
              We collect standard usage data such as page views, feature usage, and server logs to
              improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              We process your data for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed">
              <li>To pull your ad performance metrics and display them on your dashboard</li>
              <li>
                To calculate anonymized, aggregated benchmarks across users in the same industry and
                spend tier
              </li>
              <li>To authenticate you and manage your account</li>
              <li>To improve, maintain, and secure the service</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              We do <strong>not</strong> use your data for advertising, profiling, building user
              profiles, or any purpose other than providing and improving the Adium benchmarking
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Platform-Specific Data Handling
            </h2>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Meta (Facebook) Platform Data</h3>
            <p className="text-gray-600 leading-relaxed">
              Data received from Meta APIs is used solely for the purpose of providing ad
              performance benchmarks to you. We comply with the{' '}
              <a
                href="https://developers.facebook.com/terms/"
                className="text-brand-600 hover:text-brand-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meta Platform Terms
              </a>{' '}
              and{' '}
              <a
                href="https://developers.facebook.com/devpolicy/"
                className="text-brand-600 hover:text-brand-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Developer Policies
              </a>
              . Specifically:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed mt-2">
              <li>We request only the <code className="text-sm bg-gray-100 px-1 rounded">ads_read</code> permission (read-only access to ad account metrics).</li>
              <li>We do not sell, license, or transfer Meta Platform Data to any third party.</li>
              <li>We do not use Meta Platform Data to build or augment user profiles.</li>
              <li>We do not use Meta Platform Data for surveillance, discrimination, or eligibility determinations.</li>
              <li>Meta Platform Data is deleted when you disconnect your account, request deletion, or when no longer needed for the benchmarking service.</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Google Ads Data</h3>
            <p className="text-gray-600 leading-relaxed">
              Our use of Google Ads data is subject to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-brand-600 hover:text-brand-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              .
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">LinkedIn Ads Data</h3>
            <p className="text-gray-600 leading-relaxed">
              Our use of LinkedIn Ads data is subject to the{' '}
              <a
                href="https://legal.linkedin.com/api-terms-of-use"
                className="text-brand-600 hover:text-brand-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn API Terms of Use
              </a>
              .
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">TikTok Ads Data</h3>
            <p className="text-gray-600 leading-relaxed">
              Our use of TikTok Ads data is subject to the{' '}
              <a
                href="https://ads.tiktok.com/marketing_api/docs?id=1701890925754369"
                className="text-brand-600 hover:text-brand-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok for Business Developer Terms
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Benchmarking and Anonymization
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your individual ad performance data is <strong>never</strong> shared with other users.
              Benchmarks are computed as statistical aggregates (median, 25th percentile, 75th
              percentile) across a minimum threshold of accounts per industry and spend-tier segment.
              Individual account data cannot be reverse-engineered from these aggregates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Sharing</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 leading-relaxed">
              <li>
                <strong>We do not sell your data.</strong> We do not sell, license, or purchase
                any Platform Data received from ad platforms.
              </li>
              <li>We do not share individual account data with third parties.</li>
              <li>
                Aggregated benchmark data (which cannot identify you) may be used in marketing
                materials or industry reports.
              </li>
              <li>
                We share data with service providers who process data on our behalf under contractual
                obligations, including Supabase (database and authentication) and Vercel (hosting).
                These service providers are contractually required to use your data only for
                providing their services to us and to maintain its confidentiality.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Storage and Security</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data is stored in Supabase (PostgreSQL) with row-level security policies. OAuth
              tokens are encrypted at rest using Supabase Vault. The service is hosted on Vercel
              with HTTPS encryption in transit. Access is restricted by authentication and
              authorization checks at the middleware and API level. We maintain administrative,
              physical, and technical safeguards designed to protect against unauthorized access,
              destruction, loss, alteration, or disclosure of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your ad performance metrics for as long as your ad account is actively
              connected and your Adium account is active. When you deactivate an ad account
              connection (stopping new data pulls), we retain existing metrics for up to 90 days
              to allow you to reactivate and resume benchmarking. After 90 days of inactivity,
              metrics for deactivated accounts are automatically deleted. When you disconnect an
              account or delete your account, all associated data (metrics and tokens) is deleted
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights and Choices</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 leading-relaxed">
              <li>
                <strong>Disconnect accounts:</strong> You can disconnect any ad account from your
                company settings at any time. This permanently deletes the account connection and
                all associated metrics.
              </li>
              <li>
                <strong>Delete account data:</strong> You can delete individual ad accounts and
                their data from the Connected Accounts tab in your company settings.
              </li>
              <li>
                <strong>Request full account deletion:</strong> You can request deletion of your
                entire Adium account and all associated data by emailing{' '}
                <a
                  href="mailto:privacy@adium.com"
                  className="text-brand-600 hover:text-brand-700 transition-colors"
                >
                  privacy@adium.com
                </a>
                .
              </li>
              <li>
                <strong>Revoke OAuth access:</strong> You can revoke Adium&rsquo;s access directly
                from your Google, Meta, LinkedIn, or TikTok account settings at any time.
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              For detailed instructions on how to delete your data, visit our{' '}
              <Link
                href="/data-deletion"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                Data Deletion page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              Adium integrates with the following third-party services, each subject to their own
              privacy policies:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed">
              <li>Google Ads API - subject to Google&rsquo;s API Services User Data Policy</li>
              <li>Meta Marketing API - subject to Meta&rsquo;s Platform Terms</li>
              <li>LinkedIn Marketing API - subject to LinkedIn&rsquo;s API Terms of Use</li>
              <li>TikTok Business API - subject to TikTok&rsquo;s Developer Terms</li>
              <li>Supabase - database and authentication provider</li>
              <li>Vercel - hosting provider</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be
              communicated via the email address associated with your account. Continued use of the
              service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy or want to exercise your data rights,
              please contact us at{' '}
              <a
                href="mailto:privacy@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                privacy@adium.com
              </a>
              . For security vulnerabilities, contact{' '}
              <a
                href="mailto:security@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                security@adium.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
