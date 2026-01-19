import { prisma } from '@/lib/prisma';

export async function getActiveJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        // Show all jobs that are not deleted/expired logic if any. 
        // User wants Inactive visible. 
        // Assuming 'Active' and 'Inactive' are key statuses.
      },
      include: {
        department: true,
        jobType: true,
        location: true,
      },
      orderBy: [
        { status: 'asc' }, // Active comes before Inactive
        { createdAt: 'desc' },
      ],
    });

    // Check for expiry and override status if needed (Read-time logic)
    const now = new Date();
    const processedJobs = jobs.map(job => {
      const isExpired = job.expiryDate && new Date(job.expiryDate) < now;
      if (isExpired && job.status === 'Active') {
        return { ...job, status: 'Inactive' };
      }
      return job;
    });

    // Re-sort because we might have flipped some directly to Inactive
    // Active ('Active') < Inactive ('Inactive')
    processedJobs.sort((a, b) => {
      if (a.status === b.status) {
        // Secondary sort by createdAt desc
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.status === 'Active' ? -1 : 1;
    });

    return processedJobs;
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
