"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type Attribute = "class" | "data-theme" | "data-mode";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
  themes?: string[];
  /**
   * CSP nonce for next-themes' pre-paint script.
   *
   * That script runs inline to apply the stored theme before first paint, so
   * it cannot be moved to a file. Without the nonce it is blocked — the CSP
   * carries 'unsafe-inline' as a fallback, but a nonce-aware browser ignores
   * that whenever a nonce is present, so the theme script was the one thing
   * on the page still violating the policy.
   */
  nonce?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
