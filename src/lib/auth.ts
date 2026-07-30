import NextAuth from 'next-auth';

// Auth.js v5 configuration — providers and callbacks will be configured here
// in a future session once DATABASE_URL and AUTH_SECRET are available.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth: session }) {
      // Public routes are accessible without authentication
      return !!session;
    },
  },
});
