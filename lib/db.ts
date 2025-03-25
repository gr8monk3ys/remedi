/**
 * Database Module (Re-export)
 *
 * This file re-exports from the modularized db/ directory.
 * All imports like `import { prisma } from '@/lib/db'` continue to work.
 *
 * For new code, you can also import directly from submodules:
 * - `import { prisma } from '@/lib/db/client'`
 * - `import { searchPharmaceuticals } from '@/lib/db/pharmaceuticals'`
 * - etc.
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";

export * from "./db/index";
