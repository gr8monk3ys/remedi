"use client";

/**
 * Contribution Form Component
 *
 * Main form component for submitting new natural remedies.
 * Uses extracted hook for state management and sub-components for reusable UI.
 */

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Send, AlertCircle } from "lucide-react";
import { useContributionForm } from "./useContributionForm";
import { DynamicListInput } from "./DynamicListInput";
import { ReferencesInput } from "./ReferencesInput";
import { CATEGORIES } from "./types";
import type { ContributionFormProps } from "./types";

export function ContributionForm({ onSuccess }: ContributionFormProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const {
    state,
    handleSubmit,
    setField,
    setIngredient,
    addIngredient,
    removeIngredient,
    setBenefit,
    addBenefit,
    removeBenefit,
    setReference,
    addReference,
    removeReference,
    reset,
  } = useContributionForm(onSuccess);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Sign in to contribute a new natural remedy to our database.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Sign In to Contribute
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
          Thank You for Your Contribution!
        </h3>
        <p className="text-green-700 dark:text-green-400 mb-4">
          Your remedy has been submitted and is pending review by our moderation
          team. You&apos;ll be notified once it&apos;s approved.
        </p>
        <button onClick={reset} className="text-primary hover:underline">
          Submit Another Remedy
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Remedy Name *
          </label>
          <input
            type="text"
            id="name"
            value={state.name}
            onChange={(e) => setField("name", e.target.value)}
            required
            minLength={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Turmeric Extract"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category *
          </label>
          <select
            id="category"
            value={state.category}
            onChange={(e) => setField("category", e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description *
        </label>
        <textarea
          id="description"
          value={state.description}
          onChange={(e) => setField("description", e.target.value)}
          required
          minLength={20}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Describe the remedy and its traditional uses..."
        />
      </div>

      {/* Ingredients */}
      <DynamicListInput
        label="Key Ingredients/Components"
        items={state.ingredients}
        placeholder="e.g., Curcumin"
        onItemChange={setIngredient}
        onAdd={addIngredient}
        onRemove={removeIngredient}
        addLabel="Add Ingredient"
        required
      />

      {/* Benefits */}
      <DynamicListInput
        label="Health Benefits"
        items={state.benefits}
        placeholder="e.g., Reduces inflammation"
        onItemChange={setBenefit}
        onAdd={addBenefit}
        onRemove={removeBenefit}
        addLabel="Add Benefit"
        required
      />

      {/* Usage & Dosage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="usage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Usage Instructions
          </label>
          <textarea
            id="usage"
            value={state.usage}
            onChange={(e) => setField("usage", e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="How to use this remedy..."
          />
        </div>

        <div>
          <label
            htmlFor="dosage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Recommended Dosage
          </label>
          <textarea
            id="dosage"
            value={state.dosage}
            onChange={(e) => setField("dosage", e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Typical dosage recommendations..."
          />
        </div>
      </div>

      {/* Precautions */}
      <div>
        <label
          htmlFor="precautions"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Precautions & Warnings
        </label>
        <textarea
          id="precautions"
          value={state.precautions}
          onChange={(e) => setField("precautions", e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Any contraindications or warnings..."
        />
      </div>

      {/* Scientific Info */}
      <div>
        <label
          htmlFor="scientificInfo"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Scientific Information
        </label>
        <textarea
          id="scientificInfo"
          value={state.scientificInfo}
          onChange={(e) => setField("scientificInfo", e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Any scientific studies or evidence..."
        />
      </div>

      {/* References */}
      <ReferencesInput
        references={state.references}
        onReferenceChange={setReference}
        onAdd={addReference}
        onRemove={removeReference}
      />

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <p className="font-medium mb-1">Submission Guidelines</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Only submit remedies with legitimate traditional or scientific
                backing
              </li>
              <li>
                Include accurate information and proper references when
                available
              </li>
              <li>
                All submissions are reviewed by our moderation team before
                publishing
              </li>
            </ul>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={state.isSubmitting}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit for Review
          </>
        )}
      </button>
    </form>
  );
}
