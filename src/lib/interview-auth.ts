'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export type UserRole = 'admin' | 'interview_admin';

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

/**
 * Get current user session with role information
 * Uses the role from JWT session - no extra DB query needed
 */
export async function getSessionUser(): Promise<SessionUser | null> {
    const session = await auth();

    if (!session?.user?.email) return null;

    // Get role from session (set during JWT callback)
    const sessionRole = (session.user as any).role;

    // Return session user with role from JWT
    return {
        id: (session.user as any).id || '',
        name: session.user.name || '',
        email: session.user.email,
        role: sessionRole || 'admin'
    };
}

/**
 * Check if user is main admin with full access
 */
export async function isMainAdmin(): Promise<boolean> {
    const user = await getSessionUser();
    return user?.role === 'admin';
}

/**
 * Check if user can access Interview Panel (both admin types can)
 */
export async function canAccessInterviewPanel(): Promise<boolean> {
    const user = await getSessionUser();
    return user !== null;
}

/**
 * Get marking permissions for interview admin
 */
export async function getMarkingPermissions(userId: string): Promise<{
    writtenExam: boolean;
    technicalViva: boolean;
    project: boolean;
} | null> {
    const user = await getSessionUser();

    // Main admin has all permissions
    if (user?.role === 'admin') {
        return {
            writtenExam: true,
            technicalViva: true,
            project: true
        };
    }

    // Get interview admin's specific permissions
    const permissions = await prisma.markingPermission.findUnique({
        where: { interviewAdminId: parseInt(userId) }
    });

    if (!permissions) {
        return {
            writtenExam: false,
            technicalViva: false,
            project: false
        };
    }

    return {
        writtenExam: permissions.writtenExam,
        technicalViva: permissions.technicalViva,
        project: permissions.project
    };
}

/**
 * Check if user can mark a specific section
 */
export async function canMarkSection(section: 'writtenExam' | 'technicalViva' | 'project'): Promise<boolean> {
    const user = await getSessionUser();
    if (!user) return false;

    // Main admin can mark everything
    if (user.role === 'admin') return true;

    const permissions = await getMarkingPermissions(user.id);
    return permissions?.[section] ?? false;
}

/**
 * Check if user can manage interviewers (only main admin)
 */
export async function canManageInterviewers(): Promise<boolean> {
    return isMainAdmin();
}
