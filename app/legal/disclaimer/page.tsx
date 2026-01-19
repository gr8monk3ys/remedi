/**
 * Medical Disclaimer Page
 *
 * Critical disclaimer for health-related applications.
 * Protects against liability from health decisions based on the platform.
 */

import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/header";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Important health and medical disclaimer for Remedi users.",
};

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Medical Disclaimer</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4">
            IMPORTANT: READ THIS BEFORE USING REMEDI
          </h2>
          <p className="text-red-700 dark:text-red-300 font-medium">
            This website provides general information about natural remedies and supplements.
            It is NOT intended to be a substitute for professional medical advice, diagnosis,
            or treatment.
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Not Medical Advice</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The information provided on Remedi is for educational and informational purposes only.
              It is not intended to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Diagnose, treat, cure, or prevent any disease</li>
              <li>Replace the advice of your physician or healthcare provider</li>
              <li>Be used for self-diagnosis or self-treatment</li>
              <li>Recommend stopping or changing any medication</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Consult Your Healthcare Provider</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Always consult with a qualified healthcare professional</strong> before:
              </p>
            </div>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Starting any new supplement or natural remedy</li>
              <li>Making changes to your current medications</li>
              <li>Combining natural remedies with prescription medications</li>
              <li>Using natural remedies during pregnancy or breastfeeding</li>
              <li>Giving natural remedies to children</li>
              <li>If you have any chronic health conditions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Drug Interactions</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Natural remedies and supplements can interact with prescription medications,
              over-the-counter drugs, and other supplements. These interactions can:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Reduce the effectiveness of medications</li>
              <li>Increase the effects of medications to dangerous levels</li>
              <li>Cause unexpected side effects</li>
              <li>Be life-threatening in some cases</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              While we provide AI-powered interaction checking, this feature is for informational
              purposes only and should not replace consultation with a pharmacist or doctor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information Accuracy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              While we strive to provide accurate and up-to-date information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Medical knowledge is constantly evolving</li>
              <li>AI-generated recommendations may contain errors</li>
              <li>Individual responses to remedies vary greatly</li>
              <li>We cannot guarantee the completeness or accuracy of all information</li>
              <li>Scientific evidence for natural remedies varies in quality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Evidence Levels</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We categorize remedies by evidence level, but please understand:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Strong evidence</strong> means multiple well-designed studies, not guaranteed effectiveness</li>
              <li><strong>Moderate evidence</strong> means some positive studies with limitations</li>
              <li><strong>Limited evidence</strong> means preliminary research or traditional use only</li>
              <li>Even &quot;strong evidence&quot; does not mean a remedy is right for you</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Emergency Situations</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200 font-bold">
                If you are experiencing a medical emergency, call emergency services (911 in the US)
                or go to the nearest emergency room immediately.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Do not use this website to make decisions about emergency medical care.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">No Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Remedi, its owners, employees, and affiliates shall not be liable for any:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Health outcomes resulting from use of information on this platform</li>
              <li>Decisions made based on information provided here</li>
              <li>Adverse reactions to any remedy or supplement</li>
              <li>Interactions between remedies and medications</li>
              <li>Any other damages arising from use of this service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Responsibility</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By using Remedi, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>You are solely responsible for your health decisions</li>
              <li>You will consult healthcare professionals before making changes</li>
              <li>You understand the limitations of the information provided</li>
              <li>You accept all risks associated with using this information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about this disclaimer, please contact us at: medical@remedi.app
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
          <Link href="/" className="text-blue-500 hover:underline">
            &larr; Back to Home
          </Link>
          <Link href="/legal/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/legal/terms" className="text-blue-500 hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </>
  );
}
