"use client";

import { Shield, Sparkles, Users, Zap } from "lucide-react";

 
interface WelcomeStepProps {}

export function WelcomeStep(_props: WelcomeStepProps): React.ReactNode {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        Discover natural alternatives to pharmaceuticals and supplements. Our
        platform helps you find evidence-based natural remedies tailored to your
        needs.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Evidence-Based
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All remedies backed by research
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
          <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            AI-Powered
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Smart recommendations for you
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
          <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Community
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Join 10,000+ wellness seekers
          </p>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
          <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Instant Results
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Find alternatives in seconds
          </p>
        </div>
      </div>
    </div>
  );
}
