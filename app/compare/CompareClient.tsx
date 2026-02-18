"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Share2, ArrowLeft, AlertCircle } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import {
  ExportComparison,
  MobileComparisonSwiper,
  ComparisonHistory,
  ExpandableSection,
  EvidenceBadge,
  BulletList,
  ComparisonRow,
  AddRemedySlot,
  ComparisonSkeleton,
  saveComparisonToHistory,
} from "@/components/compare";
import type { CompareRemedy } from "@/components/compare";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { createLogger } from "@/lib/logger";

const logger = createLogger("compare-page");

/**
 * Props for the compare client component.
 * initialIds are pre-parsed from searchParams on the server to avoid
 * needing a Suspense boundary around useSearchParams on first render.
 */
interface CompareClientProps {
  initialIds: string[];
  maxCompareItems: number;
  trimmedFromCount: number | null;
}

/**
 * Client component handling all interactive comparison logic.
 * Includes the header action buttons, comparison grid, empty state,
 * error handling, share/export, and mobile swipe view.
 */
export function CompareClient({
  initialIds,
  maxCompareItems,
  trimmedFromCount,
}: CompareClientProps): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, removeFromCompare, clearComparison, getCompareUrl } =
    useCompare();
  const isMobile = useIsMobile();

  const [remedies, setRemedies] = useState<CompareRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showTrimNotice, setShowTrimNotice] = useState(true);

  // Get IDs from URL or context - memoize to prevent unstable array reference.
  // After initial load, idsFromUrl updates reactively when URL changes client-side.
  const idsFromUrl = searchParams.get("ids");
  const ids = useMemo(() => {
    const rawIds = idsFromUrl
      ? idsFromUrl
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : initialIds.length > 0
        ? initialIds
        : items.map((item) => item.id);

    // Enforce plan cap and remove duplicates while preserving order.
    const uniqueIds: string[] = [];
    for (const id of rawIds) {
      if (!id || uniqueIds.includes(id)) continue;
      uniqueIds.push(id);
      if (uniqueIds.length >= maxCompareItems) break;
    }

    return uniqueIds;
  }, [idsFromUrl, initialIds, items, maxCompareItems]);

  // Fetch remedies data
  const fetchRemedies = useCallback(async () => {
    if (ids.length === 0) {
      setRemedies([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/remedies/compare?ids=${ids.join(",")}`,
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch remedies");
      }

      setRemedies(data.data.remedies || []);
    } catch (err) {
      logger.error("Error fetching remedies", err);
      setError(err instanceof Error ? err.message : "Failed to load remedies");
    } finally {
      setIsLoading(false);
    }
  }, [ids]);

  useEffect(() => {
    fetchRemedies();
  }, [fetchRemedies]);

  // Save comparison to history when remedies are loaded.
  // Use ids.join as the key instead of remedies to avoid re-triggering after setRemedies.
  const idsKey = ids.join(",");
  useEffect(() => {
    if (remedies.length >= 2) {
      saveComparisonToHistory(remedies);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // Handle removing a remedy from comparison
  const handleRemoveRemedy = (id: string): void => {
    removeFromCompare(id);
    const newIds = ids.filter((i) => i !== id);
    if (newIds.length > 0) {
      router.push(`/compare?ids=${newIds.join(",")}`);
    } else {
      router.push("/compare");
    }
  };

  // Handle clearing all remedies
  const handleClearAll = (): void => {
    clearComparison();
    router.push("/compare");
  };

  // Handle share functionality
  const handleShare = async (): Promise<void> => {
    const url = `${window.location.origin}${getCompareUrl()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Remedy Comparison - Remedi",
          text: `Compare natural remedies: ${remedies.map((r) => r.name).join(", ")}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      // User cancelled share or clipboard failed
      logger.debug("Share cancelled or failed", { error: err });
    }
  };

  // Handle adding another remedy
  const handleAddRemedy = (): void => {
    router.push("/");
  };

  if (isLoading) {
    return <ComparisonSkeleton />;
  }

  const showAddSlot = remedies.length < maxCompareItems;
  const headerColumnCount = remedies.length + (showAddSlot ? 1 : 0);
  const minColumnWidthPx = 260;

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Go back to search"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Compare Remedies
          </h1>
        </div>

        {remedies.length > 0 && (
          <div className="flex items-center gap-3">
            <ExportComparison remedies={remedies} />
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              aria-label="Share comparison"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-card border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Share toast notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Notice when a shared link exceeds plan cap (server-trimmed) */}
      {trimmedFromCount && showTrimNotice && (
        <div className="flex items-start gap-3 p-4 mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-200 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This shared comparison included {trimmedFromCount} remedies. Your
              plan supports up to {maxCompareItems} at once, so we're showing
              the first {maxCompareItems}.
            </p>
          </div>
          <button
            onClick={() => setShowTrimNotice(false)}
            className="text-sm text-amber-800 dark:text-amber-200 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty state */}
      {remedies.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No remedies to compare
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Search for natural remedies and add them to your comparison list to
            see a detailed side-by-side analysis.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Search Remedies
          </Link>

          {/* Comparison history */}
          <div className="mt-8 max-w-md mx-auto">
            <ComparisonHistory maxEntries={5} />
          </div>
        </div>
      )}

      {/* Comparison content */}
      {remedies.length > 0 && (
        <>
          {/* Mobile swipe view */}
          {isMobile && (
            <MobileComparisonSwiper
              remedies={remedies}
              onRemoveRemedy={handleRemoveRemedy}
              className="md:hidden"
            />
          )}

          {/* Desktop grid view */}
          <div
            className={`bg-card rounded-xl shadow-sm print:shadow-none ${isMobile ? "hidden md:block" : ""}`}
            id="comparison-content"
          >
            <div className="overflow-x-auto">
              <div className="min-w-full w-max">
                {/* Remedy headers */}
                <div
                  className="grid gap-4 p-4 border-b border-border bg-muted"
                  style={{
                    gridTemplateColumns: `repeat(${headerColumnCount}, minmax(${minColumnWidthPx}px, 1fr))`,
                  }}
                >
                  {remedies.map((remedy) => (
                    <div key={remedy.id} className="relative">
                      <button
                        onClick={() => handleRemoveRemedy(remedy.id)}
                        className="absolute -top-1 -right-1 p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors z-10 print:hidden"
                        aria-label={`Remove ${remedy.name} from comparison`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/remedy/${remedy.id}`}
                        className="block group"
                      >
                        <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-muted">
                          {remedy.imageUrl ? (
                            <Image
                              src={remedy.imageUrl}
                              alt={remedy.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>
                        <h2 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {remedy.name}
                        </h2>
                        {remedy.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
                            {remedy.category}
                          </span>
                        )}
                      </Link>
                    </div>
                  ))}

                  {/* Add another remedy slot */}
                  {showAddSlot && (
                    <div className="print:hidden">
                      <AddRemedySlot onClick={handleAddRemedy} />
                    </div>
                  )}
                </div>

                {/* Comparison sections */}
                <ExpandableSection title="Evidence Level">
                  <ComparisonRow
                    label="Evidence Level"
                    remedies={remedies}
                    minColumnWidth={minColumnWidthPx}
                    renderCell={(remedy) => (
                      <EvidenceBadge level={remedy.evidenceLevel} />
                    )}
                    highlight
                  />
                </ExpandableSection>

                <ExpandableSection title="Benefits">
                  <ComparisonRow
                    label="Benefits"
                    remedies={remedies}
                    minColumnWidth={minColumnWidthPx}
                    renderCell={(remedy) => (
                      <BulletList
                        items={remedy.benefits || remedy.matchingNutrients}
                        emptyMessage="No benefits listed"
                      />
                    )}
                  />
                </ExpandableSection>

                <ExpandableSection title="Usage">
                  <ComparisonRow
                    label="Usage"
                    remedies={remedies}
                    minColumnWidth={minColumnWidthPx}
                    renderCell={(remedy) => (
                      <p className="text-sm text-foreground">
                        {remedy.usage || "Usage information not available"}
                      </p>
                    )}
                  />
                </ExpandableSection>

                <ExpandableSection title="Dosage">
                  <ComparisonRow
                    label="Dosage"
                    remedies={remedies}
                    minColumnWidth={minColumnWidthPx}
                    renderCell={(remedy) => (
                      <p className="text-sm text-foreground font-medium">
                        {remedy.dosage || "Dosage information not available"}
                      </p>
                    )}
                    highlight
                  />
                </ExpandableSection>

                <ExpandableSection title="Precautions">
                  <ComparisonRow
                    label="Precautions"
                    remedies={remedies}
                    minColumnWidth={minColumnWidthPx}
                    renderCell={(remedy) => (
                      <div className="text-sm text-amber-700 dark:text-amber-400">
                        {remedy.precautions ||
                          "Precaution information not available"}
                      </div>
                    )}
                  />
                </ExpandableSection>

                <ExpandableSection title="Interactions">
                  <ComparisonRow
                    label="Interactions"
                    remedies={remedies}
                    minColumnWidth={minColumnWidthPx}
                    renderCell={(remedy) => (
                      <p className="text-sm text-foreground">
                        {remedy.interactions ||
                          "No known interactions documented"}
                      </p>
                    )}
                  />
                </ExpandableSection>

                <ExpandableSection title="Scientific Information">
                  <ComparisonRow
                    label="Scientific Info"
                    remedies={remedies}
                    minColumnWidth={minColumnWidthPx}
                    renderCell={(remedy) => (
                      <p className="text-sm text-foreground">
                        {remedy.scientificInfo ||
                          "Scientific information not available"}
                      </p>
                    )}
                  />
                </ExpandableSection>

                {/* Related pharmaceuticals if available */}
                {remedies.some((r) => r.relatedPharmaceuticals?.length) && (
                  <ExpandableSection
                    title="Related Pharmaceuticals"
                    defaultExpanded={false}
                  >
                    <ComparisonRow
                      label="Related Pharmaceuticals"
                      remedies={remedies}
                      minColumnWidth={minColumnWidthPx}
                      renderCell={(remedy) => (
                        <div className="space-y-1">
                          {remedy.relatedPharmaceuticals?.length ? (
                            remedy.relatedPharmaceuticals.map((pharma) => (
                              <div
                                key={pharma.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-foreground">
                                  {pharma.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {(pharma.similarityScore * 100).toFixed(0)}%
                                  match
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              No related pharmaceuticals
                            </span>
                          )}
                        </div>
                      )}
                    />
                  </ExpandableSection>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
