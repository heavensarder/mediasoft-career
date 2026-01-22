import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const branding = await prisma.siteSettings.findFirst({
            select: { logoPath: true }
        });

        return NextResponse.json({
            logoUrl: branding?.logoPath || null
        });
    } catch (error) {
        return NextResponse.json({ logoUrl: null });
    }
}
