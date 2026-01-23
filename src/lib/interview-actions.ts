'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionUser, canMarkSection } from './interview-auth';
import { logActivity } from './activity-log-actions';

/**
 * Get all applicants who have gone through interview process
 * (Interview, Selected, or Rejected status)
 */
export async function getInterviewApplicants() {
    try {
        const applications = await prisma.application.findMany({
            where: {
                status: { in: ['Interview', 'Selected', 'Rejected'] },
                interviewEnded: false,
            },
            include: {
                job: true,
                interviewMarking: true,
                assignedInterviewers: {
                    include: {
                        interviewer: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: [
                // Sort by total score descending (handled in JS since Prisma doesn't support computed sort)
                { createdAt: 'desc' }
            ],
        });

        // Calculate total scores and sort
        const withScores = applications.map(app => {
            const marking = app.interviewMarking;
            const totalScore = marking
                ? (marking.writtenExam || 0) + (marking.technicalViva || 0) + ((marking.projectRating || 0) * 2)
                : 0;
            // Map assigned interviewers to simple array of IDs
            const assignedInterviewerIds = app.assignedInterviewers.map(a => a.interviewerId);
            return { ...app, totalScore, assignedInterviewerIds };
        });

        // Sort by total score descending
        withScores.sort((a, b) => b.totalScore - a.totalScore);

        return { applications: withScores };
    } catch (error) {
        console.error('Error fetching interview applicants:', error);
        return { applications: [], error: 'Failed to fetch interview applicants' };
    }
}


/**
 * Get a single applicant with their interview marking
 */
export async function getInterviewApplicant(applicationId: number) {
    try {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true,
                interviewMarking: true,
            },
        });

        if (!application) {
            return { error: 'Application not found' };
        }

        return { application };
    } catch (error) {
        console.error('Error fetching interview applicant:', error);
        return { error: 'Failed to fetch applicant' };
    }
}

/**
 * Set or update interview date for an applicant
 */
export async function setInterviewDate(applicationId: number, date: Date | null) {
    try {
        const application = await prisma.application.update({
            where: { id: applicationId },
            data: { interviewDate: date },
            include: { job: { select: { title: true } } }
        });

        // Log activity
        await logActivity({
            action: 'SCHEDULE_INTERVIEW',
            entityType: 'Application',
            entityId: applicationId,
            entityName: `${application.fullName} - ${application.job?.title || 'Unknown Job'}`,
            details: date ? `Scheduled for ${date.toISOString()}` : 'Date cleared',
        });

        revalidatePath('/admin/dashboard/interview-panel');
        revalidatePath(`/admin/dashboard/job-recruitment/applications/${applicationId}`);

        return { success: true };
    } catch (error) {
        console.error('Error setting interview date:', error);
        return { error: 'Failed to set interview date' };
    }
}

/**
 * Update applicant status from Interview Panel (Interview, Rejected, Selected)
 */
export async function updateInterviewStatus(applicationId: number, status: 'Interview' | 'Rejected' | 'Selected') {
    try {
        await prisma.application.update({
            where: { id: applicationId },
            data: { status },
        });

        revalidatePath('/admin/dashboard/interview-panel');
        revalidatePath('/admin/dashboard/job-recruitment/applications');
        revalidatePath(`/admin/dashboard/job-recruitment/applications/${applicationId}`);

        return { success: true };
    } catch (error) {
        console.error('Error updating interview status:', error);
        return { error: 'Failed to update status' };
    }
}

/**
 * Save or update marking scores for an applicant
 */
