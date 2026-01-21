'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import nodemailer from "nodemailer";
import { google } from "googleapis";
import { deleteFile } from './file-actions';

const REDIRECT_URI = "https://developers.google.com/oauthplayground";

async function saveFile(file: File, folder: string): Promise<string> {
    if (!file || file.size === 0) return '';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const extension = originalName.split('.').pop() || 'bin';
    const filename = `${uniqueSuffix}.${extension}`;

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

export async function submitApplication(prevState: any, formData: FormData) {
    try {
        // 1. Fetch Active Job Settings from DB
        const activeFields = await prisma.formField.findMany({
            where: { isActive: true },
        });

        const fieldErrors: Record<string, string[]> = {};
        const dbData: any = {
            jobId: Number(formData.get('jobId')),
            status: 'New',
            fullName: '',
            nid: '',
            dob: new Date(),
            gender: '',
            mobile: '',
            email: '',
            experience: '',
            education: '',
            source: '',
            objective: '',
            dynamicData: {}
        };

        // 2. Validate and Map Fields
        for (const field of activeFields) {
            const rawValue = formData.get(field.name);

            // Handle Files vs Text
            if (field.type === 'file') {
                const file = rawValue as File;
                if (field.required && (!file || file.size === 0)) {
                    fieldErrors[field.name] = [`${field.label} is required`];
                }
                // Uploads handled after validation success
                continue;
            }

            const value = rawValue?.toString().trim();

            // Check Required
            if (field.required && !value) {
                fieldErrors[field.name] = [`${field.label} is required`];
                continue;
            }

            // Basic Type Check (Email)
            if (value && field.type === 'email') {
                const emailSchema = z.string().email();
                if (!emailSchema.safeParse(value).success) {
                    fieldErrors[field.name] = [`Invalid email address`];
                }
            }

            // Map to Database Object
            if (value !== undefined && value !== null) { // Allow empty strings for system fields
                if (field.isSystem) {
                    if (field.name === 'dob') {
                        dbData[field.name] = new Date(value);
                    } else if (field.name === 'jobId') {
                        // already handled
                    } else {
                        dbData[field.name] = value;
                    }
                } else {
                    dbData.dynamicData[field.name] = value;
                }
            }
        }

        if (Object.keys(fieldErrors).length > 0) {
            return {
                error: "Please check the form for errors.",
                fieldErrors
            };
        }

        // 3. Handle File Uploads (Only if validation passed)
        for (const field of activeFields) {
            if (field.type === 'file') {
                const file = formData.get(field.name) as File;
                if (file && file.size > 0) {
                    try {
                        const path = await saveFile(file, 'uploads');
                        if (field.isSystem) {
                            dbData[field.name] = path;
                        } else {
                            dbData.dynamicData[field.name] = path;
                        }
                    } catch (e) {
                        console.error(`Failed to upload ${field.name}`, e);
                        return { error: "File upload failed. Please try again." };
                    }
                }
            }
        }

        // 4. Save to Database
        const newApplication = await prisma.application.create({
            data: dbData,
        });

        // 5. Trigger Auto-Reply (If enabled)
        try {
            // @ts-ignore - Prisma types might be syncing
            const mailConfig = await prisma.mailConfig.findFirst({
                include: { autoReplyTemplate: true }
            });

            if (mailConfig && mailConfig.isAutoReplyEnabled && mailConfig.autoReplyTemplate && dbData.email && mailConfig.senderEmail && mailConfig.clientId) {
                 const { senderEmail, clientId, clientSecret, refreshToken } = mailConfig;
                 
                 // Dynamic Replacement
                 let body = mailConfig.autoReplyTemplate.body || "";
                 body = body.replace(/{{fullName}}/g, dbData.fullName || "Applicant")
                            .replace(/{{email}}/g, dbData.email)
                            .replace(/{{date}}/g, new Date().toLocaleDateString());
                            
                 // Ideally fetch job title
                 const jobTitle = "this position"; // Placeholder or fetch job
                 body = body.replace(/{{jobTitle}}/g, jobTitle);


                 const oAuth2Client = new google.auth.OAuth2(
                    clientId,
                    clientSecret,
                    REDIRECT_URI
                 );
        
                 oAuth2Client.setCredentials({ refresh_token: refreshToken });
                 
                 // Refresh token logic handled by googleapis getAccessToken
                 const accessToken = await oAuth2Client.getAccessToken();
        
                 const transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: senderEmail,
                        clientId: clientId,
                        clientSecret: clientSecret,
                        refreshToken: refreshToken,
                        accessToken: accessToken.token || '',
                    },
                 });
        
                 await transport.sendMail({
                    from: `MediaSoft <${senderEmail}>`,
                    to: dbData.email,
                    subject: mailConfig.autoReplyTemplate.subject || "Application Received",
                    html: body,
                 });
            }
        } catch (mailError) {
             console.error("Auto-reply failed:", mailError);
             // We don't block the submission success for email failure
        }

        revalidatePath('/admin/dashboard/job-recruitment/applications');
        return { success: true };

    } catch (error) {
        console.error("Submit Application Error:", error);
        return { error: "An unexpected error occurred on the server. Please try again." };
    }
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
        // 1. Fetch application to get file paths
        const application = await prisma.application.findUnique({
            where: { id: applicationId }
        });

        if (application) {
            // 2. Delete known files
            if (application.resume) await deleteFile(application.resume);
            if (application.photo) await deleteFile(application.photo);

            // 3. Delete files from dynamic data if any
            if (application.dynamicData) {
                const dynamicData = application.dynamicData as Record<string, any>;
                for (const key in dynamicData) {
                     const value = dynamicData[key];
                     if (typeof value === 'string' && value.startsWith('/uploads/')) {
                         await deleteFile(value);
                     }
                }
            }
        }

        // 4. Delete DB Record
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
