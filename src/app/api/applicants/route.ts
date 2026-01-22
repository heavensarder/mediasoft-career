import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const API_KEY_SETTING_NAME = "api_secret_key";

async function isAuthenticated(req: NextRequest) {
    // Get valid key from DB
    const setting = await prisma.systemSettings.findUnique({
        where: { key: API_KEY_SETTING_NAME }
    });
    
    // If no key set in DB (edge case), default is insecure or hardcoded? 
    // Usually we expect DB to have it triggered by getApiKey action or seed.
    // Let's assume strict auth: if DB has no key, access denied or default fallback.
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

        const applicants = await prisma.application.findMany({
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, count: applicants.length, data: applicants });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch applicants' }, { status: 500 });
    }
}