export async function saveMarking(
    applicationId: number,
    scores: {
        writtenExam?: number;
        technicalViva?: number;
        projectRating?: number
    }
) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Verify permissions for each section
        const canMarkWritten = await canMarkSection('writtenExam');
        const canMarkTechnical = await canMarkSection('technicalViva');
        const canMarkProject = await canMarkSection('project');

        // Filter scores based on permissions
        const allowedScores: any = {};
        if (scores.writtenExam !== undefined && canMarkWritten) {
            allowedScores.writtenExam = scores.writtenExam;
        }
        if (scores.technicalViva !== undefined && canMarkTechnical) {
            allowedScores.technicalViva = scores.technicalViva;
        }
        if (scores.projectRating !== undefined && canMarkProject) {
            allowedScores.projectRating = scores.projectRating;
        }

        if (Object.keys(allowedScores).length === 0) {
            return { error: 'No permission to mark any section' };
        }

        // Upsert marking record
        await prisma.interviewMarking.upsert({
            where: { applicationId },
            update: {
                ...allowedScores,
                markedById: user.role === 'interview_admin' ? parseInt(user.id) : null,
            },
            create: {
                applicationId,
                ...allowedScores,
                markedById: user.role === 'interview_admin' ? parseInt(user.id) : null,
            },
        });

        // Get application info for logging
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: { select: { title: true } } }
        });

        // Log activity
        await logActivity({
            action: 'MARK_INTERVIEW',
            entityType: 'Application',
            entityId: applicationId,
            entityName: `${application?.fullName || 'Unknown'} - ${application?.job?.title || 'Unknown Job'}`,
            details: JSON.stringify(allowedScores),
        });

        revalidatePath('/admin/dashboard/interview-panel');
        revalidatePath(`/admin/dashboard/interview-panel/marking/${applicationId}`);

        return { success: true };
    } catch (error) {
        console.error('Error saving marking:', error);
        return { error: 'Failed to save marking' };
    }
}

/**
 * Get marking for a specific applicant
 */
export async function getMarking(applicationId: number) {
    try {
        const marking = await prisma.interviewMarking.findUnique({
            where: { applicationId },
        });

        return { marking };
    } catch (error) {
        console.error('Error fetching marking:', error);
        return { error: 'Failed to fetch marking' };
    }
}

/**
 * Set interview status and optionally interview date (used when changing to Interview status)
 */
export async function setInterviewStatusWithDate(
    applicationId: number,
    interviewDate: Date | null
) {
    try {
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                status: 'Interview',
                interviewDate,
                interviewEnded: false, // Reset so it shows in Interview Panel
            },
        });

        revalidatePath('/admin/dashboard/interview-panel');
        revalidatePath('/admin/dashboard/job-recruitment/applications');
        revalidatePath(`/admin/dashboard/job-recruitment/applications/${applicationId}`);
        revalidatePath('/admin/dashboard/job-recruitment/overview');

        return { success: true };
    } catch (error) {
        console.error('Error setting interview status:', error);
        return { error: 'Failed to set interview status' };
    }
}

/**
 * End interviews for a specific job position or all positions
 * Sets interviewEnded=true to remove from Interview Panel without changing status
 */
export async function endInterviews(jobId: number | null) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') {
            return { error: 'Unauthorized: Only admin can end interviews' };
        }

        const where: any = {
            status: { in: ['Interview', 'Selected', 'Rejected'] },
            interviewEnded: false,
        };
        if (jobId) {
            where.jobId = jobId;
        }

        const result = await prisma.application.updateMany({
            where,
            data: {
                interviewEnded: true,
            },
        });

        revalidatePath('/admin/dashboard/interview-panel');
        revalidatePath('/admin/dashboard/job-recruitment/applications');
        revalidatePath('/admin/dashboard/job-recruitment/overview');

        return {
            success: true,
            message: `${result.count} applicant(s) removed from interview panel`
        };
    } catch (error) {
        console.error('Error ending interviews:', error);

        return { error: 'Failed to end interviews' };
    }
}

/**
 * Assign an applicant to multiple interviewers
 * Pass an array of interviewer IDs to assign
 */
export async function assignInterviewers(applicationId: number, interviewerIds: number[]) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') {
            return { error: 'Unauthorized: Only admin can assign interviewers' };
        }

        // Delete existing assignments
        await prisma.applicationAssignment.deleteMany({
            where: { applicationId },
        });

        // Create new assignments
        if (interviewerIds.length > 0) {
            await prisma.applicationAssignment.createMany({
                data: interviewerIds.map(interviewerId => ({
                    applicationId,
                    interviewerId,
                })),
            });
        }

        revalidatePath('/admin/dashboard/interview-panel');

        return { success: true };
    } catch (error) {
        console.error('Error assigning interviewers:', error);
        return { error: 'Failed to assign interviewers' };
    }
}


/**
 * Get all interview admins (for assignment dropdown)
 */
export async function getInterviewAdmins() {
    try {
        const admins = await prisma.interviewAdmin.findMany({
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: { name: 'asc' },
        });

        return { interviewers: admins };
    } catch (error) {
        console.error('Error fetching interview admins:', error);
        return { interviewers: [], error: 'Failed to fetch interviewers' };
    }
}


