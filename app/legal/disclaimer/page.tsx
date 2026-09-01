/**
 * Medical Disclaimer Page
 *
 * Critical disclaimer for health-related applications.
 * Protects against liability from health decisions based on the platform.
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Important health and medical disclaimer for Remedi users.",
};

export default function DisclaimerPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-32 pb-20 md:px-8">
        <h1 className="text-4xl font-semibold">Medical Disclaimer</h1>
        <p className="mt-3 mb-12 font-mono text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="mb-3 text-lg font-semibold text-destructive">
            IMPORTANT: READ THIS BEFORE USING REMEDI
          </h2>
          <p className="text-sm leading-relaxed text-foreground">
            This website provides general information about natural remedies and
            supplements. It is NOT intended to be a substitute for professional
            medical advice, diagnosis, or treatment.
          </p>
        </div>

        <div className="max-w-none">
          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">Not Medical Advice</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              The information provided on Remedi is for educational and
              informational purposes only. It is not intended to:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Diagnose, treat, cure, or prevent any disease</li>
              <li>
                Replace the advice of your physician or healthcare provider
              </li>
              <li>Be used for self-diagnosis or self-treatment</li>
              <li>Recommend stopping or changing any medication</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">
              Consult Your Healthcare Provider
            </h2>
            <div className="mb-4 rounded-md border border-info/30 bg-info/5 p-4">
              <p className="text-sm text-foreground">
                <strong>
                  Always consult with a qualified healthcare professional
                </strong>{" "}
                before:
              </p>
            </div>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Starting any new supplement or natural remedy</li>
              <li>Making changes to your current medications</li>
              <li>Combining natural remedies with prescription medications</li>
              <li>Using natural remedies during pregnancy or breastfeeding</li>
              <li>Giving natural remedies to children</li>
              <li>If you have any chronic health conditions</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">Drug Interactions</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Natural remedies and supplements can interact with prescription
              medications, over-the-counter drugs, and other supplements. These
              interactions can:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Reduce the effectiveness of medications</li>
              <li>Increase the effects of medications to dangerous levels</li>
              <li>Cause unexpected side effects</li>
              <li>Be life-threatening in some cases</li>
            </ul>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              While we provide AI-powered interaction checking, this feature is
              for informational purposes only and should not replace
              consultation with a pharmacist or doctor.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">Information Accuracy</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              While we strive to provide accurate and up-to-date information:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>Medical knowledge is constantly evolving</li>
              <li>AI-generated recommendations may contain errors</li>
              <li>Individual responses to remedies vary greatly</li>
              <li>
                We cannot guarantee the completeness or accuracy of all
                information
              </li>
              <li>
                Scientific evidence for natural remedies varies in quality
              </li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">Evidence Levels</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We categorize remedies by evidence level, but please understand:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>
                <strong>Strong evidence</strong> means multiple well-designed
                studies, not guaranteed effectiveness
              </li>
              <li>
                <strong>Moderate evidence</strong> means some positive studies
                with limitations
              </li>
              <li>
                <strong>Limited evidence</strong> means preliminary research or
                traditional use only
              </li>
              <li>
                Even &quot;strong evidence&quot; does not mean a remedy is right
                for you
              </li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">Emergency Situations</h2>
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">
                If you are experiencing a medical emergency, call emergency
                services (911 in the US) or go to the nearest emergency room
                immediately.
              </p>
            </div>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Do not use this website to make decisions about emergency medical
              care.
            </p>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">No Liability</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Remedi, its owners, employees, and affiliates shall not be liable
              for any:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>
                Health outcomes resulting from use of information on this
                platform
              </li>
              <li>Decisions made based on information provided here</li>
              <li>Adverse reactions to any remedy or supplement</li>
              <li>Interactions between remedies and medications</li>
              <li>Any other damages arising from use of this service</li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">Your Responsibility</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              By using Remedi, you acknowledge that:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
              <li>You are solely responsible for your health decisions</li>
              <li>
                You will consult healthcare professionals before making changes
              </li>
              <li>
                You understand the limitations of the information provided
              </li>
              <li>
                You accept all risks associated with using this information
              </li>
            </ul>
          </section>

          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-3 text-xl font-semibold">Questions?</h2>
            <p className="text-foreground">
              If you have questions about this disclaimer, please contact us at:
              medical@remedi.app
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
          <Link
            href="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            &larr; Back to Home
          </Link>
          <Link
            href="/legal/privacy"
            className="text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/legal/terms"
            className="text-primary underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </>
  );
}
