"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { CompareProvider } from "@/context/CompareContext";
import { ComparisonBar } from "@/components/compare/ComparisonBar";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Combined providers for the application
 * Includes NextAuth SessionProvider, ThemeProvider, and CompareProvider
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CompareProvider>
          {children}
          <ComparisonBar />
        </CompareProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
