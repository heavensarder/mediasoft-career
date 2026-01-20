'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';

const prisma = new PrismaClient();

const JobSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    departmentId: z.coerce.number().optional().nullable().transform(val => val || null),
    typeId: z.coerce.number().optional().nullable().transform(val => val || null),
    locationId: z.coerce.number().optional().nullable().transform(val => val || null),
    expiryDate: z.string().optional().nullable(),
    status: z.string().optional(),
});

async function generateUniqueSlug(title: string, ignoreJobId?: number) {
    let slug = slugify(title, { lower: true, strict: true });
    let uniqueSlug = slug;
    let count = 1;

    while (true) {
        const existing = await prisma.job.findUnique({
            where: { slug: uniqueSlug } as any,
            select: { id: true }
        });

        // If no job has this slug, OR the job that has it is the one we are ignoring (updating), it's safe
        if (!existing || (ignoreJobId && existing.id === ignoreJobId)) {
            return uniqueSlug;
        }

        uniqueSlug = `${slug}-${count}`;
        count++;
    }
}

export async function createJobAction(data: any) {
    const validatedFields = JobSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: "Validation Failed",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description, departmentId, typeId, locationId, expiryDate, status } = validatedFields.data;

    try {
        const slug = await generateUniqueSlug(title);

        // If status is Inactive, clear expiry date. Otherwise parse if present.
        const finalExpiryDate = status === 'Inactive' ? null : (expiryDate ? new Date(expiryDate) : null);

        await prisma.job.create({
            data: {
                title,
                description,
                departmentId: departmentId as any,
                typeId: typeId as any,
                locationId: locationId as any,
                expiryDate: finalExpiryDate as any,
                status: status || 'Active',
                isDraft: status === 'Inactive',
                slug,
            } as any,
        });
    } catch (error) {
        console.error("Database Error:", error);
        return { error: "Database Error: Failed to create job." };
    }

    revalidatePath('/admin/dashboard/job-recruitment/job-list');
    revalidatePath('/'); // Update landing page
    return { success: true };
}

export async function deleteJobAction(id: number) {
    try {
        await prisma.job.delete({
            where: { id },
        });
        revalidatePath('/admin/dashboard/job-recruitment/job-list');
        return { success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { error: "Failed to delete job." };
    }
}

export async function updateJobAction(id: number, data: any) {
    const validatedFields = JobSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: "Validation Failed",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description, departmentId, typeId, locationId, expiryDate, status } = validatedFields.data;

    try {
        const slug = await generateUniqueSlug(title, id);

        // If status is Inactive, clear expiry date. Otherwise parse if present.
        const finalExpiryDate = status === 'Inactive' ? null : (expiryDate ? new Date(expiryDate) : null);

        await prisma.job.update({
            where: { id },
            data: {
                title,
                description,
                departmentId: departmentId as any,
                typeId: typeId as any,
                locationId: locationId as any,
                expiryDate: finalExpiryDate as any,
                status: status || 'Active',
                isDraft: status === 'Inactive',
                slug,
            } as any,
        });
    } catch (error) {
        console.error("Database Error:", error);
        return { error: "Database Error: Failed to update job." };
    }

    revalidatePath('/admin/dashboard/job-recruitment/job-list');

    revalidatePath(`/admin/dashboard/job-recruitment/edit-job/${id}`);
    revalidatePath('/');
    return { success: true };
}

export async function incrementJobViews(id: number) {
    try {
        await prisma.job.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
        revalidatePath('/admin/dashboard/job-recruitment/job-list');
        return { success: true };
    } catch (error) {
        console.error("Failed to increment views:", error);
        return { error: "Failed to increment views" };
    }
}
