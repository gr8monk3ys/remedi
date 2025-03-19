"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { SearchComponent } from "@/components/ui/search";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AuroraBackgroundDemo() {
  // We'll use the onSearch handler from SearchComponent directly
  
  return (
    <AuroraBackground>
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 py-10"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          RemediFind
        </div>
        <div className="text-xl md:text-3xl font-medium dark:text-white text-center mb-2">
          Natural Alternatives to Pharmaceuticals
        </div>
        <div className="font-extralight text-base md:text-xl dark:text-neutral-200 py-2 text-center max-w-2xl">
          Enter a pharmaceutical drug or supplement to discover natural alternatives with similar nutrients and benefits.
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 italic text-center max-w-2xl mb-4">
          Our database includes natural remedies for common medications and supplements. 
          Click one of the suggested options below or type your own search.
        </div>
        
        <div className="w-full max-w-2xl">
          <SearchComponent />
        </div>

        <div className="w-full max-w-2xl mt-10 text-center text-sm text-gray-600 dark:text-gray-300">
          <p>This is a demonstration application showing how natural remedies can be correlated with pharmaceutical options.</p>
          <p className="mt-2">Always consult your healthcare provider before making any changes to your medication.</p>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
