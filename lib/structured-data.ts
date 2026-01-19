/**
 * Structured Data (JSON-LD) Generation Utilities
 *
 * Generates schema.org structured data for SEO and rich snippets.
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */

import type { DetailedRemedy } from './types';

/**
 * Organization schema for Remedi
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Remedi',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Discover evidence-based natural remedies and alternatives to pharmaceutical drugs and supplements.',
    sameAs: [
      // Add social media profiles when available
      // 'https://twitter.com/remedi',
      // 'https://facebook.com/remedi',
    ],
  };
}

/**
 * WebSite schema for the homepage
 */
export function generateWebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Remedi',
    url: baseUrl,
    description: 'Discover evidence-based natural remedies and alternatives to pharmaceutical drugs and supplements.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * MedicalWebPage schema for remedy detail pages
 */
export function generateRemedySchema(remedy: DetailedRemedy) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: remedy.name,
    url: `${baseUrl}/remedy/${remedy.id}`,
    description: remedy.description,
    image: remedy.imageUrl,
    mainEntity: {
      '@type': 'MedicalEntity',
      name: remedy.name,
      description: remedy.description,
      code: {
        '@type': 'MedicalCode',
        codingSystem: 'Natural Remedy',
      },
    },
    about: {
      '@type': 'Thing',
      name: remedy.category,
      description: remedy.description,
    },
    ...(remedy.references && remedy.references.length > 0 && {
      citation: remedy.references.map((ref) => ({
        '@type': 'CreativeWork',
        name: ref.title,
        url: ref.url,
      })),
    }),
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
    },
    datePublished: new Date().toISOString(),
    inLanguage: 'en-US',
  };
}

/**
 * BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Helper function to inject structured data into page head
 * @param schema - The schema object to inject
 * @returns Script tag content
 */
export function injectStructuredData(schema: object) {
  return {
    __html: JSON.stringify(schema),
  };
}
