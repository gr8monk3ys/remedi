'use client'

/**
 * Maintenance Mode Page
 *
 * Displayed when MAINTENANCE_MODE=true is set in environment variables.
 * Users are redirected here by the middleware.
 */

export default function MaintenancePage(): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full text-center">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
          We are currently performing scheduled maintenance to improve your experience.
          Please check back soon.
        </p>

        {/* Estimated Time */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Estimated downtime
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            Less than 30 minutes
          </p>
        </div>

        {/* Status Updates */}
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <p>For status updates, follow us on social media or check our status page.</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2 -ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  )
}
