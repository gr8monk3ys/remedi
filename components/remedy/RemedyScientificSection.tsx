/**
 * Scientific Information Section Component
 *
 * Displays scientific information and references for a remedy.
 * Lazy-loaded to improve initial page load performance.
 */

"use client";

import { useState } from "react";
import { Beaker, ExternalLink } from "lucide-react";

interface Reference {
  title: string;
  url: string;
}

interface RemedyScientificSectionProps {
  scientificInfo: string;
  references: Reference[];
}

export function RemedyScientificSection({
  scientificInfo,
  references,
}: RemedyScientificSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <Beaker className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-xl font-bold text-foreground">
              Scientific Information
            </h2>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${
              isExpanded ? "transform rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className={`mt-4 ${isExpanded ? "block" : "hidden"}`}>
          <p className="text-muted-foreground mb-4">{scientificInfo}</p>
          <div className="mt-4">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Scientific Studies & References
            </h3>
            <ul className="space-y-2">
              {references.map((reference, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary mr-2">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    {reference.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
