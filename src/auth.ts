import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema/auth';

const PRODUCTION_AUTH_PROXY_URL = 'https://princess-glow-os.vercel.app/api/auth';

function getDeploymentBaseUrl(baseUrl: string) {
  if (process.env.VERCEL_ENV === 'preview') {
    const previewHost = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
    if (previewHost) return `https://${previewHost}`;
  }

  return baseUrl;
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })] : []),
    ...(process.env.PRINCESS_GOOGLE_CLIENT_ID && process.env.PRINCESS_GOOGLE_CLIENT_SECRET ? [Google({
      clientId: process.env.PRINCESS_GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.PRINCESS_GOOGLE_CLIENT_SECRET ?? '',
      redirectProxyUrl: process.env.VERCEL_ENV === 'preview' ? PRODUCTION_AUTH_PROXY_URL : undefined,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/gmail.readonly',
          ].join(' '),
        },
      },
    })] : []),
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
}));
