'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { logActivity } from './activity-log-actions';

// --- System Settings (White Label) ---

async function saveFile(file: File, folder: string): Promise<string> {
  if (!file || file.size === 0) return '';

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // Sanitize filename
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
  const extension = originalName.split('.').pop() || 'png';
  const filename = `logo-${uniqueSuffix}.${extension}`;

  // Ensure directory exists
  const uploadDir = join(process.cwd(), 'public', folder);
  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
  } catch (e) {
    console.error("File save error:", e);
    throw new Error("Failed to save file");
  }

  return `/${folder}/${filename}`;
}

export async function updateBrandingSettings(prevState: any, formData: FormData) {
  try {
    const file = formData.get('logo') as File;
    const faviconFile = formData.get('favicon') as File;
    const redirectUrl = formData.get('logo_redirect_url') as string;
    const siteBaseUrl = formData.get('site_base_url') as string;

    let logoPath = null;
    let faviconPath = null;

    // Handle Logo Upload
    if (file && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return { error: "Logo must be an image." };
      }
      logoPath = await saveFile(file, 'branding');

      await prisma.systemSettings.upsert({
        where: { key: 'company_logo' },
        update: { value: logoPath },
        create: { key: 'company_logo', value: logoPath }
      });
    }

    // Handle Favicon Upload
    if (faviconFile && faviconFile.size > 0) {
      // Favicon can be .ico, .png, .svg etc.
      faviconPath = await saveFile(faviconFile, 'branding');
      await prisma.systemSettings.upsert({
        where: { key: 'site_favicon' },
        update: { value: faviconPath },
        create: { key: 'site_favicon', value: faviconPath }
      });
    }

    // Handle Redirect URL
    if (redirectUrl !== null) {
      await prisma.systemSettings.upsert({
        where: { key: 'logo_redirect_url' },
        update: { value: redirectUrl },
        create: { key: 'logo_redirect_url', value: redirectUrl }
      });
    }

    // Handle Site Base URL
    if (siteBaseUrl !== null) {
      await prisma.systemSettings.upsert({
        where: { key: 'site_base_url' },
        update: { value: siteBaseUrl },
        create: { key: 'site_base_url', value: siteBaseUrl }
      });
    }

    revalidatePath('/admin');
    revalidatePath('/auth/login');
    revalidatePath('/'); // Refresh home for favicon/SEO

    // Log activity
    await logActivity({
      action: 'UPDATE_BRANDING',
      entityType: 'Settings',
      entityName: 'Branding Settings',
      details: JSON.stringify({ logoUpdated: !!logoPath, faviconUpdated: !!faviconPath }),
    });

    return { success: true, logoPath, faviconPath, redirectUrl, siteBaseUrl };

  } catch (error) {
    console.error("Update Branding Error:", error);
    return { error: "Failed to update branding settings." };
  }
}

export async function getBrandingSettings() {
  try {
    const logoSrc = await prisma.systemSettings.findUnique({ where: { key: 'company_logo' } });
    const redirectUrl = await prisma.systemSettings.findUnique({ where: { key: 'logo_redirect_url' } });
    const faviconSrc = await prisma.systemSettings.findUnique({ where: { key: 'site_favicon' } });
    const baseSiteUrl = await prisma.systemSettings.findUnique({ where: { key: 'site_base_url' } });

    const defaultBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
      logoPath: logoSrc?.value || null,
      logoRedirectUrl: redirectUrl?.value || '',
      faviconPath: faviconSrc?.value || null,
      siteBaseUrl: baseSiteUrl?.value || defaultBaseUrl
    };
  } catch (error) {
    console.error("Error fetching branding settings:", error);
    return { logoPath: null, logoRedirectUrl: '', faviconPath: null, siteBaseUrl: '' };
  }
}

export async function getSystemSetting(key: string) {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key }
    });
    return setting?.value || null;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }
}

// --- Departments ---

export async function createDepartment(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    await prisma.department.create({ data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error: any) { // Type as any to safely check code
    if (error.code === 'P2002') return { error: "Department already exists" };
    return { error: "Failed to create department" };
  }
}

export async function updateDepartment(id: number, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    await prisma.department.update({ where: { id }, data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Department name already taken" };
    return { error: "Failed to update department" };
  }
}

export async function deleteDepartment(id: number) {
  try {
    await prisma.department.delete({ where: { id } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete department" };
  }
}

// --- Job Types ---

export async function createJobType(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    await prisma.jobType.create({ data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Job Type already exists" };
    return { error: "Failed to create Job Type" };
  }
}

export async function updateJobType(id: number, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    await prisma.jobType.update({ where: { id }, data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Job Type name already taken" };
    return { error: "Failed to update Job Type" };
  }
}

export async function deleteJobType(id: number) {
  try {
    await prisma.jobType.delete({ where: { id } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete Job Type" };
  }
}

// --- Locations ---

export async function createLocation(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    await prisma.location.create({ data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Location already exists" };
    return { error: "Failed to create Location" };
  }
}

export async function updateLocation(id: number, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    await prisma.location.update({ where: { id }, data: { name } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Location name already taken" };
    return { error: "Failed to update Location" };
  }
}

export async function deleteLocation(id: number) {
  try {
    await prisma.location.delete({ where: { id } });
    revalidatePath('/admin/dashboard/job-recruitment/settings');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete Location" };
  }
}
