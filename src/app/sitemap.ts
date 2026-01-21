import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSetting } from '@/lib/settings-actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrlVal = await getSystemSetting('site_base_url');
  const baseUrl = baseUrlVal || 'https://career.mediasoftbd.com';

  // Static Routes
  const routes = [
    '',
    '/auth/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  // Dynamic Job Routes
  const jobs = await prisma.job.findMany({
    where: { status: 'Active' },
    select: { id: true, slug: true, updatedAt: true },
  });

  const jobRoutes = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...jobRoutes];
}
