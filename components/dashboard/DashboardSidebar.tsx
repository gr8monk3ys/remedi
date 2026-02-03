'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  History,
  Heart,
  CreditCard,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from 'next-auth'
import type { PlanType } from '@/lib/stripe'

interface DashboardSidebarProps {
  user: User & { role?: string }
  currentPlan?: PlanType
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Dashboard overview',
  },
  {
    href: '/dashboard/history',
    label: 'Search History',
    icon: History,
    description: 'View past searches',
  },
  {
    href: '/dashboard/favorites',
    label: 'Favorites',
    icon: Heart,
    description: 'Saved remedies',
  },
  {
    href: '/dashboard/subscription',
    label: 'Subscription',
    icon: CreditCard,
    description: 'Manage your plan',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Account settings',
  },
]

/**
 * Dashboard Sidebar Component
 *
 * Provides navigation for the user dashboard.
 * Collapsible on mobile devices.
 */
export function DashboardSidebar({ user, currentPlan = 'free' }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const displayName = user.name || user.email || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()

  const planLabels: Record<PlanType, string> = {
    free: 'Free Plan',
    basic: 'Basic Plan',
    premium: 'Premium Plan',
    enterprise: 'Enterprise',
  }

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Remedi</span>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
              <ChevronRight
                className={cn(
                  'w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all',
                  'group-hover:opacity-100 group-hover:translate-x-0',
                  isActive && 'opacity-100 translate-x-0'
                )}
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </nav>

      {/* Back to Site */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">Back to Site</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {planLabels[currentPlan]}
            </p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
        aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="mobile-sidebar"
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile sidebar"
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        aria-label="Desktop sidebar"
      >
        <NavContent />
      </aside>
    </>
  )
}
