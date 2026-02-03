'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  Share2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'
import { Header } from '@/components/ui/header'
import { useCompare } from '@/context/CompareContext'
import { ExportComparison, MobileComparisonSwiper, ComparisonHistory } from '@/components/compare'
import type { DetailedRemedy } from '@/lib/types'

/**
 * Custom hook to detect mobile viewport
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Evidence level configuration with colors and descriptions
 */
const EVIDENCE_LEVELS: Record<
  string,
  { color: string; bgColor: string; description: string }
> = {
  Strong: {
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    description: 'Multiple high-quality clinical trials',
  },
  Moderate: {
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Some clinical evidence available',
  },
  Limited: {
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    description: 'Preliminary or limited studies',
  },
  Traditional: {
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Based on traditional use',
  },
}

/**
 * Extended remedy type with pharmaceutical mappings
 */
interface CompareRemedy extends DetailedRemedy {
  evidenceLevel?: string
  benefits?: string[]
  sideEffects?: string[]
  interactions?: string
  relatedPharmaceuticals?: Array<{
    id: string
    name: string
    similarityScore: number
  }>
}

/**
 * Expandable section component for long content
 */
function ExpandableSection({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Evidence level badge component
 */
function EvidenceBadge({ level }: { level: string | undefined }) {
  if (!level) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Not specified
      </span>
    )
  }

  const config = EVIDENCE_LEVELS[level] || {
    color: 'text-gray-700 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Unknown evidence level',
  }

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}
      >
        {level}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {config.description}
      </span>
    </div>
  )
}

/**
 * Bullet list component for benefits, side effects, etc.
 */
function BulletList({
  items,
  emptyMessage = 'No information available',
}: {
  items: string[] | undefined
  emptyMessage?: string
}) {
  if (!items || items.length === 0) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
        {emptyMessage}
      </span>
    )
  }

  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li
          key={index}
          className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
        >
          <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Comparison row for an attribute
 */
function ComparisonRow({
  label,
  remedies,
  renderCell,
  highlight = false,
}: {
  label: string
  remedies: CompareRemedy[]
  renderCell: (remedy: CompareRemedy) => React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={`grid gap-4 py-4 px-4 ${
        highlight ? 'bg-primary/5' : ''
      }`}
      style={{
        gridTemplateColumns: `repeat(${remedies.length}, minmax(0, 1fr))`,
      }}
      role="row"
      aria-label={label}
    >
      {remedies.map((remedy) => (
        <div key={remedy.id} className="min-w-0" role="cell">
          {renderCell(remedy)}
        </div>
      ))}
    </div>
  )
}

/**
 * Empty slot for adding another remedy
 */
function AddRemedySlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
      aria-label="Add another remedy to compare"
    >
      <Plus className="w-12 h-12 text-gray-400 group-hover:text-primary transition-colors" />
      <span className="mt-2 text-sm text-gray-500 group-hover:text-primary transition-colors">
        Add Remedy
      </span>
    </button>
  )
}

/**
 * Loading skeleton for comparison
 */
function ComparisonSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm h-96 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Main comparison content component
 */
