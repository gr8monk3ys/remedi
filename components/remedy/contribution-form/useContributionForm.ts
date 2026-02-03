"use client";

/**
 * Contribution Form Reducer Hook
 *
 * Manages form state for remedy contributions using useReducer pattern.
 */

import { useReducer, useCallback } from "react";
import { fetchWithCSRF } from "@/lib/fetch";
import type { FormState, FormAction, Reference } from "./types";
import { initialFormState } from "./types";

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_INGREDIENT": {
      const ingredients = [...state.ingredients];
      ingredients[action.index] = action.value;
      return { ...state, ingredients };
    }

    case "ADD_INGREDIENT":
      return { ...state, ingredients: [...state.ingredients, ""] };

    case "REMOVE_INGREDIENT":
      if (state.ingredients.length <= 1) return state;
      return {
        ...state,
        ingredients: state.ingredients.filter((_, i) => i !== action.index),
      };

    case "SET_BENEFIT": {
      const benefits = [...state.benefits];
      benefits[action.index] = action.value;
      return { ...state, benefits };
    }

    case "ADD_BENEFIT":
      return { ...state, benefits: [...state.benefits, ""] };

    case "REMOVE_BENEFIT":
      if (state.benefits.length <= 1) return state;
      return {
        ...state,
        benefits: state.benefits.filter((_, i) => i !== action.index),
      };

    case "SET_REFERENCE": {
      const references = [...state.references];
      references[action.index] = {
        ...references[action.index],
        [action.field]: action.value,
      };
      return { ...state, references };
    }

    case "ADD_REFERENCE":
      return {
        ...state,
        references: [...state.references, { title: "", url: "" }],
      };

    case "REMOVE_REFERENCE":
      if (state.references.length <= 1) return state;
      return {
        ...state,
        references: state.references.filter((_, i) => i !== action.index),
      };

    case "SUBMIT_START":
      return { ...state, isSubmitting: true, error: null };

    case "SUBMIT_ERROR":
      return { ...state, isSubmitting: false, error: action.error };

    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitting: false, success: true };

    case "RESET":
      return initialFormState;

    default:
      return state;
  }
}

export function useContributionForm(onSuccess?: () => void) {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: "SUBMIT_START" });

      const filteredIngredients = state.ingredients.filter((i) => i.trim());
      const filteredBenefits = state.benefits.filter((b) => b.trim());
      const filteredReferences = state.references.filter((r) => r.title.trim());

      if (filteredIngredients.length === 0) {
        dispatch({
          type: "SUBMIT_ERROR",
          error: "At least one ingredient is required",
        });
        return;
      }

      if (filteredBenefits.length === 0) {
        dispatch({
          type: "SUBMIT_ERROR",
          error: "At least one benefit is required",
        });
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
            references:
              filteredReferences.length > 0 ? filteredReferences : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          dispatch({
            type: "SUBMIT_ERROR",
            error: data.error?.message || "Failed to submit contribution",
          });
          return;
        }

        dispatch({ type: "SUBMIT_SUCCESS" });
        onSuccess?.();
      } catch {
        dispatch({
          type: "SUBMIT_ERROR",
          error: "Failed to submit contribution. Please try again.",
        });
      }
    },
    [state, onSuccess],
  );

  const setField = useCallback(
    (field: keyof FormState, value: FormState[keyof FormState]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    [],
  );

  const setIngredient = useCallback((index: number, value: string) => {
    dispatch({ type: "SET_INGREDIENT", index, value });
  }, []);

  const addIngredient = useCallback(() => {
    dispatch({ type: "ADD_INGREDIENT" });
  }, []);

  const removeIngredient = useCallback((index: number) => {
    dispatch({ type: "REMOVE_INGREDIENT", index });
  }, []);

  const setBenefit = useCallback((index: number, value: string) => {
    dispatch({ type: "SET_BENEFIT", index, value });
  }, []);

  const addBenefit = useCallback(() => {
    dispatch({ type: "ADD_BENEFIT" });
  }, []);

  const removeBenefit = useCallback((index: number) => {
    dispatch({ type: "REMOVE_BENEFIT", index });
  }, []);

  const setReference = useCallback(
    (index: number, field: keyof Reference, value: string) => {
      dispatch({ type: "SET_REFERENCE", index, field, value });
    },
    [],
  );

  const addReference = useCallback(() => {
    dispatch({ type: "ADD_REFERENCE" });
  }, []);

  const removeReference = useCallback((index: number) => {
    dispatch({ type: "REMOVE_REFERENCE", index });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
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
  };
}
