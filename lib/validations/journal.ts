/**
 * Remedy Journal Validation Schemas
 */

import { z } from "zod";

/** Journal entry creation schema */
export const journalEntrySchema = z.object({
  remedyId: z.string().uuid({ message: "Invalid remedy ID" }),
  remedyName: z
    .string()
    .min(1, { message: "Remedy name is required" })
    .max(200),
  date: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date format" }),
  rating: z
    .number()
    .int()
    .min(1, { message: "Rating must be 1-5" })
    .max(5, { message: "Rating must be 1-5" }),
  symptoms: z.array(z.string().min(1).max(100)).max(20).default([]),
  sideEffects: z.array(z.string().min(1).max(100)).max(20).default([]),
  dosageTaken: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  mood: z.number().int().min(1).max(5).optional().nullable(),
  energyLevel: z.number().int().min(1).max(5).optional().nullable(),
  sleepQuality: z.number().int().min(1).max(5).optional().nullable(),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;

/** Journal entry update schema */
export const journalEntryUpdateSchema = journalEntrySchema.partial().extend({
  id: z.string().uuid({ message: "Invalid journal entry ID" }),
});

export type JournalEntryUpdateInput = z.infer<typeof journalEntryUpdateSchema>;

/** Journal query schema for filtering */
export const journalQuerySchema = z.object({
  remedyId: z.string().uuid().optional(),
  startDate: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), {
      message: "Invalid start date",
    })
    .optional(),
  endDate: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), {
      message: "Invalid end date",
    })
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type JournalQueryInput = z.infer<typeof journalQuerySchema>;
