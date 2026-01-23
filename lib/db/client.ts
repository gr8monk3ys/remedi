/**
 * Prisma Client Singleton
 *
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting database connection limit due to hot reloading.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Disconnect Prisma client
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
