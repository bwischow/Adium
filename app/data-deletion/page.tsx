import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Deletion - Adium',
  description: 'How to request deletion of your data from Adium.',
}

export default function DataDeletionPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
        >
          &larr; Back to Adium
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Data Deletion</h1>
        <p className="text-sm text-gray-400 mb-10">How to delete your data from Adium</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Automatic Deletion via Facebook
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you connected your Meta Ads account to Adium and request data deletion through
              Facebook, Meta will automatically notify us and we will delete all data associated
              with your Meta account, including ad performance metrics and OAuth tokens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Delete Data from Your Adium Account
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You can delete your data directly from the Adium dashboard at any time:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2 leading-relaxed">
              <li>
                Log in to your Adium account and navigate to your company settings.
              </li>
              <li>
                Go to the <strong>Connected Accounts</strong> tab.
              </li>
              <li>
                Click the three-dot menu next to the account you want to remove.
              </li>
              <li>
                Select <strong>Delete account &amp; data</strong> to permanently remove the
                connected account and all associated metrics.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Request Full Account Deletion
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To delete your entire Adium account and all associated data, email us at{' '}
              <a
                href="mailto:privacy@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                privacy@adium.com
              </a>{' '}
              with the subject line &ldquo;Account Deletion Request&rdquo; from the email address
              associated with your account. We will process your request and confirm deletion
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Revoke Access Directly
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You can also revoke Adium&rsquo;s access to your ad platform data at any time
              through your platform settings:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 leading-relaxed mt-2">
              <li>
                <strong>Meta/Facebook:</strong> Settings &amp; Privacy &rarr; Settings &rarr;
                Apps and Websites &rarr; Remove Adium
              </li>
              <li>
                <strong>Google:</strong> Google Account &rarr; Security &rarr; Third-party
                apps &rarr; Remove Adium
              </li>
              <li>
                <strong>LinkedIn:</strong> Settings &rarr; Data Privacy &rarr; Permitted
                Services &rarr; Remove Adium
              </li>
              <li>
                <strong>TikTok:</strong> Settings &rarr; Security &rarr; Manage App
                Permissions &rarr; Remove Adium
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Deletion Confirmation
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you were redirected here after requesting deletion through Facebook, your data
              deletion request has been received and is being processed. All Meta-related data
              associated with your account will be permanently removed.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              For questions about your data deletion request, contact us at{' '}
              <a
                href="mailto:privacy@adium.com"
                className="text-brand-600 hover:text-brand-700 transition-colors"
              >
                privacy@adium.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
