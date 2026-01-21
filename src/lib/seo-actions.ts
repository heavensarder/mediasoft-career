'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export type SEOPageKey = 'global' | 'home' | 'job_details' | 'about' | 'contact';

export interface PageSeoData {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  jsonLd?: string;
}

export async function getPageSeo(page: string) {
  const seo = await prisma.pageSeo.findUnique({
    where: { page }
  });
  return seo;
}

export async function getAllSeoSettings() {
  return await prisma.pageSeo.findMany();
}

export async function updatePageSeo(page: string, data: PageSeoData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.pageSeo.upsert({
    where: { page },
    update: data,
    create: {
      page,
      ...data
    }
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard/seo-manager');
}

export async function initDefaultSeo() {
  const defaults = [
    { page: 'global', title: 'MediaSoft Career', description: 'Join our team at MediaSoft.', keywords: 'career, jobs, tech' },
    { page: 'home', title: 'Home - MediaSoft Career', description: 'Find your dream job.', keywords: 'software jobs, vacancies' },
    { page: 'job_details', title: '{{job_title}} at MediaSoft', description: 'Apply for {{job_title}}.', keywords: '{{job_title}}, jobs' },
  ];

  for (const def of defaults) {
      await prisma.pageSeo.upsert({
          where: { page: def.page },
          update: {},
          create: def
      });
  }
}
