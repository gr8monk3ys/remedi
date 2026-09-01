"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Client component for the maintenance page refresh button.
 * Extracted so the rest of the maintenance page can be server-rendered.
 */
export function RefreshButton(): React.ReactElement {
  return (
    <Button className="mt-6" onClick={() => window.location.reload()}>
      <RefreshCw aria-hidden="true" />
      Try Again
    </Button>
  );
}
