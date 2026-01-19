import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getActiveJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: 'Active',
        expiryDate: {
          gt: new Date(),
        },
      },
      include: {
        department: true,
        jobType: true,
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return jobs;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return [];
  }
}

export async function getJobById(id: number) {
    try {
        const job = await prisma.job.findUnique({
            where: { id },
             include: {
                department: true,
                jobType: true,
                location: true,
            },
        });
        return job;
    } catch (error) {
        console.error('Failed to fetch job:', error);
        return null;
    }
}
