'use client'

import { formatDistanceToNow } from 'date-fns'
import { Search, Heart, Star, FileText, HeartOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityItem } from '@/types/dashboard'

interface ActivityFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
  maxItems?: number
  className?: string
}

const activityIcons = {
  search: Search,
  favorite_add: Heart,
  favorite_remove: HeartOff,
  review: Star,
  contribution: FileText,
}

const activityColors = {
  search: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  favorite_add: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  favorite_remove: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  review: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  contribution: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
}

/**
 * Activity Feed Component
 *
 * Displays a list of recent user activities.
 */
export function ActivityFeed({
  activities,
  isLoading = false,
  maxItems = 5,
  className,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (isLoading) {
    return <ActivityFeedSkeleton count={maxItems} className={className} />
  }

  if (activities.length === 0) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
          className
        )}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Start searching to see your activity here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {displayedActivities.map((activity) => {
          const Icon = activityIcons[activity.type]
          const colorClass = activityColors[activity.type]

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className={cn('p-2 rounded-lg flex-shrink-0', colorClass)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <time dateTime={activity.timestamp.toISOString()}>
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </time>
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Skeleton loader for activity feed
 */
export function ActivityFeedSkeleton({
  count = 5,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
    >
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />

      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
