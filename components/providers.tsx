"use client";

import { useState, type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { CompareProvider } from "@/lib/context/CompareContext";
import { OnboardingProvider } from "@/lib/context/OnboardingContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/toaster";

const ComparisonBar = dynamic(
  () =>
    import("@/components/compare/ComparisonBar").then((mod) => ({
      default: mod.ComparisonBar,
    })),
  { ssr: false },
);

interface ProvidersProps {
  /** Forwarded to next-themes' inline pre-paint script so CSP allows it. */
  nonce?: string;
  children: ReactNode;
}

/**
 * Combined providers for the application: React Query, theme, onboarding and
 * compare state. Auth needs no provider; components read the session with
 * useAuthState() from lib/auth-client.
 */
export function Providers({ children, nonce }: ProvidersProps): ReactNode {
  // useState ensures a single QueryClient per app lifetime (standard Next.js pattern)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        nonce={nonce}
      >
        <OnboardingProvider>
          <CompareProvider>
            {children}
            <ComparisonBar />
          </CompareProvider>
        </OnboardingProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
