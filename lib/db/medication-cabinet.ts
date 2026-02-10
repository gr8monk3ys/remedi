/**
 * Medication Cabinet Database Operations
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";
import { prisma } from "./client";
import { checkMultipleInteractions } from "./interactions";

export interface MedicationInput {
  name: string;
  type: string;
  dosage?: string | null;
  frequency?: string | null;
  startDate?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

/**
 * Get all medications for a user
 */
export async function getMedications(userId: string, activeOnly = false) {
  return prisma.medicationCabinet.findMany({
    where: {
      userId,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

/**
 * Get a single medication by ID
 */
export async function getMedicationById(id: string) {
  return prisma.medicationCabinet.findUnique({ where: { id } });
}

/**
 * Add a medication to the cabinet
 */
export async function addMedication(userId: string, data: MedicationInput) {
  return prisma.medicationCabinet.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      dosage: data.dosage ?? null,
      frequency: data.frequency ?? null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      notes: data.notes ?? null,
      isActive: data.isActive ?? true,
    },
  });
}

/**
 * Update a medication
 */
export async function updateMedication(
  id: string,
  data: Partial<MedicationInput>,
) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.dosage !== undefined) updateData.dosage = data.dosage;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.startDate !== undefined)
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.medicationCabinet.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Remove a medication from the cabinet
 */
export async function removeMedication(id: string) {
  return prisma.medicationCabinet.delete({ where: { id } });
}

/**
 * Count medications for a user (for plan limit checking)
 */
export async function countMedications(userId: string): Promise<number> {
  return prisma.medicationCabinet.count({ where: { userId } });
}

/**
 * Check interactions between all active medications in the cabinet.
 * Reuses the existing checkMultipleInteractions from interactions.ts.
 */
export async function checkCabinetInteractions(userId: string) {
  const medications = await prisma.medicationCabinet.findMany({
    where: { userId, isActive: true },
    select: { name: true },
  });

  const names = medications.map((m) => m.name);
  if (names.length < 2) return [];

  return checkMultipleInteractions(names);
}
