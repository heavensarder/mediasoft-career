'use server';

import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

const ApplicationSchema = z.object({
    jobId: z.coerce.number(),
    fullName: z.string().min(2, "Name is required"),
    nid: z.string().min(1, "NID is required"),
    dob: z.string().min(1, "Date of Birth is required"),
    gender: z.string().min(1, "Gender is required"),
    mobile: z.string().min(1, "Mobile number is required"),
    email: z.string().email("Invalid email address"),
    experience: z.string().min(1, "Experience is required"),
    currentSalary: z.string().optional(),
    expectedSalary: z.string().optional(),
    education: z.string().min(1, "Education is required"),
    source: z.string().min(1, "Source is required"),
    objective: z.string().min(1, "Career Objective is required"),
    achievements: z.string().optional(),
    message: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    portfolio: z.string().optional(),
});

async function saveFile(file: File, folder: string): Promise<string> {
    if (!file || file.size === 0) return '';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.name.split('.').pop() || 'bin';
    const filename = `${uniqueSuffix}.${extension}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', folder);
    try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(join(uploadDir, filename), buffer);
    } catch (e) {
        console.error("File save error:", e);
        return '';
    }

    return `/${folder}/${filename}`;
}

export async function submitApplication(prevState: any, formData: FormData) {
    const rawData = {
        jobId: formData.get('jobId'),
        fullName: formData.get('fullName'),
        nid: formData.get('nid'),
        dob: formData.get('dob'),
        gender: formData.get('gender'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        experience: formData.get('experience'),
        currentSalary: formData.get('currentSalary'),
        expectedSalary: formData.get('expectedSalary'),
        education: formData.get('education'),
        source: formData.get('source'),
        objective: formData.get('objective'),
        achievements: formData.get('achievements'),
        message: formData.get('message'),
        linkedin: formData.get('linkedin'),
        facebook: formData.get('facebook'),
        portfolio: formData.get('portfolio'),
    };

    const validatedFields = ApplicationSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: "Validation Failed",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    // File Uploads
    const photoFile = formData.get('photo') as File;
    const resumeFile = formData.get('resume') as File;

    let photoPath = '';
    let resumePath = '';

    try {
        if (photoFile && photoFile.size > 0) {
            photoPath = await saveFile(photoFile, 'uploads');
        }
        if (resumeFile && resumeFile.size > 0) {
            resumePath = await saveFile(resumeFile, 'uploads');
        }
    } catch (e) {
        console.error("File upload failed", e);
        return { error: "Failed to upload files" };
    }

    try {
        await prisma.application.create({
            data: {
                jobId: data.jobId,
                fullName: data.fullName,
                nid: data.nid,
                dob: new Date(data.dob),
                gender: data.gender,
                mobile: data.mobile,
                email: data.email,
                experience: data.experience,
                currentSalary: data.currentSalary || null,
                expectedSalary: data.expectedSalary || null,
                education: data.education,
                source: data.source,
                objective: data.objective,
                achievements: data.achievements || null,
                message: data.message || null,
                linkedin: data.linkedin || null,
                facebook: data.facebook || null,
                portfolio: data.portfolio || null,
                photo: photoPath || null,
                resume: resumePath || null,
                status: 'New',
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return { error: "Database Error: Failed to submit application." };
    }

    revalidatePath('/admin/dashboard/job-recruitment/applications');
    return { success: true };
}

export async function updateApplicationStatus(applicationId: number, status: string) {
    try {
        await prisma.application.update({
            where: { id: applicationId },
            data: { status },
        });

        revalidatePath('/admin/dashboard/job-recruitment/applications');
        revalidatePath(`/admin/dashboard/job-recruitment/applications/${applicationId}`);
        revalidatePath('/admin/dashboard/job-recruitment/overview');

        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { error: "Failed to update status" };
    }
}

export async function markAsViewed(applicationId: number) {
    try {
        await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'Viewed' }
        });
        revalidatePath('/admin/dashboard/job-recruitment/applications');
        revalidatePath('/admin/dashboard/job-recruitment/overview');
        revalidatePath(`/admin/dashboard/job-recruitment/applications/${applicationId}`);
        return { success: true };
    } catch (error) {
        console.error("Error marking application as viewed:", error);
        return { error: "Failed to update status" };
    }
}

export async function deleteApplication(applicationId: number) {
    try {
        await prisma.application.delete({
            where: { id: applicationId }
        });
        revalidatePath('/admin/dashboard/job-recruitment/applications');
        revalidatePath('/admin/dashboard/job-recruitment/overview');
        return { success: true };
    } catch (error) {
        console.error("Error deleting application:", error);
        return { error: "Failed to delete application" };
    }
}

export async function getApplications(
    query: string,
    status: string,
    jobId: string,
    page: number = 1,
    limit: number = 10,
    gender?: string
) {
    const where: Prisma.ApplicationWhereInput = {};

    if (status) {
        where.status = status;
    }

    if (jobId && !isNaN(parseInt(jobId))) {
        where.jobId = parseInt(jobId);
    }

    if (gender && gender !== 'all') {
        where.gender = gender;
    }

    if (query) {
        where.OR = [
            { fullName: { contains: query } },
            { email: { contains: query } },
            { mobile: { contains: query } },
            { nid: { contains: query } },
        ];
    }

    const skip = (page - 1) * limit;

    const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({
            where,
            include: {
                job: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.application.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return { applications, totalCount, totalPages };
}

export async function getNewApplicationCount() {
    try {
        const count = await prisma.application.count({
            where: { status: 'New' }
        });
        return count;
    } catch (error) {
        console.error("Error fetching new application count:", error);
        return 0;
    }
}
