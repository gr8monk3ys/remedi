/**
 * Contribution Form Types and Constants
 */

export const CATEGORIES = [
  "Herbs & Botanicals",
  "Vitamins & Minerals",
  "Amino Acids",
  "Probiotics",
  "Essential Oils",
  "Homeopathic",
  "Traditional Medicine",
  "Other",
] as const;

export interface Reference {
  title: string;
  url?: string;
}

export interface ContributionFormProps {
  onSuccess?: () => void;
}

export interface FormState {
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

export type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof FormState;
      value: FormState[keyof FormState];
    }
  | { type: "SET_INGREDIENT"; index: number; value: string }
  | { type: "ADD_INGREDIENT" }
  | { type: "REMOVE_INGREDIENT"; index: number }
  | { type: "SET_BENEFIT"; index: number; value: string }
  | { type: "ADD_BENEFIT" }
  | { type: "REMOVE_BENEFIT"; index: number }
  | {
      type: "SET_REFERENCE";
      index: number;
      field: keyof Reference;
      value: string;
    }
  | { type: "ADD_REFERENCE" }
  | { type: "REMOVE_REFERENCE"; index: number }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "RESET" };

export const initialFormState: FormState = {
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