function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { items, removeFromCompare, clearComparison, getCompareUrl } =
    useCompare()
  const isMobile = useIsMobile()

  const [remedies, setRemedies] = useState<CompareRemedy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareToast, setShowShareToast] = useState(false)

  // Get IDs from URL or context
  const idsFromUrl = searchParams.get('ids')
  const ids = idsFromUrl
    ? idsFromUrl.split(',').filter((id) => id.trim())
    : items.map((item) => item.id)

  // Fetch remedies data
  const fetchRemedies = useCallback(async () => {
    if (ids.length === 0) {
      setRemedies([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/remedies/compare?ids=${ids.join(',')}`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch remedies')
      }

      setRemedies(data.data.remedies || [])
    } catch (err) {
      console.error('Error fetching remedies:', err)
      setError(err instanceof Error ? err.message : 'Failed to load remedies')
    } finally {
      setIsLoading(false)
    }
  }, [ids])

  useEffect(() => {
    fetchRemedies()
  }, [fetchRemedies])

  // Save comparison to history when remedies are loaded
  useEffect(() => {
    if (remedies.length >= 2) {
      saveComparisonToHistory(remedies)
    }
  }, [remedies])

  // Handle removing a remedy from comparison
  const handleRemoveRemedy = (id: string) => {
    removeFromCompare(id)
    const newIds = ids.filter((i) => i !== id)
    if (newIds.length > 0) {
      router.push(`/compare?ids=${newIds.join(',')}`)
    } else {
      router.push('/compare')
    }
  }

  // Handle clearing all remedies
  const handleClearAll = () => {
    clearComparison()
    router.push('/compare')
  }

  // Handle share functionality
  const handleShare = async () => {
    const url = `${window.location.origin}${getCompareUrl()}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Remedy Comparison - Remedi',
          text: `Compare natural remedies: ${remedies.map((r) => r.name).join(', ')}`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      }
    } catch (err) {
      // User cancelled share or clipboard failed
      console.log('Share cancelled or failed:', err)
    }
  }

  // Handle adding another remedy
  const handleAddRemedy = () => {
    router.push('/')
  }

  if (isLoading) {
    return <ComparisonSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />

      {/* Main content */}
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Go back to search"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Compare Remedies
              </h1>
            </div>

            {remedies.length > 0 && (
              <div className="flex items-center gap-3">
                <ExportComparison remedies={remedies} />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                  aria-label="Share comparison"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

          {/* Empty state */}
          {remedies.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No remedies to compare
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Search for natural remedies and add them to your comparison list
                to see a detailed side-by-side analysis.
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
              <div className={`bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden print:shadow-none ${isMobile ? 'hidden md:block' : ''}`} id="comparison-content">
              {/* Remedy headers */}
              <div
                className="grid gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800/50"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(remedies.length + (remedies.length < 4 ? 1 : 0), 4)}, minmax(0, 1fr))`,
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
                      <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-700">
                        {remedy.imageUrl ? (
                          <Image
                            src={remedy.imageUrl}
                            alt={remedy.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <h2 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {remedy.name}
                      </h2>
                      {remedy.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {remedy.category}
                        </span>
                      )}
                    </Link>
                  </div>
                ))}

                {/* Add another remedy slot */}
                {remedies.length < 4 && (
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
                  renderCell={(remedy) => (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {remedy.usage || 'Usage information not available'}
                    </p>
                  )}
                />
              </ExpandableSection>

              <ExpandableSection title="Dosage">
                <ComparisonRow
                  label="Dosage"
                  remedies={remedies}
                  renderCell={(remedy) => (
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {remedy.dosage || 'Dosage information not available'}
                    </p>
                  )}
                  highlight
                />
              </ExpandableSection>

              <ExpandableSection title="Precautions">
                <ComparisonRow
                  label="Precautions"
                  remedies={remedies}
                  renderCell={(remedy) => (
                    <div className="text-sm text-amber-700 dark:text-amber-400">
                      {remedy.precautions ||
                        'Precaution information not available'}
                    </div>
                  )}
                />
              </ExpandableSection>

              <ExpandableSection title="Interactions">
                <ComparisonRow
                  label="Interactions"
                  remedies={remedies}
                  renderCell={(remedy) => (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {remedy.interactions ||
                        'No known interactions documented'}
                    </p>
                  )}
                />
              </ExpandableSection>

              <ExpandableSection title="Scientific Information">
                <ComparisonRow
                  label="Scientific Info"
                  remedies={remedies}
                  renderCell={(remedy) => (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {remedy.scientificInfo ||
                        'Scientific information not available'}
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
                    renderCell={(remedy) => (
                      <div className="space-y-1">
                        {remedy.relatedPharmaceuticals?.length ? (
                          remedy.relatedPharmaceuticals.map((pharma) => (
                            <div
                              key={pharma.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-700 dark:text-gray-300">
                                {pharma.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(pharma.similarityScore * 100).toFixed(0)}%
                                match
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            No related pharmaceuticals
                          </span>
                        )}
                      </div>
                    )}
                  />
                </ExpandableSection>
              )}
              </div>
            </>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg print:mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Disclaimer:</strong> This comparison is for informational
              purposes only and should not be considered medical advice. Always
              consult with a qualified healthcare professional before making
              changes to your health regimen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Save comparison to localStorage history
 */
function saveComparisonToHistory(remedies: CompareRemedy[]) {
  if (typeof window === 'undefined') return

  const HISTORY_KEY = 'remedi-comparison-history'
  const MAX_HISTORY = 10

  try {
    const existingHistory = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || '[]'
    )

    const comparisonEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      remedyIds: remedies.map((r) => r.id),
      remedyNames: remedies.map((r) => r.name),
    }

    // Check if this exact comparison already exists
    const isDuplicate = existingHistory.some(
      (entry: { remedyIds: string[] }) =>
        entry.remedyIds.sort().join(',') ===
        comparisonEntry.remedyIds.sort().join(',')
    )

    if (!isDuplicate) {
      const newHistory = [comparisonEntry, ...existingHistory].slice(
        0,
        MAX_HISTORY
      )
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    }
  } catch (err) {
    console.error('Failed to save comparison history:', err)
  }
}

/**
 * Compare page component wrapped in Suspense for useSearchParams
 */
export default function ComparePage() {
  return (
    <Suspense fallback={<ComparisonSkeleton />}>
      <CompareContent />
    </Suspense>
  )
}
