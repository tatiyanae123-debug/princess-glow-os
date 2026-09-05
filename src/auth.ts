import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from 'next-auth/providers/google';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema/auth';

function getDeploymentBaseUrl(baseUrl: string) {
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return baseUrl;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
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
      authorization: {
        params: {
          access_type: 'offline',
          include_granted_scopes: 'true',
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/contacts.readonly',
          ].join(' '),
        },
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      // These read-only JSON routes handle their own auth state so client
      // surfaces receive JSON rather than a sign-in HTML redirect.
      const isGlowDataApi = nextUrl.pathname === '/api/contacts' || nextUrl.pathname === '/api/places';
      if (isGlowDataApi) return true;

      // Visual-QA preview routes use non-personal demo data and must open directly.
      const isPreviewWorld = process.env.VERCEL_ENV === 'preview' && (nextUrl.pathname === '/today' || nextUrl.pathname === '/home' || nextUrl.pathname === '/dashboard');
      if (isPreviewWorld) return true;

      const isLoggedIn = !!session?.user;
      const isOnSignIn = nextUrl.pathname === '/sign-in';
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
      if (isLoggedIn && isOnSignIn) {
        return Response.redirect(new URL('/home', nextUrl));
      }
      if (!isLoggedIn && !isOnSignIn && !isApiAuth) {
        return Response.redirect(new URL('/sign-in', nextUrl));
      }
      return true;
    },
    redirect({ url, baseUrl }) {
      const deploymentBaseUrl = getDeploymentBaseUrl(baseUrl);

      if (url.startsWith('/')) {
        return new URL(url, deploymentBaseUrl).toString();
      }

      try {
        const target = new URL(url);
        const productionOrigin = new URL(baseUrl).origin;
        const deploymentOrigin = new URL(deploymentBaseUrl).origin;

        if (target.origin === productionOrigin || target.origin === deploymentOrigin) {
          return new URL(`${target.pathname}${target.search}${target.hash}`, deploymentBaseUrl).toString();
        }
      } catch {
        return deploymentBaseUrl;
      }

      return deploymentBaseUrl;
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
