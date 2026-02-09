"use client";

import { Component, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { CompareProvider } from "@/context/CompareContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { ComparisonBar } from "@/components/compare/ComparisonBar";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
  children: ReactNode;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary that catches Clerk loading failures
 * and renders a fallback (children without auth) so the app still works
 */
class ClerkErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    console.warn(
      "Clerk failed to load, app will render without auth:",
      error.message,
    );
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Inner providers that wrap the app content regardless of auth state
 */
function AppProviders({ children }: ProvidersProps): ReactNode {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <OnboardingProvider>
        <CompareProvider>
          {children}
          <ComparisonBar />
        </CompareProvider>
      </OnboardingProvider>
      <Toaster />
    </ThemeProvider>
  );
}

/**
 * Combined providers for the application
 * Includes Clerk authentication, ThemeProvider, CompareProvider, and OnboardingProvider
 *
 * ClerkProvider is wrapped in an error boundary so if Clerk JS fails to load
 * (e.g. CSP blocks it, network issue), the rest of the app still renders.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkErrorBoundary fallback={<AppProviders>{children}</AppProviders>}>
      <ClerkProvider>
        <AppProviders>{children}</AppProviders>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}
