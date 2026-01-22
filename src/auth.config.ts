import type { NextAuthConfig } from 'next-auth';

// Extend the built-in session types
declare module 'next-auth' {
  interface User {
    role?: 'admin' | 'interview_admin';
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'interview_admin';
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'admin' | 'interview_admin';
  }
}

// Routes accessible by Interview Admin
const INTERVIEW_ADMIN_ALLOWED_PATHS = [
  '/admin/dashboard/interview-panel',
];

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminDashboard = nextUrl.pathname.startsWith('/admin/dashboard');
      const userRole = (auth?.user as any)?.role || 'admin';

      if (isAdminDashboard) {
        if (!isLoggedIn) return false;

        // Interview Admin can only access specific paths
        if (userRole === 'interview_admin') {
          const isAllowedPath = INTERVIEW_ADMIN_ALLOWED_PATHS.some(
            path => nextUrl.pathname.startsWith(path)
          );
          if (!isAllowedPath) {
            // Redirect to interview panel if trying to access other areas
            return Response.redirect(new URL('/admin/dashboard/interview-panel', nextUrl));
          }
        }

        return true;
      } else if (isLoggedIn && nextUrl.pathname === '/admin/login') {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'interview_admin') {
          return Response.redirect(new URL('/admin/dashboard/interview-panel', nextUrl));
        }
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id?.toString();
        token.role = (user as any).role || 'admin';
      }
      return token;
    }
  },
  providers: [],
} satisfies NextAuthConfig;

