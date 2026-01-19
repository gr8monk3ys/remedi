import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FAQAccordion } from "./FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ | Remedi",
  description:
    "Frequently asked questions about Remedi, natural remedies, and how to use our platform.",
};

const faqSections = [
  {
    title: "About Remedi",
    items: [
      {
        question: "What is Remedi?",
        answer:
          "Remedi is a platform that helps you discover natural alternatives to pharmaceuticals and supplements. We use data from the FDA, scientific research, and traditional medicine to provide evidence-based recommendations for natural remedies.",
      },
      {
        question: "Is Remedi a replacement for medical advice?",
        answer:
          "No. Remedi is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before making changes to your medication or health regimen.",
      },
      {
        question: "How does Remedi work?",
        answer:
          "Simply search for a pharmaceutical or supplement you're interested in, and Remedi will show you natural alternatives that have similar benefits. Each recommendation includes information about the remedy, its benefits, dosage guidelines, and the level of scientific evidence supporting its use.",
      },
    ],
  },
  {
    title: "Search & Recommendations",
    items: [
      {
        question: "How do you match pharmaceuticals to natural remedies?",
        answer:
          "We use a combination of ingredient analysis, therapeutic benefit comparison, and AI-powered matching to find natural alternatives. Our system considers the active ingredients, intended uses, and mechanisms of action to find the most relevant natural remedies.",
      },
      {
        question: "What does the AI search feature do?",
        answer:
          "Our AI-powered search understands natural language queries. Instead of just searching for drug names, you can describe your symptoms or health goals (like 'I need help with joint pain' or 'natural sleep aid') and get personalized recommendations based on your specific needs.",
      },
      {
        question: "What do the evidence levels mean?",
        answer:
          "We classify remedies by their level of scientific evidence: Strong (multiple clinical trials), Moderate (limited clinical evidence), Limited (preliminary research), and Traditional (historically used but limited scientific study). This helps you make informed decisions about which remedies to explore further.",
      },
    ],
  },
  {
    title: "Safety & Precautions",
    items: [
      {
        question: "Are natural remedies safe?",
        answer:
          "While natural remedies are generally considered safe, they can still have side effects and interact with medications. Always consult with a healthcare provider before starting any new supplement, especially if you're taking prescription medications, are pregnant, or have underlying health conditions.",
      },
      {
        question: "Can natural remedies interact with medications?",
        answer:
          "Yes, natural remedies can interact with prescription medications. Some common examples include St. John's Wort interacting with antidepressants, and ginkgo biloba interacting with blood thinners. We include precaution information where known, but always verify with your healthcare provider.",
      },
      {
        question: "How do I know if a remedy is right for me?",
        answer:
          "Consider the evidence level, read the precautions, and most importantly, discuss with your healthcare provider. What works for one person may not work for another, and individual factors like allergies, existing conditions, and current medications all play a role.",
      },
    ],
  },
  {
    title: "Data & Privacy",
    items: [
      {
        question: "Where does your data come from?",
        answer:
          "Our data comes from multiple sources including the FDA's drug database, peer-reviewed research, traditional medicine references, and expert contributions. We continuously update our database to include the latest research findings.",
      },
      {
        question: "Do you track my searches?",
        answer:
          "We store search history to improve your experience and provide better recommendations. You can view and clear your search history at any time. We do not sell personal data to third parties. See our Privacy Policy for full details.",
      },
      {
        question: "Is my health information secure?",
        answer:
          "Yes. We use industry-standard encryption and security practices to protect your data. We do not store any sensitive health information beyond your search history and favorites. You can delete your account and all associated data at any time.",
      },
    ],
  },
  {
    title: "Features & Account",
    items: [
      {
        question: "How do I save my favorite remedies?",
        answer:
          "Click the heart icon on any remedy to add it to your favorites. You can access your favorites anytime from your account. Favorites are synced across devices when you're signed in.",
      },
      {
        question: "Do I need an account to use Remedi?",
        answer:
          "No, you can search and browse remedies without an account. However, creating an account lets you save favorites, sync your history across devices, and contribute reviews to help the community.",
      },
      {
        question: "How can I contribute to Remedi?",
        answer:
          "Signed-in users can submit new remedy suggestions and write reviews. All contributions are reviewed by our moderation team before being published to ensure quality and accuracy.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Find answers to common questions about Remedi and natural remedies.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {faqSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <FAQAccordion items={section.items} />
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Can&apos;t find what you&apos;re looking for? Feel free to reach out to our
            support team.
          </p>
          <a
            href="mailto:support@remedi.app"
            className="inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}
