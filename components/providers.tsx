"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { CompareProvider } from "@/context/CompareContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { ComparisonBar } from "@/components/compare/ComparisonBar";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Combined providers for the application
 * Includes NextAuth SessionProvider, ThemeProvider, CompareProvider, and OnboardingProvider
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <OnboardingProvider>
          <CompareProvider>
            {children}
            <ComparisonBar />
          </CompareProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
