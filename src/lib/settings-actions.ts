'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const prisma = new PrismaClient();

const SettingSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// --- Departments ---
export async function createDepartment(formData: FormData) {
  const name = formData.get('name') as string;
  const validation = SettingSchema.safeParse({ name });

  if (!validation.success) {
    return { error: "Invalid name" };
  }

  try {
    await prisma.department.create({ data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to create department" };
  }
}

export async function deleteDepartment(id: number) {
  try {
    await prisma.department.delete({ where: { id } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete department. It might be in use." };
  }
}

// --- Job Types ---
export async function createJobType(formData: FormData) {
  const name = formData.get('name') as string;
  const validation = SettingSchema.safeParse({ name });

  if (!validation.success) {
    return { error: "Invalid name" };
  }

  try {
    await prisma.jobType.create({ data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to create job type" };
  }
}

export async function deleteJobType(id: number) {
  try {
    await prisma.jobType.delete({ where: { id } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete job type." };
  }
}

// --- Locations ---
export async function createLocation(formData: FormData) {
  const name = formData.get('name') as string;
  const validation = SettingSchema.safeParse({ name });

  if (!validation.success) {
    return { error: "Invalid name" };
  }

  try {
    await prisma.location.create({ data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to create location" };
  }
}

export async function deleteLocation(id: number) {
  try {
    await prisma.location.delete({ where: { id } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete location." };
  }
}
