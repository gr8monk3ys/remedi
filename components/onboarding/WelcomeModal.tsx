"use client";

import { useState } from "react";
import { X, Leaf, Search, Heart, Sparkles } from "lucide-react";

interface WelcomeModalProps {
  onClose: () => void;
  onStartTutorial?: () => void;
}

const sampleSearches = [
  "Natural alternatives to ibuprofen",
  "Herbal remedies for sleep",
  "Vitamin C supplements",
  "Natural anti-inflammatory",
];

export function WelcomeModal({ onClose, onStartTutorial }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("remedi_welcome_dismissed", "true");
    }
    onClose();
  };

  const handleStartTutorial = () => {
    handleClose();
    onStartTutorial?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to Remedi
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Your natural wellness companion
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            Discover natural alternatives to pharmaceuticals and supplements.
            Our platform helps you find evidence-based natural remedies tailored
            to your needs.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Smart Search
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Search for any pharmaceutical or supplement to find natural alternatives
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  AI-Powered Matching
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get personalized recommendations based on your symptoms
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Save Favorites
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Build your personal collection of natural remedies
                </p>
              </div>
            </div>
          </div>

          {/* Sample Searches */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Try searching for:
            </h3>
            <div className="flex flex-wrap gap-2">
              {sampleSearches.map((search) => (
                <button
                  key={search}
                  onClick={handleClose}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleStartTutorial}
              className="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Take a Quick Tour
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Start Exploring
            </button>
          </div>

          {/* Don't show again */}
          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            Don&apos;t show this again
          </label>
        </div>
      </div>
    </div>
  );
}
