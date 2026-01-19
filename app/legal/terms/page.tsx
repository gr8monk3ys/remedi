/**
 * Terms of Service Page
 *
 * Defines the terms and conditions for using Remedi.
 */

import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using Remedi.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing or using Remedi, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Remedi is an informational platform that helps users discover natural alternatives
              to pharmaceutical drugs and supplements. We provide information based on publicly
              available data and AI-powered recommendations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Medical Disclaimer</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                IMPORTANT: Remedi is for informational purposes only and is NOT a substitute
                for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Always consult a qualified healthcare provider before making any changes to your medications or health regimen</li>
              <li>Never disregard professional medical advice or delay seeking it because of information on this platform</li>
              <li>If you think you may have a medical emergency, call your doctor or emergency services immediately</li>
              <li>We do not recommend or endorse any specific tests, physicians, products, or procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate information when creating an account</li>
              <li>You may not share your account credentials with others</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Scrape, crawl, or spider our content without permission</li>
              <li>Use the service to provide medical advice to others</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All content on Remedi, including text, graphics, logos, and software, is the
              property of Remedi or its licensors and is protected by copyright and other
              intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our service integrates with third-party services including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>OpenFDA for pharmaceutical data</li>
              <li>OpenAI for AI-powered features</li>
              <li>Google and GitHub for authentication</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your use of these services is subject to their respective terms and policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, REMEDI SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR
              USE OF THE SERVICE.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We are not liable for any health outcomes resulting from the use of information
              provided on this platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
              KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes. Continued use of the service after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may terminate or suspend your access to the service at any time, with or
              without cause, with or without notice. Upon termination, your right to use the
              service will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These terms shall be governed by and construed in accordance with the laws of
              the jurisdiction in which Remedi operates, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
            <p className="text-gray-700 dark:text-gray-300">
              For questions about these terms, please contact us at: legal@remedi.app
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
