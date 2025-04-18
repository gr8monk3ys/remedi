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
          className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl"
        >
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg shrink-0">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Smart Search</h3>
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
          className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl"
        >
          <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg shrink-0">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
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
          className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl"
        >
          <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg shrink-0">
            <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Save Favorites</h3>
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
