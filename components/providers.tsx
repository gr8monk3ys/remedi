"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { CompareProvider } from "@/context/CompareContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { ComparisonBar } from "@/components/compare/ComparisonBar";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Combined providers for the application
 * Includes Clerk authentication, ThemeProvider, CompareProvider, and OnboardingProvider
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <OnboardingProvider>
          <CompareProvider>
            {children}
            <ComparisonBar />
          </CompareProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
