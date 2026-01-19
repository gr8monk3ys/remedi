/**
 * Privacy Policy Page
 *
 * Discloses data collection, use, and protection practices.
 * Required for GDPR, CCPA, and general privacy compliance.
 */

import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Remedi collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Remedi. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Account information (email, name) when you sign in with OAuth providers</li>
              <li>Search queries you enter</li>
              <li>Favorites and saved remedies</li>
              <li>Any feedback or communications you send us</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Usage data (pages visited, search patterns)</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Provide and improve our services</li>
              <li>Personalize your experience and recommendations</li>
              <li>Analyze usage patterns to improve the platform</li>
              <li>Communicate with you about updates or support</li>
              <li>Ensure security and prevent abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell your personal data. We may share information with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Service providers who help us operate (hosting, analytics)</li>
              <li>OAuth providers for authentication (Google, GitHub)</li>
              <li>AI service providers (OpenAI) for search functionality</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate security measures to protect your data, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Encryption in transit (HTTPS)</li>
              <li>Secure authentication via OAuth</li>
              <li>Regular security audits</li>
              <li>Access controls for our team</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of certain data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use essential cookies for authentication and session management.
              We may use analytics cookies (Plausible) which are privacy-focused and do not require consent in most jurisdictions.
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our service is not intended for children under 13. We do not knowingly collect
              personal information from children. If you believe a child has provided us with
              personal data, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this privacy policy from time to time. We will notify you of
              significant changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about this privacy policy or your data, please contact us at:
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Email: privacy@remedi.app
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-blue-500 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
