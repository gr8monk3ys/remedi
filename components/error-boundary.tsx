"use client";

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them to Sentry, and displays a fallback UI.
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import React from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras({ componentStack: errorInfo.componentStack });
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });

    // Also log to console for development
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  handleReport = (): void => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We are sorry, but something unexpected happened. Our team has been
              notified and we are working on fixing it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              {this.state.eventId && (
                <button
                  onClick={this.handleReport}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                >
                  Report Feedback
                </button>
              )}
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
