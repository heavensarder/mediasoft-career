'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getExportData(
    departmentId?: string,
    jobId?: string,
    startDate?: string,
    endDate?: string
) {
    const where: Prisma.ApplicationWhereInput = {};

    // Filter by Job and optionally Department (via Job)
    if (jobId && jobId !== 'all') {
        where.jobId = parseInt(jobId);
    } else if (departmentId && departmentId !== 'all') {
        where.job = {
            departmentId: parseInt(departmentId)
        };
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
