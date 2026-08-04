import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from 'next-auth/providers/google';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema/auth';

function ensureAuthEnv() {
  const missingVars: string[] = [];
  if (!process.env.AUTH_SECRET) missingVars.push('AUTH_SECRET');
  if (!process.env.DATABASE_URL) missingVars.push('DATABASE_URL');
  if (!process.env.PRINCESS_GOOGLE_CLIENT_ID) missingVars.push('PRINCESS_GOOGLE_CLIENT_ID');
  if (!process.env.PRINCESS_GOOGLE_CLIENT_SECRET) missingVars.push('PRINCESS_GOOGLE_CLIENT_SECRET');
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missingVars.join(', ')}. ` +
        'Set them before starting the application.',
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: (() => {
    ensureAuthEnv();
    return DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    });
  })(),
  providers: [
    Google({
      clientId: process.env.PRINCESS_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.PRINCESS_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/sign-in',
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
