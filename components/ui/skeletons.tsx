/**
 * Loading Skeleton Components
 *
 * Provides skeleton loaders for better perceived performance.
 * Skeletons match the structure of actual content components.
 */

import React from 'react';

/**
 * Base skeleton component with animation
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Search result card skeleton
 */
export function SearchResultSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex gap-4">
        {/* Image skeleton */}
        <Skeleton className="w-24 h-24 flex-shrink-0" />

        <div className="flex-1 space-y-3">
          {/* Category badge skeleton */}
          <Skeleton className="h-5 w-20" />

          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4" />

          {/* Description skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Nutrients skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Match score skeleton */}
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple search result skeletons
 */
export function SearchResultsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </>
  );
}

/**
 * Remedy detail page skeleton
 */
export function RemedyDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <Skeleton className="h-6 w-40 mb-6" />

      {/* Hero section skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {/* Image skeleton */}
          <Skeleton className="w-full h-56 md:h-auto md:w-48" />

          <div className="p-6 w-full space-y-4">
            {/* Category badge */}
            <Skeleton className="h-6 w-24" />

            {/* Title */}
            <Skeleton className="h-8 w-3/4" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Nutrients */}
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>

            {/* Match score */}
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Section cards */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3"
            >
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>

        {/* Sidebar skeleton */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Search input skeleton
 */
export function SearchInputSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

/**
 * Card grid skeleton (for favorites, etc.)
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3"
        >
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-8 w-24 mt-4" />
        </div>
      ))}
    </div>
  );
}

/**
 * List item skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b dark:border-gray-700">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Multiple list item skeletons
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b dark:border-gray-700">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
