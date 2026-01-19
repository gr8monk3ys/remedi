/**
 * NextAuth.js API Route Handler
 *
 * Handles all authentication routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/*
 * - /api/auth/session
 * - etc.
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
