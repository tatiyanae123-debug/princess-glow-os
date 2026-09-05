import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from 'next-auth/providers/google';
import { and, eq } from 'drizzle-orm';
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

async function persistGoogleAccount(account: {
  provider?: string;
  providerAccountId?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
} | null | undefined) {
  if (!account || account.provider !== 'google' || !account.providerAccountId) return;

  await db
    .update(accounts)
    .set({
      access_token: account.access_token ?? undefined,
      refresh_token: account.refresh_token ?? undefined,
      expires_at: account.expires_at ?? undefined,
      token_type: account.token_type ?? undefined,
      scope: account.scope ?? undefined,
      id_token: account.id_token ?? undefined,
    })
    .where(
      and(
        eq(accounts.provider, 'google'),
        eq(accounts.providerAccountId, account.providerAccountId),
      ),
    );
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
    Google({
      clientId: process.env.PRINCESS_GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.PRINCESS_GOOGLE_CLIENT_SECRET ?? '',
      redirectProxyUrl: process.env.VERCEL_ENV === 'preview' ? PRODUCTION_AUTH_PROXY_URL : undefined,
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
    async signIn({ account }) {
      await persistGoogleAccount(account);
      return true;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isGlowDataApi =
        nextUrl.pathname === '/api/contacts' ||
        nextUrl.pathname === '/api/places' ||
        nextUrl.pathname === '/api/personal-context';
      if (isGlowDataApi) return true;

      const isLoggedIn = !!session?.user;
      const isOnSignIn = nextUrl.pathname === '/sign-in';
      const isContactConnect = isOnSignIn && nextUrl.searchParams.get('connect') === 'contacts';
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth');

      if (isLoggedIn && isOnSignIn && !isContactConnect) {
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
  events: {
    async signIn({ account }) {
      await persistGoogleAccount(account);
    },
  },
}));
