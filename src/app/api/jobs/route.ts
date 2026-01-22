import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const API_KEY_SETTING_NAME = "api_secret_key";

async function isAuthenticated(req: NextRequest) {
    const setting = await prisma.systemSettings.findUnique({
        where: { key: API_KEY_SETTING_NAME }
    });
    
    const validKey = setting?.value || "media-secret-key-123";

    const queryKey = req.nextUrl.searchParams.get('api_key');
    const headerKey = req.headers.get('x-api-key');

    return queryKey === validKey || headerKey === validKey;
}

export async function GET(req: NextRequest) {
    try {
         if (!await isAuthenticated(req)) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
        }

        const jobs = await prisma.job.findMany({
            where: {
                status: 'Active',
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                salaryRange: true,
                location: true,
                jobType: true,
                department: true,
                expiryDate: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
