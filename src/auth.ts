import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type UserWithRole = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'interview_admin';
};

async function getUser(email: string): Promise<UserWithRole | null> {
  try {
    // Check main Admin first
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (admin) {
      return { ...admin, role: 'admin' };
    }

    // Check Interview Admin
    const interviewAdmin = await prisma.interviewAdmin.findUnique({
      where: { email },
    });

    if (interviewAdmin) {
      return { ...interviewAdmin, role: 'interview_admin' };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

// Log login activity (called after successful login)
async function logLoginActivity(user: UserWithRole) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userType: user.role,
        userName: user.name,
        userEmail: user.email,
        action: 'LOGIN',
        entityType: 'Auth',
        entityName: 'User Login',
      },
    });
  } catch (error) {
    console.error('Failed to log login activity:', error);
    // Don't throw - login should still succeed even if logging fails
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            // Log login activity
            await logLoginActivity(user);

            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});

