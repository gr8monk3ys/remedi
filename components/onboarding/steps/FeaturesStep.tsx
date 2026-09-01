"use client";

import { motion } from "framer-motion";
import { Heart, Search, Sparkles } from "lucide-react";

interface FeaturesStepProps {}

export function FeaturesStep(_props: FeaturesStepProps): React.ReactNode {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Explore our powerful features designed to help you on your wellness
        journey.
      </p>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-4 rounded-md border border-border bg-background p-4"
        >
          <div className="shrink-0 rounded-md bg-primary/10 p-2">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Smart Search
            </h3>
            <p className="text-sm text-muted-foreground">
              Search any pharmaceutical or supplement to find natural
              alternatives. Our database includes FDA-approved drugs and
              evidence-based remedies.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-4 rounded-md border border-border bg-background p-4"
        >
          <div className="shrink-0 rounded-md bg-primary/10 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              AI-Powered Matching
            </h3>
            <p className="text-sm text-muted-foreground">
              Describe your symptoms in natural language. Our AI understands
              queries like &quot;I have trouble sleeping&quot; or &quot;natural
              pain relief.&quot;
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-4 rounded-md border border-border bg-background p-4"
        >
          <div className="shrink-0 rounded-md bg-primary/10 p-2">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Save Favorites
            </h3>
            <p className="text-sm text-muted-foreground">
              Build your personal collection of natural remedies. Access your
              favorites anytime, from any device.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
