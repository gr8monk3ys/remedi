"use client";

import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_SEARCHES = [
  "Natural alternatives to ibuprofen",
  "Herbal sleep aids",
  "Natural anti-inflammatory",
  "Vitamin supplements",
];

interface DemoSearchStepProps {
  demoQuery: string;
  setDemoQuery: (query: string) => void;
  handleDemoSearch: (query: string) => void;
}

export function DemoSearchStep({
  demoQuery,
  setDemoQuery,
  handleDemoSearch,
}: DemoSearchStepProps): React.ReactNode {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Try a search to see how Remedi works. Click on any suggestion below:
      </p>

      <div className="relative">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={demoQuery}
            onChange={(e) => setDemoQuery(e.target.value)}
            placeholder="Try searching for a remedy..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && demoQuery.trim()) {
                handleDemoSearch(demoQuery);
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="eyebrow eyebrow-muted">Popular searches</h3>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SEARCHES.map((search) => (
            <button
              key={search}
              onClick={() => handleDemoSearch(search)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                demoQuery === search
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-border-strong hover:bg-muted",
              )}
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {demoQuery && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-primary/30 bg-primary/5 p-4"
        >
          <div className="flex items-center gap-2 text-primary">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">
              Great choice! You will see results for &quot;
              {demoQuery}&quot; after completing the setup.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
