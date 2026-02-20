import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Archaeolist',
  description: 'Terms of Service for Archaeolist — the rules and guidelines for using our archaeological sites directory.',
  alternates: {
    canonical: 'https://archaeolist.com/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="flex-1 w-full overflow-auto">
      <div className="mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 2026</p>

        <div className="space-y-10 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Archaeolist (&quot;the Service&quot;), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use the Service. These terms apply to all
              visitors and users of Archaeolist.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Use of the Service</h2>
            <p>
              Archaeolist provides an informational directory of archaeological sites around the world. You may use
              the Service for personal, non-commercial purposes in accordance with these terms.
            </p>
            <p className="mt-3">You agree not to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Scrape, crawl, or systematically download content from the Service without our written permission</li>
              <li>Reproduce or redistribute our content without attribution and permission</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its underlying systems</li>
              <li>Use the Service to transmit spam, malware, or any harmful content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Intellectual Property</h2>
            <p>
              All content on Archaeolist — including text, descriptions, images, logos, and data — is the property
              of Archaeolist or its content suppliers and is protected by applicable intellectual property laws.
            </p>
            <p className="mt-3">
              You may share links to Archaeolist pages and quote brief excerpts with proper attribution. You may not
              reproduce substantial portions of our content without express written permission.
            </p>
            <p className="mt-3">
              Some images displayed on Archaeolist may be sourced from third-party providers and are subject to
              their respective licenses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. User Conduct</h2>
            <p>
              Archaeolist is intended to be a useful, informative resource for people interested in archaeology and
              history. We ask that all users engage with the Service respectfully and in good faith.
            </p>
            <p className="mt-3">
              We reserve the right to restrict or terminate access to the Service for users who violate these terms
              or engage in abusive behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites, including Viator for tour bookings and external
              resources for archaeological information. These links are provided for convenience only. Archaeolist is
              not responsible for the content, accuracy, or practices of any third-party sites. Visiting third-party
              sites is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Disclaimers</h2>
            <p>
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind,
              either express or implied. While we strive to provide accurate and up-to-date information about
              archaeological sites, we make no representations or warranties about the completeness, accuracy, or
              reliability of any content on the Service.
            </p>
            <p className="mt-3">
              Archaeological site information, visiting conditions, and accessibility may change. Always verify
              current conditions before planning a visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Archaeolist and its operators shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use of the
              Service, including but not limited to loss of data, loss of profits, or any damages resulting from
              reliance on information obtained through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify you of significant changes by
              updating the date at the top of this page. Your continued use of the Service after any changes
              constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:hello@archaeolist.com" className="text-[#1855ED] hover:underline">
                hello@archaeolist.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
