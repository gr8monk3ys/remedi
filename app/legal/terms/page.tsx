/**
 * Terms of Service Page
 *
 * Defines the terms and conditions for using Remedi.
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using Remedi.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-32 pb-20 md:px-8">
        <h1 className="text-4xl font-semibold">Terms of Service</h1>
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
            <h2 className="mb-3 text-xl font-semibold">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              By accessing or using Remedi, you agree to be bound by these Terms
              of Service. If you do not agree to these terms, please do not use
              our service.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              2. Description of Service
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Remedi is an informational platform that helps users discover
              natural alternatives to pharmaceutical drugs and supplements. We
              provide information based on publicly available data and
              AI-powered recommendations.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              3. Medical Disclaimer
            </h2>
            <div className="mb-4 rounded-md border border-warning/30 bg-warning/5 p-4">
              <p className="text-sm font-medium text-foreground">
                IMPORTANT: Remedi is for informational purposes only and is NOT
                a substitute for professional medical advice, diagnosis, or
                treatment.
              </p>
            </div>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>
                Always consult a qualified healthcare provider before making any
                changes to your medications or health regimen
              </li>
              <li>
                Never disregard professional medical advice or delay seeking it
                because of information on this platform
              </li>
              <li>
                If you think you may have a medical emergency, call your doctor
                or emergency services immediately
              </li>
              <li>
                We do not recommend or endorse any specific tests, physicians,
                products, or procedures
              </li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">4. User Accounts</h2>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>
                You are responsible for maintaining the security of your account
              </li>
              <li>
                You must provide accurate information when creating an account
              </li>
              <li>You may not share your account credentials with others</li>
              <li>
                You must notify us immediately of any unauthorized use of your
                account
              </li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">5. Acceptable Use</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              You agree not to:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Use the service for any unlawful purpose</li>
              <li>
                Attempt to gain unauthorized access to any part of the service
              </li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Scrape, crawl, or spider our content without permission</li>
              <li>Use the service to provide medical advice to others</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              6. Intellectual Property
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              All content on Remedi, including text, graphics, logos, and
              software, is the property of Remedi or its licensors and is
              protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              7. Third-Party Services
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Our service integrates with third-party services including:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>OpenFDA for pharmaceutical data</li>
              <li>OpenAI for AI-powered features</li>
              <li>Google and GitHub for authentication</li>
            </ul>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Your use of these services is subject to their respective terms
              and policies.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              8. Limitation of Liability
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, REMEDI SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE,
              OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
            </p>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We are not liable for any health outcomes resulting from the use
              of information provided on this platform.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              9. Disclaimer of Warranties
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">10. Changes to Terms</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes. Continued use of the service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">11. Termination</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We may terminate or suspend your access to the service at any
              time, with or without cause, with or without notice. Upon
              termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">12. Governing Law</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Remedi operates, without
              regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">13. Contact</h2>
            <p className="text-foreground">
              For questions about these terms, please contact us at:
              legal@remedi.app
            </p>
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
