import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminDashboard = nextUrl.pathname.startsWith('/admin/dashboard');
      if (isAdminDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === '/admin/login') {
             return Response.redirect(new URL('/admin/dashboard', nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
        if (token.sub && session.user) {
            session.user.id = token.sub;
        }
        return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id?.toString(); // Ensure ID is string for JWT
        }
        return token;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
