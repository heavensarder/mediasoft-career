'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getExportData(
    departmentId?: string,
    jobId?: string,
    startDate?: string,
    endDate?: string,
    query?: string,
    status?: string,
    gender?: string
) {
    const where: Prisma.ApplicationWhereInput = {};

    // Filter by Job and optionally Department
    if (jobId && jobId !== 'all') {
        where.jobId = parseInt(jobId);
    } else if (departmentId && departmentId !== 'all') {
        where.job = {
            departmentId: parseInt(departmentId)
        };
    }

    // Filter by Status
    if (status && status !== 'all') {
        where.status = status;
    }

    // Filter by Gender
    if (gender && gender !== 'all') {
        where.gender = gender;
    }

    // Search Query (Name, Email, Mobile, NID)
    if (query) {
        where.OR = [
            { fullName: { contains: query } },
            { email: { contains: query } },
            { mobile: { contains: query } },
            { nid: { contains: query } },
        ];
    }

    // Filter by Date Range
    if (startDate && endDate) {
        where.createdAt = {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    } else if (startDate) {
        where.createdAt = {
            gte: new Date(startDate)
        };
    } else if (endDate) {
        where.createdAt = {
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    }

    try {
        const applications = await prisma.application.findMany({
            where,
            include: {
                job: {
                    include: {
                        department: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Flatten data for easier export
        const flattenedData = applications.map(app => ({
            "Application ID": app.id,
            "Full Name": app.fullName,
            "Email": app.email,
            "Mobile": app.mobile,
            "Gender": app.gender,
            "NID": app.nid,
            "Status": app.status,
            "Job Title": app.job.title,
            "Department": app.job.department?.name || 'N/A',
            "Applied Date": app.createdAt.toLocaleDateString(),
            "Experience": app.experience,
            "Expected Salary": app.expectedSalary,
            "Education": app.education
        }));

        return { success: true, data: flattenedData };

    } catch (error) {
        console.error("Export Error:", error);
        return { success: false, error: "Failed to fetch data." };
    }
}

export async function getJobExportData() {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                department: true,
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const flattenedData = jobs.map(job => ({
            "Job ID": job.id,
            "Title": job.title,
            "Department": job.department?.name || 'N/A',
            "Status": job.status,
            "Applications": job._count.applications,
            "Views": job.views,
            "Created Date": job.createdAt.toLocaleDateString(),
            "Expiry Date": job.expiryDate ? job.expiryDate.toLocaleDateString() : 'N/A'
        }));

        return { success: true, data: flattenedData };

    } catch (error) {
        console.error("Job Export Error:", error);
        return { success: false, error: "Failed to fetch jobs." };
    }
}
