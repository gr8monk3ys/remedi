/**
 * Health Profile & Medication Cabinet Validation Schemas
 */

import { z } from "zod";

const MAX_ARRAY_LENGTH = 20;

/** Health profile upsert schema */
export const healthProfileSchema = z.object({
  categories: z
    .array(z.string().min(1).max(100))
    .max(MAX_ARRAY_LENGTH, { message: "Too many categories" })
    .default([]),
  goals: z
    .array(z.string().min(1).max(200))
    .max(MAX_ARRAY_LENGTH, { message: "Too many goals" })
    .default([]),
  allergies: z
    .array(z.string().min(1).max(200))
    .max(MAX_ARRAY_LENGTH, { message: "Too many allergies" })
    .default([]),
  conditions: z
    .array(z.string().min(1).max(200))
    .max(MAX_ARRAY_LENGTH, { message: "Too many conditions" })
    .default([]),
  dietaryPrefs: z
    .array(z.string().min(1).max(200))
    .max(MAX_ARRAY_LENGTH, { message: "Too many dietary preferences" })
    .default([]),
});

export type HealthProfileInput = z.infer<typeof healthProfileSchema>;

/** Medication cabinet item schema */
export const medicationSchema = z.object({
  name: z
    .string({ message: "Medication name is required" })
    .min(1, { message: "Medication name cannot be empty" })
    .max(200, { message: "Medication name is too long" })
    .trim(),
  type: z.enum(["pharmaceutical", "supplement", "natural_remedy"], {
    message: "Type must be pharmaceutical, supplement, or natural_remedy",
  }),
  dosage: z.string().max(100).optional().nullable(),
  frequency: z
    .enum(["daily", "twice_daily", "as_needed", "weekly"], {
      message: "Invalid frequency",
    })
    .optional()
    .nullable(),
  startDate: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), {
      message: "Invalid date format",
    })
    .optional()
    .nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type MedicationInput = z.infer<typeof medicationSchema>;

/** Medication update schema (partial) */
export const medicationUpdateSchema = medicationSchema.partial().extend({
  id: z.string().uuid({ message: "Invalid medication ID" }),
});

export type MedicationUpdateInput = z.infer<typeof medicationUpdateSchema>;
