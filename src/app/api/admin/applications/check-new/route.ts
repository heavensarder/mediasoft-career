import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.application.count({
      where: {
        status: 'New'
      }
    });

    const latestApplication = await prisma.application.findFirst({
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            fullName: true,
            createdAt: true
        }
    });

    return NextResponse.json({ 
        count, 
        latestId: latestApplication?.id || 0,
        latestName: latestApplication?.fullName || ''
    });

  } catch (error) {
    console.error("Error checking new applications:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
