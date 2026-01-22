'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

/**
 * Helper to verify the current user is a super admin
 */
async function isAuthorizedAdmin(): Promise<{ authorized: boolean; email?: string }> {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return { authorized: false };

    const admin = await prisma.admin.findUnique({ where: { email } });
    return { authorized: !!admin, email };
}

/**
 * Verify admin password for Settings page access
 */
export async function verifyAdminPassword(password: string) {
    try {
        const { authorized, email } = await isAuthorizedAdmin();
        if (!authorized || !email) {
            return { error: 'Unauthorized' };
        }

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) {
            return { error: 'Admin not found' };
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            return { error: 'Incorrect password' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error verifying password:', error);
        return { error: 'Verification failed' };
    }
}

/**
 * Get all super admins
 */
export async function getAdmins() {
    try {
        const { authorized } = await isAuthorizedAdmin();
        if (!authorized) {
            return { error: 'Unauthorized' };
        }

        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' }
        });

        return { success: true, admins };
    } catch (error) {
        console.error('Error fetching admins:', error);
        return { error: 'Failed to fetch admins' };
    }
}

/**
 * Create a new super admin
 */
export async function createAdmin(name: string, email: string, password: string, currentPassword: string) {
    try {
        const { authorized, email: adminEmail } = await isAuthorizedAdmin();
        if (!authorized || !adminEmail) {
            return { error: 'Unauthorized' };
        }

        // Verify current admin's password
        const currentAdmin = await prisma.admin.findUnique({
            where: { email: adminEmail }
        });

        if (!currentAdmin) {
            return { error: 'Current admin not found' };
        }

        const isValidPassword = await bcrypt.compare(currentPassword, currentAdmin.password);
        if (!isValidPassword) {
            return { error: 'Current password is incorrect' };
        }

        // Check if email already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            return { error: 'An admin with this email already exists' };
        }

        // Validate password length
        if (password.length < 8) {
            return { error: 'Password must be at least 8 characters' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        revalidatePath('/admin/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Error creating admin:', error);
        return { error: 'Failed to create admin' };
    }
}

/**
 * Delete a super admin (cannot delete self or last admin)
 */
export async function deleteAdmin(adminId: number, currentPassword: string) {
    try {
        const { authorized, email } = await isAuthorizedAdmin();
        if (!authorized || !email) {
            return { error: 'Unauthorized' };
        }

        // Get current user's admin record and verify password
        const currentAdmin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!currentAdmin) {
            return { error: 'Current admin not found' };
        }

        const isValidPassword = await bcrypt.compare(currentPassword, currentAdmin.password);
        if (!isValidPassword) {
            return { error: 'Current password is incorrect' };
        }

        // Check if this is the last admin
        const adminCount = await prisma.admin.count();
        if (adminCount <= 1) {
            return { error: 'Cannot delete the last super admin' };
        }

        if (currentAdmin.id === adminId) {
            return { error: 'Cannot delete your own account' };
        }

        // Delete admin
        await prisma.admin.delete({
            where: { id: adminId }
        });

        revalidatePath('/admin/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Error deleting admin:', error);
        return { error: 'Failed to delete admin' };
    }
}

/**
 * Update current admin's email and/or password
 */
export async function updateAdminCredentials(
    currentPassword: string,
    newEmail?: string,
    newPassword?: string
) {
    try {
        const { authorized, email } = await isAuthorizedAdmin();
        if (!authorized || !email) {
            return { error: 'Unauthorized' };
        }

        // Get current admin
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            return { error: 'Admin not found' };
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
        if (!isValidPassword) {
            return { error: 'Current password is incorrect' };
        }

        // Prepare update data
        const updateData: { email?: string; password?: string } = {};

        if (newEmail && newEmail !== admin.email) {
            // Check if new email is already taken
            const existingAdmin = await prisma.admin.findUnique({
                where: { email: newEmail }
            });
            if (existingAdmin) {
                return { error: 'This email is already in use' };
            }
            updateData.email = newEmail;
        }

        if (newPassword) {
            if (newPassword.length < 8) {
                return { error: 'New password must be at least 8 characters' };
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return { error: 'No changes to update' };
        }

        // Update admin
        await prisma.admin.update({
            where: { id: admin.id },
            data: updateData
        });

        revalidatePath('/admin/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating credentials:', error);
        return { error: 'Failed to update credentials' };
    }
}

