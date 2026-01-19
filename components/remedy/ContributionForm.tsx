"use client";

import { useReducer, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, X, Send, AlertCircle } from "lucide-react";
import { fetchWithCSRF } from "@/lib/fetch";

const CATEGORIES = [
  "Herbs & Botanicals",
  "Vitamins & Minerals",
  "Amino Acids",
  "Probiotics",
  "Essential Oils",
  "Homeopathic",
  "Traditional Medicine",
  "Other",
];

interface Reference {
  title: string;
  url?: string;
}

interface ContributionFormProps {
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  description: string;
  category: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  dosage: string;
  precautions: string;
  scientificInfo: string;
  references: Reference[];
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: FormState[keyof FormState] }
  | { type: 'SET_INGREDIENT'; index: number; value: string }
  | { type: 'ADD_INGREDIENT' }
  | { type: 'REMOVE_INGREDIENT'; index: number }
  | { type: 'SET_BENEFIT'; index: number; value: string }
  | { type: 'ADD_BENEFIT' }
  | { type: 'REMOVE_BENEFIT'; index: number }
  | { type: 'SET_REFERENCE'; index: number; field: keyof Reference; value: string }
  | { type: 'ADD_REFERENCE' }
  | { type: 'REMOVE_REFERENCE'; index: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'RESET' };

const initialState: FormState = {
  name: "",
  description: "",
  category: "",
  ingredients: [""],
  benefits: [""],
  usage: "",
  dosage: "",
  precautions: "",
  scientificInfo: "",
  references: [{ title: "", url: "" }],
  isSubmitting: false,
  error: null,
  success: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_INGREDIENT': {
      const ingredients = [...state.ingredients];
      ingredients[action.index] = action.value;
      return { ...state, ingredients };
    }

    case 'ADD_INGREDIENT':
      return { ...state, ingredients: [...state.ingredients, ""] };

    case 'REMOVE_INGREDIENT':
      if (state.ingredients.length <= 1) return state;
      return {
        ...state,
        ingredients: state.ingredients.filter((_, i) => i !== action.index),
      };

    case 'SET_BENEFIT': {
      const benefits = [...state.benefits];
      benefits[action.index] = action.value;
      return { ...state, benefits };
    }

    case 'ADD_BENEFIT':
      return { ...state, benefits: [...state.benefits, ""] };

    case 'REMOVE_BENEFIT':
      if (state.benefits.length <= 1) return state;
      return {
        ...state,
        benefits: state.benefits.filter((_, i) => i !== action.index),
      };

    case 'SET_REFERENCE': {
      const references = [...state.references];
      references[action.index] = {
        ...references[action.index],
        [action.field]: action.value,
      };
      return { ...state, references };
    }

    case 'ADD_REFERENCE':
      return { ...state, references: [...state.references, { title: "", url: "" }] };

    case 'REMOVE_REFERENCE':
      if (state.references.length <= 1) return state;
      return {
        ...state,
        references: state.references.filter((_, i) => i !== action.index),
      };

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };

    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.error };

    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, success: true };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function ContributionForm({ onSuccess }: ContributionFormProps) {
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });

    const filteredIngredients = state.ingredients.filter(i => i.trim());
    const filteredBenefits = state.benefits.filter(b => b.trim());
    const filteredReferences = state.references.filter(r => r.title.trim());

    if (filteredIngredients.length === 0) {
      dispatch({ type: 'SUBMIT_ERROR', error: "At least one ingredient is required" });
      return;
    }

    if (filteredBenefits.length === 0) {
      dispatch({ type: 'SUBMIT_ERROR', error: "At least one benefit is required" });
      return;
    }

    try {
      const response = await fetchWithCSRF("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          description: state.description,
          category: state.category,
          ingredients: filteredIngredients,
          benefits: filteredBenefits,
          usage: state.usage || undefined,
          dosage: state.dosage || undefined,
          precautions: state.precautions || undefined,
          scientificInfo: state.scientificInfo || undefined,
          references: filteredReferences.length > 0 ? filteredReferences : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        dispatch({ type: 'SUBMIT_ERROR', error: data.error?.message || "Failed to submit contribution" });
        return;
      }

      dispatch({ type: 'SUBMIT_SUCCESS' });
      onSuccess?.();
    } catch {
      dispatch({ type: 'SUBMIT_ERROR', error: "Failed to submit contribution. Please try again." });
    }
  }, [state, onSuccess]);

  if (!session) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Sign in to contribute a new natural remedy to our database.
        </p>
        <Link
          href="/auth/signin"
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
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
          Thank You for Your Contribution!
        </h3>
        <p className="text-green-700 dark:text-green-400 mb-4">
          Your remedy has been submitted and is pending review by our moderation team.
          You&apos;ll be notified once it&apos;s approved.
        </p>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="text-primary hover:underline"
        >
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Remedy Name *
          </label>
          <input
            type="text"
            id="name"
            value={state.name}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
            required
            minLength={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Turmeric Extract"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={state.category}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'category', value: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={state.description}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
          required
          minLength={20}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Describe the remedy and its traditional uses..."
        />
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Key Ingredients/Components *
        </label>
        {state.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => dispatch({ type: 'SET_INGREDIENT', index, value: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Curcumin"
            />
            {state.ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_INGREDIENT', index })}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_INGREDIENT' })}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Ingredient
        </button>
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Health Benefits *
        </label>
        {state.benefits.map((benefit, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) => dispatch({ type: 'SET_BENEFIT', index, value: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Reduces inflammation"
            />
            {state.benefits.length > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_BENEFIT', index })}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_BENEFIT' })}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Benefit
        </button>
      </div>

      {/* Usage & Dosage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="usage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Usage Instructions
          </label>
          <textarea
            id="usage"
            value={state.usage}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'usage', value: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="How to use this remedy..."
          />
        </div>

        <div>
          <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recommended Dosage
          </label>
          <textarea
            id="dosage"
            value={state.dosage}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'dosage', value: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Typical dosage recommendations..."
          />
        </div>
      </div>

      {/* Precautions */}
      <div>
        <label htmlFor="precautions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Precautions & Warnings
        </label>
        <textarea
          id="precautions"
          value={state.precautions}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'precautions', value: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Any contraindications or warnings..."
        />
      </div>

      {/* Scientific Info */}
      <div>
        <label htmlFor="scientificInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Scientific Information
        </label>
        <textarea
          id="scientificInfo"
          value={state.scientificInfo}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'scientificInfo', value: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Any scientific studies or evidence..."
        />
      </div>

      {/* References */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          References & Sources
        </label>
        {state.references.map((ref, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={ref.title}
              onChange={(e) => dispatch({ type: 'SET_REFERENCE', index, field: 'title', value: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Reference title"
            />
            <input
              type="url"
              value={ref.url}
              onChange={(e) => dispatch({ type: 'SET_REFERENCE', index, field: 'url', value: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="URL (optional)"
            />
            {state.references.length > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_REFERENCE', index })}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_REFERENCE' })}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Reference
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <p className="font-medium mb-1">Submission Guidelines</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Only submit remedies with legitimate traditional or scientific backing</li>
              <li>Include accurate information and proper references when available</li>
              <li>All submissions are reviewed by our moderation team before publishing</li>
            </ul>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
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
