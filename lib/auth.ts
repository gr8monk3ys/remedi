/**
 * NextAuth.js Configuration
 *
 * Provides authentication using NextAuth.js v5 with Prisma adapter.
 * Supports multiple OAuth providers and email authentication.
 *
 * @see https://next-auth.js.org/
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@/lib/db';

/**
 * NextAuth configuration
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    /**
     * Add user role and ID to session
     */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || 'user';
      }
      return session;
    },
    /**
     * Add user role to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      return token;
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // NextAuth.js v5 uses AUTH_SECRET (falls back to NEXTAUTH_SECRET for compatibility)
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

/**
 * NextAuth handlers and auth helper
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Check if user has specific role
 */
export async function checkUserRole(allowedRoles: string[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role);
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return checkUserRole(['admin']);
}

/**
 * Check if user is moderator or admin
 */
export async function isModerator(): Promise<boolean> {
  return checkUserRole(['moderator', 'admin']);
}
