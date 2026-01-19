/**
 * NextAuth.js Type Extensions
 *
 * Extends default NextAuth types to include custom fields.
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extends the built-in session user
   */
  interface User {
    id: string;
    role?: string;
  }

  /**
   * Extends the built-in session
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT token
   */
  interface JWT {
    id: string;
    role?: string;
  }
}
