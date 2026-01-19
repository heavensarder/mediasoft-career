'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

const JobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  departmentId: z.coerce.number(),
  typeId: z.coerce.number(),
  locationId: z.coerce.number(),
  expiryDate: z.string(),
  isDraft: z.boolean().optional(),
});

export async function createJob(prevState: any, formData: FormData) {
    // Validate fields using Zod
    // We need to reconstruct the object from formData manually because of the rich text/checkbox quirks
    
    // Note: React Hook Form usually handles this on client, but for server actions we can accept raw data 
    // OR we can pass the data directly if we use the client component to call this action.
    // For simplicity with the existing client form, let's assume we pass the data object directly.
    return { message: 'Use client-side submission for this rich form' };
}

// Actual action called from Client Component
export async function createJobAction(data: any) {
    const validatedFields = JobSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: "Validation Failed",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description, departmentId, typeId, locationId, expiryDate, isDraft } = validatedFields.data;

    try {
        await prisma.job.create({
            data: {
                title,
                description,
                departmentId,
                typeId,
                locationId,
                expiryDate: new Date(expiryDate),
                status: isDraft ? 'On Hold' : 'Active',
                isDraft: isDraft || false,
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return { error: "Database Error: Failed to create job." };
    }

    revalidatePath('/admin/dashboard/job-recruitment/job-list');
    revalidatePath('/'); // Update landing page
    redirect('/admin/dashboard/job-recruitment/job-list');
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

    const { title, description, departmentId, typeId, locationId, expiryDate, isDraft } = validatedFields.data;

    try {
        await prisma.job.update({
            where: { id },
            data: {
                title,
                description,
                departmentId,
                typeId,
                locationId,
                expiryDate: new Date(expiryDate),
                status: isDraft ? 'On Hold' : 'Active',
                isDraft: isDraft || false,
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return { error: "Database Error: Failed to update job." };
    }

    revalidatePath('/admin/dashboard/job-recruitment/job-list');
    revalidatePath(`/admin/dashboard/job-recruitment/edit-job/${id}`);
    revalidatePath('/'); 
    redirect('/admin/dashboard/job-recruitment/job-list');
}
