/**
 * Code Splitting Utilities
 *
 * Centralized utilities for implementing code splitting across the application.
 * Uses Next.js dynamic imports with loading states.
 *
 * @see https://nextjs.org/docs/advanced-features/dynamic-import
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Generic loading skeleton for components
 */
export const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
  </div>
);

/**
 * Loading skeleton for search components
 */
export const SearchLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
  </div>
);

/**
 * Loading skeleton for card components
 */
export const CardLoadingSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

/**
 * Dynamic import options with common configurations
 */
export const dynamicOptions = {
  /**
   * Client-side only rendering with loading skeleton
   */
  clientOnly: {
    ssr: false,
    loading: SearchLoadingSkeleton,
  },

  /**
   * Client-side only with card skeleton
   */
  clientOnlyCard: {
    ssr: false,
    loading: CardLoadingSkeleton,
  },

  /**
   * Server-side rendering with loading skeleton
   */
  withSSR: {
    ssr: true,
    loading: SearchLoadingSkeleton,
  },
} as const;

/**
 * Type for module exports containing React components
 */
type ModuleWithComponents = Record<string, ComponentType<Record<string, unknown>>>;

/**
 * Helper to create dynamically imported components with type safety
 *
 * @example
 * const SearchComponent = createDynamicComponent(
 *   () => import('@/components/ui/search'),
 *   'SearchComponent',
 *   'clientOnly'
 * );
 */
export function createDynamicComponent<
  T extends ModuleWithComponents,
  K extends keyof T
>(
  importFn: () => Promise<T>,
  exportName: K,
  options: keyof typeof dynamicOptions = 'clientOnly'
): ComponentType<T[K] extends ComponentType<infer P> ? P : Record<string, unknown>> {
  const opts = dynamicOptions[options];

  // Use explicit loader function type that Next.js expects
  const loader = async () => {
    const mod = await importFn();
    return mod[exportName] as ComponentType<Record<string, unknown>>;
  };

  return dynamic(loader, {
    ssr: opts.ssr,
    loading: opts.loading,
  }) as ComponentType<T[K] extends ComponentType<infer P> ? P : Record<string, unknown>>;
}

/**
 * Pre-configured dynamic components for common use cases
 */

/**
 * Dynamically import search component
 */
export const DynamicSearchComponent = dynamic(
  () => import('@/components/ui/search').then((mod) => ({ default: mod.SearchComponent })),
  {
    loading: SearchLoadingSkeleton,
    ssr: false,
  }
);

/**
 * Route-based code splitting helpers
 */

/**
 * Split code by route - recommended for large pages
 */
export function createRouteChunks() {
  return {
    /**
     * Homepage chunks
     */
    home: {
      search: () => import('@/components/ui/search'),
    },

    /**
     * Remedy detail chunks
     */
    remedy: {
      scientificSection: () => import('@/components/remedy/RemedyScientificSection'),
      relatedRemedies: () => import('@/components/remedy/RelatedRemediesSection'),
    },
  };
}

/**
 * Prefetch a component for better UX
 * Call this in event handlers (e.g., onMouseEnter) before user needs the component
 *
 * @example
 * <button
 *   onMouseEnter={() => prefetchComponent(() => import('@/components/heavy'))}
 *   onClick={handleClick}
 * >
 *   Click me
 * </button>
 */
export function prefetchComponent(importFn: () => Promise<unknown>): void {
  // Only prefetch in browser
  if (typeof window !== 'undefined') {
    importFn().catch(() => {
      // Silently fail - component will be loaded on demand
    });
  }
}

/**
 * Lazy load images and media
 * Returns a promise that resolves when the image is loaded
 *
 * @example
 * const imageUrl = await lazyLoadImage('/large-image.jpg');
 */
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Intersection Observer hook for lazy loading components
 * Use with dynamic imports to load components only when visible
 *
 * @example
 * const ref = useRef(null);
 * const isVisible = useIntersectionObserver(ref);
 *
 * return (
 *   <div ref={ref}>
 *     {isVisible && <HeavyComponent />}
 *   </div>
 * );
 */
export function createIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
      }
    });
  }, options);
}
