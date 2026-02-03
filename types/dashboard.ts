/**
 * Dashboard Types and Interfaces
 *
 * Provides TypeScript types for the user dashboard features.
 */

import type { PlanType } from '@/lib/stripe'

/**
 * User stats displayed on dashboard
 */
export interface DashboardStats {
  totalSearchesThisMonth: number
  favoritesCount: number
  collectionsCount: number
  reviewsCount: number
  contributionsCount: number
  currentPlan: PlanType
  aiSearchesRemaining: number
  aiSearchesLimit: number
  searchesRemaining: number
  searchesLimit: number
}

/**
 * Activity item for the activity feed
 */
export interface ActivityItem {
  id: string
  type: 'search' | 'favorite_add' | 'favorite_remove' | 'review' | 'contribution'
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Search history item
 */
export interface SearchHistoryItem {
  id: string
  query: string
  resultsCount: number
  createdAt: Date
}

/**
 * Favorite item with additional details
 */
export interface FavoriteItem {
  id: string
  remedyId: string
  remedyName: string
  notes?: string | null
  collectionName?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Collection summary
 */
export interface Collection {
  name: string
  count: number
}

/**
 * Subscription details for dashboard display
 */
export interface SubscriptionDetails {
  id?: string
  plan: PlanType
  planDetails: {
    name: string
    description: string
    price: number
    yearlyPrice?: number
    features: string[]
    limits: {
      favorites: number
      searchesPerDay: number
      aiSearches: number
    }
  }
  status: 'active' | 'cancelled' | 'expired' | 'suspended'
  interval?: 'monthly' | 'yearly' | null
  currentPeriodEnd?: Date | null
  cancelAtPeriodEnd: boolean
  isActive: boolean
  canUpgrade: boolean
  canManage: boolean
}

/**
 * User settings
 */
export interface UserSettings {
  emailNotifications: boolean
  marketingEmails: boolean
  searchHistory: boolean
  publicProfile: boolean
}

/**
 * User profile data
 */
export interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  createdAt: Date
}

/**
 * Dashboard navigation item
 */
export interface DashboardNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

/**
 * Usage data for progress display
 */
export interface UsageData {
  current: number
  limit: number
  label: string
  unit?: string
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'json'

/**
 * View mode for lists
 */
export type ViewMode = 'grid' | 'list'

/**
 * Sort options for favorites
 */
export type FavoritesSortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc'

/**
 * Sort options for history
 */
export type HistorySortOption = 'newest' | 'oldest' | 'most_results' | 'least_results'
