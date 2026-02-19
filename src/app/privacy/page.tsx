import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Archaeolist',
  description: 'Privacy Policy for Archaeolist — learn how we collect, use, and protect your information.',
  alternates: {
    canonical: 'https://archaeolist.com/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <main className="flex-1 w-full overflow-auto">
      <div className="mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 2026</p>

        <div className="space-y-10 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you contact us via email. We also
              automatically collect certain information when you visit Archaeolist, including:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Log data such as your IP address, browser type, pages visited, and time spent on pages</li>
              <li>Device information including operating system and browser version</li>
              <li>Usage data such as which archaeological sites you view and searches you perform</li>
              <li>Cookie and similar tracking technology data (see Cookies section below)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Operate, maintain, and improve the Archaeolist website and its content</li>
              <li>Understand how visitors use the site so we can improve the experience</li>
              <li>Respond to your comments, questions, or requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect and prevent fraudulent or abusive activity</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Cookies and Analytics</h2>
            <p>
              Archaeolist uses cookies and similar tracking technologies to analyze site traffic and improve your
              experience. We use Google Tag Manager and Google Analytics to collect anonymized usage statistics.
              These tools may set cookies on your device.
            </p>
            <p className="mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect some features of
              the site. Most browsers allow you to refuse cookies or delete them after they have been set.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate Archaeolist:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Supabase</strong> — Our database provider, used to store and serve site information.
                Supabase processes data in accordance with their own privacy policy.
              </li>
              <li>
                <strong>Google Tag Manager / Google Analytics</strong> — Used to collect anonymized analytics data
                about how visitors use the site. Data is processed by Google in accordance with their privacy policy.
              </li>
              <li>
                <strong>Viator</strong> — We display tour recommendations from Viator on some site pages. Clicking
                Viator links may result in cookies being set by Viator. We may earn a commission on bookings made
                through these links.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              We retain analytics and log data for up to 26 months. We retain any information you send us directly
              (e.g., via email) only as long as necessary to respond to your inquiry or resolve any issue.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, or delete personal information
              we hold about you, or to object to or restrict certain processing. To exercise any of these rights,
              please contact us at the email address below.
            </p>
            <p className="mt-3">
              If you are located in the European Economic Area (EEA), you have rights under the General Data
              Protection Regulation (GDPR). If you are located in California, you have rights under the California
              Consumer Privacy Act (CCPA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by
              updating the date at the top of this page. Your continued use of Archaeolist after any changes
              constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your information, please contact us at{' '}
              <a href="mailto:hello@archaeolist.com" className="text-[#1855ED] hover:underline">
                hello@archaeolist.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
