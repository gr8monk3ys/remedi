/**
 * Related Remedies Section Component
 *
 * Displays related remedies in a sidebar.
 * Lazy-loaded to improve initial page load performance.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Calendar, ExternalLink } from 'lucide-react';

interface RelatedRemedy {
  id: string;
  name: string;
}

interface RelatedRemediesSectionProps {
  relatedRemedies: RelatedRemedy[];
}

export function RelatedRemediesSection({ relatedRemedies }: RelatedRemediesSectionProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-4">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Related Remedies</h2>
        </div>
        <div className="space-y-3">
          {relatedRemedies.map((related) => (
            <div
              key={related.id}
              onClick={() => router.push(`/remedy/${related.id}`)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{related.name}</span>
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
