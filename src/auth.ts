import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from 'next-auth/providers/google';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema/auth';

// Warn (do not throw) so Auth.js can return a proper /api/auth/error response
// rather than crashing the module with an unhandled exception.
if (!process.env.AUTH_SECRET) {
  console.warn('[auth] WARNING: AUTH_SECRET is not set. Auth.js will reject all sessions.');
}
if (!process.env.PRINCESS_GOOGLE_CLIENT_ID) {
  console.warn('[auth] WARNING: PRINCESS_GOOGLE_CLIENT_ID is not set. Google sign-in will fail.');
}
if (!process.env.PRINCESS_GOOGLE_CLIENT_SECRET) {
  console.warn('[auth] WARNING: PRINCESS_GOOGLE_CLIENT_SECRET is not set. Google sign-in will fail.');
}
if (!process.env.DATABASE_URL) {
  console.warn('[auth] WARNING: DATABASE_URL is not set. Database operations will fail.');
}

// Safe diagnostic – never prints the actual values of secrets.
console.log('[auth] config check:', {
  AUTH_SECRET: !!process.env.AUTH_SECRET,
  PRINCESS_GOOGLE_CLIENT_ID: !!process.env.PRINCESS_GOOGLE_CLIENT_ID,
  PRINCESS_GOOGLE_CLIENT_SECRET: !!process.env.PRINCESS_GOOGLE_CLIENT_SECRET,
  DATABASE_URL: !!process.env.DATABASE_URL,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.PRINCESS_GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.PRINCESS_GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  logger: {
    error(error) {
      // Log the error type and message only – never log tokens, cookies, or credentials.
      console.error('[auth] error:', error instanceof Error ? error.message : String(error));
    },
    warn(code) {
      console.warn('[auth] warning:', code);
    },
    debug(message) {
      if (process.env.AUTH_DEBUG === 'true') {
        // Omit metadata entirely – it may contain tokens or session data.
        console.debug('[auth] debug:', message);
      }
    },
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnSignIn = nextUrl.pathname === '/sign-in';
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
      if (isLoggedIn && isOnSignIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      if (!isLoggedIn && !isOnSignIn && !isApiAuth) {
        return Response.redirect(new URL('/sign-in', nextUrl));
      }
      return true;
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
