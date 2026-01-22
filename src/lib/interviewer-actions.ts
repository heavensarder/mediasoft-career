'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { isMainAdmin } from './interview-auth';

/**
 * Get all interview admins
 */
export async function getInterviewers() {
    const isAdmin = await isMainAdmin();
    if (!isAdmin) {
        return { error: 'Unauthorized', interviewers: [] };
    }

    try {
        const interviewers = await prisma.interviewAdmin.findMany({
            include: {
                markingPermissions: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return { interviewers };
    } catch (error) {
        console.error('Error fetching interviewers:', error);
        return { error: 'Failed to fetch interviewers', interviewers: [] };
    }
}

/**
 * Create a new interviewer
 */
export async function createInterviewer(data: {
    name: string;
    email: string;
    password: string;
    permissions: {
        writtenExam: boolean;
        technicalViva: boolean;
        project: boolean;
    };
}) {
    const isAdmin = await isMainAdmin();
    if (!isAdmin) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check if email already exists
        const existing = await prisma.interviewAdmin.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            return { error: 'An interviewer with this email already exists' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create interviewer with permissions
        const interviewer = await prisma.interviewAdmin.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: 'interview_admin',
                markingPermissions: {
                    create: data.permissions,
                },
            },
        });

        revalidatePath('/admin/dashboard/interview-panel/interviewers');
        return { success: true, id: interviewer.id };
    } catch (error) {
        console.error('Error creating interviewer:', error);
        return { error: 'Failed to create interviewer' };
    }
}

/**
 * Update an interviewer
 */
export async function updateInterviewer(
    id: number,
    data: {
        name?: string;
        email?: string;
        password?: string;
        permissions?: {
            writtenExam: boolean;
            technicalViva: boolean;
            project: boolean;
        };
    }
) {
    const isAdmin = await isMainAdmin();
    if (!isAdmin) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check if email is being changed and if it already exists
        if (data.email) {
            const existing = await prisma.interviewAdmin.findFirst({
                where: {
                    email: data.email,
                    NOT: { id }
                },
            });

            if (existing) {
                return { error: 'An interviewer with this email already exists' };
            }
        }

        // Build update data
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        // Update interviewer
        await prisma.interviewAdmin.update({
            where: { id },
            data: updateData,
        });

        // Update permissions if provided
        if (data.permissions) {
            await prisma.markingPermission.upsert({
                where: { interviewAdminId: id },
                update: data.permissions,
                create: {
                    interviewAdminId: id,
                    ...data.permissions,
                },
            });
        }

        revalidatePath('/admin/dashboard/interview-panel/interviewers');
        return { success: true };
    } catch (error) {
        console.error('Error updating interviewer:', error);
        return { error: 'Failed to update interviewer' };
    }
}

/**
 * Delete an interviewer
 */
export async function deleteInterviewer(id: number) {
    const isAdmin = await isMainAdmin();
    if (!isAdmin) {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.interviewAdmin.delete({
            where: { id },
        });

        revalidatePath('/admin/dashboard/interview-panel/interviewers');
        return { success: true };
    } catch (error) {
        console.error('Error deleting interviewer:', error);
        return { error: 'Failed to delete interviewer' };
    }
}

/**
 * Update marking permissions for an interviewer
 */
export async function updateMarkingPermissions(
    interviewerId: number,
    permissions: {
        writtenExam: boolean;
        technicalViva: boolean;
        project: boolean;
    }
) {
    const isAdmin = await isMainAdmin();
    if (!isAdmin) {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.markingPermission.upsert({
            where: { interviewAdminId: interviewerId },
            update: permissions,
            create: {
                interviewAdminId: interviewerId,
                ...permissions,
            },
        });

        revalidatePath('/admin/dashboard/interview-panel/interviewers');
        return { success: true };
    } catch (error) {
        console.error('Error updating permissions:', error);
        return { error: 'Failed to update permissions' };
    }
}
