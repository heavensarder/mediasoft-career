'use server';

import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Activity action types
export type ActivityAction =
    | 'CREATE_JOB'
    | 'UPDATE_JOB'
    | 'DELETE_JOB'
    | 'TOGGLE_JOB_STATUS'
    | 'UPDATE_APPLICATION_STATUS'
    | 'ADD_APPLICATION_NOTE'
    | 'SCHEDULE_INTERVIEW'
    | 'MARK_INTERVIEW'
    | 'CREATE_INTERVIEWER'
    | 'UPDATE_INTERVIEWER'
    | 'DELETE_INTERVIEWER'
    | 'UPDATE_SETTINGS'
    | 'UPDATE_BRANDING'
    | 'UPDATE_SEO'
    | 'LOGIN'
    | 'LOGOUT';

interface LogActivityParams {
    action: ActivityAction;
    entityType?: string;
    entityId?: number;
    entityName?: string;
    details?: string;
}

/**
 * Log a user activity to the database
 */
export async function logActivity(params: LogActivityParams) {
    try {
        const session = await auth();

        if (!session?.user) {
            console.warn('Activity logging skipped: No session');
            return { success: false, error: 'No session' };
        }

        const user = session.user as any;

        await prisma.activityLog.create({
            data: {
                userId: user.id ? parseInt(user.id) : null,
                userType: user.role || 'admin',
                userName: user.name || 'Unknown User',
                userEmail: user.email || 'unknown@example.com',
                action: params.action,
                entityType: params.entityType || null,
                entityId: params.entityId || null,
                entityName: params.entityName || null,
                details: params.details || null,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to log activity:', error);
        return { success: false, error: 'Database error' };
    }
}

interface GetActivityLogsParams {
    page?: number;
    limit?: number;
    action?: string;
    userEmail?: string;
    entityType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Get paginated activity logs with filtering
 */
export async function getActivityLogs(params: GetActivityLogsParams = {}) {
    const {
        page = 1,
        limit = 20,
        action,
        userEmail,
        entityType,
        search,
        startDate,
        endDate,
    } = params;

    try {
        const where: any = {};

        if (action) {
            where.action = action;
        }

        if (userEmail) {
            where.userEmail = userEmail;
        }

        if (entityType) {
            where.entityType = entityType;
        }

        if (search) {
            where.OR = [
                { entityName: { contains: search } },
                { userName: { contains: search } },
                { details: { contains: search } },
            ];
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.activityLog.count({ where }),
        ]);

        return {
            success: true,
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        return { success: false, error: 'Database error', logs: [], pagination: null };
    }
}

/**
 * Get activity statistics
 */
export async function getActivityStats() {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);

        const [todayCount, weekCount, totalCount, topActions, recentUsers] = await Promise.all([
            // Today's activities
            prisma.activityLog.count({
                where: { createdAt: { gte: todayStart } },
            }),
            // This week's activities
            prisma.activityLog.count({
                where: { createdAt: { gte: weekStart } },
            }),
            // Total activities
            prisma.activityLog.count(),
            // Top actions (group by action)
            prisma.activityLog.groupBy({
                by: ['action'],
                _count: { action: true },
                orderBy: { _count: { action: 'desc' } },
                take: 5,
            }),
            // Recent unique users
            prisma.activityLog.findMany({
                select: { userName: true, userEmail: true },
                distinct: ['userEmail'],
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);

        return {
            success: true,
            stats: {
                todayCount,
                weekCount,
                totalCount,
                topActions: topActions.map((a) => ({
                    action: a.action,
                    count: a._count.action,
                })),
                recentUsers,
            },
        };
    } catch (error) {
        console.error('Failed to fetch activity stats:', error);
        return { success: false, error: 'Database error', stats: null };
    }
}

/**
 * Get unique action types for filtering
 */
export async function getUniqueActions() {
    try {
        const actions = await prisma.activityLog.findMany({
            select: { action: true },
            distinct: ['action'],
        });

        return {
            success: true,
            actions: actions.map((a) => a.action),
        };
    } catch (error) {
        console.error('Failed to fetch unique actions:', error);
        return { success: false, error: 'Database error', actions: [] };
    }
}

/**
 * Get unique users for filtering
 */
export async function getUniqueUsers() {
    try {
        const users = await prisma.activityLog.findMany({
            select: { userName: true, userEmail: true },
            distinct: ['userEmail'],
        });

        return {
            success: true,
            users,
        };
    } catch (error) {
        console.error('Failed to fetch unique users:', error);
        return { success: false, error: 'Database error', users: [] };
    }
}
