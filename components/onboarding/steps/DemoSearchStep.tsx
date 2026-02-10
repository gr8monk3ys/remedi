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
        <div className="flex items-center gap-2 p-4 bg-muted rounded-xl">
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
        <h3 className="text-sm font-medium text-foreground">
          Popular searches:
        </h3>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SEARCHES.map((search) => (
            <button
              key={search}
              onClick={() => handleDemoSearch(search)}
              className={cn(
                "px-4 py-2 text-sm rounded-full transition-all",
                demoQuery === search
                  ? "bg-green-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80",
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
          className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-medium">
              Great choice! You will see results for &quot;
              {demoQuery}&quot; after completing the setup.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
