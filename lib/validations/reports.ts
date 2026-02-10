/**
 * Remedy Report Validation Schemas
 */

import { z } from "zod";

/** Report generation request schema */
export const reportGenerateSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title is too long" }),
  queryType: z.enum(["condition", "drug_alternative", "custom"], {
    message: "Query type must be condition, drug_alternative, or custom",
  }),
  queryInput: z
    .string()
    .min(1, { message: "Query input is required" })
    .max(500, { message: "Query input is too long" })
    .trim(),
  includeCabinetInteractions: z.boolean().default(true),
  includeJournalData: z.boolean().default(false),
});

export type ReportGenerateInput = z.infer<typeof reportGenerateSchema>;
