/**
 * Privacy Policy Page
 *
 * Discloses data collection, use, and protection practices.
 * Required for GDPR, CCPA, and general privacy compliance.
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Remedi collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-32 pb-20 md:px-8">
        <h1 className="text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-3 mb-12 font-mono text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="max-w-none">
          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">1. Introduction</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Welcome to Remedi. We respect your privacy and are committed to
              protecting your personal data. This privacy policy explains how we
              collect, use, and safeguard your information when you use our
              service.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium mb-3">
              2.1 Information You Provide
            </h3>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>
                Account information (email, name) when you sign in with OAuth
                providers
              </li>
              <li>Search queries you enter</li>
              <li>Favorites and saved remedies</li>
              <li>Any feedback or communications you send us</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">
              2.2 Information Collected Automatically
            </h3>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Usage data (pages visited, search patterns)</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              3. How We Use Your Information
            </h2>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Provide and improve our services</li>
              <li>Personalize your experience and recommendations</li>
              <li>Analyze usage patterns to improve the platform</li>
              <li>Communicate with you about updates or support</li>
              <li>Ensure security and prevent abuse</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">4. Data Sharing</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We do not sell your personal data. We may share information with:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>
                Service providers who help us operate (hosting, analytics)
              </li>
              <li>OAuth providers for authentication (Google, GitHub)</li>
              <li>AI service providers (OpenAI) for search functionality</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">5. Data Security</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We implement appropriate security measures to protect your data,
              including:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Encryption in transit (HTTPS)</li>
              <li>Secure authentication via OAuth</li>
              <li>Regular security audits</li>
              <li>Access controls for our team</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">6. Your Rights</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Depending on your location, you may have the right to:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of certain data processing</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">7. Cookies</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We use essential cookies for authentication and session
              management. We may use analytics cookies (Plausible) which are
              privacy-focused and do not require consent in most jurisdictions.
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              8. Children&apos;s Privacy
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Our service is not intended for children under 13. We do not
              knowingly collect personal information from children. If you
              believe a child has provided us with personal data, please contact
              us.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              9. Changes to This Policy
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We may update this privacy policy from time to time. We will
              notify you of significant changes by posting the new policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">10. Contact Us</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              If you have questions about this privacy policy or your data,
              please contact us at:
            </p>
            <p className="text-foreground">Email: privacy@remedi.app</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
