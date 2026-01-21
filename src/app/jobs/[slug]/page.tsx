import { notFound } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Building2, Calendar, Clock, ChevronLeft } from 'lucide-react';
import ApplicationForm from "@/components/ApplicationForm";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import ViewTracker from '@/components/ViewTracker';

async function getJob(slug: string) {
  // Try to find by slug first
  let job = await prisma.job.findUnique({
    where: { slug: slug },
    include: {
      department: true,
      jobType: true,
      location: true,
    }
  });

  // Fallback for ID if slug lookup fails (legacy support during migration)
  if (!job && !isNaN(Number(slug))) {
    job = await prisma.job.findUnique({
      where: { id: parseInt(slug) },
      include: {
        department: true,
        jobType: true,
        location: true,
      }
    });
  }

  return job;
}

import { Metadata } from 'next';
import { getPageSeo } from '@/lib/seo-actions';
import { getBrandingSettings } from '@/lib/settings-actions';

// ... existing code ...

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const job = await getJob(decodedSlug);
  
  if (!job) return {};

  const [seo, branding] = await Promise.all([
    getPageSeo('job_details'),
    getBrandingSettings()
  ]);

  const titleTemplate = seo?.title || "{{job_title}} at MediaSoft";
  const title = titleTemplate.replace('{{job_title}}', job.title);
  
  const descriptionTemplate = seo?.description || `Apply for the ${job.title} position at MediaSoft.`;
  const description = descriptionTemplate.replace('{{job_title}}', job.title);

  return {
    title: title,
    description: description,
    keywords: seo?.keywords?.replace('{{job_title}}', job.title).split(',').map((k: string) => k.trim()) || [],
    openGraph: {
       title: title,
       description: description,
       images: seo?.ogImage ? [{ url: seo.ogImage }] : (branding.logoPath ? [{ url: branding.logoPath }] : []),
    }
  };
}

async function getFormFields() {
  return await prisma.formField.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
}

export default async function JobDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug); // Handle URL encoding
  const job = await getJob(decodedSlug);
  const fields = await getFormFields();

  if (!job) {
    notFound();
  }

  const daysLeft = job.expiryDate
    ? Math.ceil((new Date(job.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isExpired = daysLeft < 0;
  const isInactive = job.status !== 'Active';
  const showApplication = !isExpired && !isInactive;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 font-sans selection:bg-primary/20">
      {/* Navigation Bar Placeholder */}
      <div className="container mx-auto px-4 pt-6 pb-2">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
        </Link>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">

          <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20">
            <ShareButton title={job.title} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-start">
            <div className="space-y-4 max-w-3xl pr-14 md:pr-0">
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors hover:bg-slate-200">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.department?.name}
                </span>

                {!showApplication ? (
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {isInactive ? 'Applications Paused' : 'Applications Closed'}
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 animate-pulse-slow">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Actively Hiring
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-slate-500 text-sm md:text-base pt-2">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location?.name}
                </span>
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.jobType?.name}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {isExpired ? 'Expired' : `${daysLeft} days left to apply`}
                </span>
              </div>
            </div>


          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Job Description */}
          <div className="lg:col-span-7 space-y-8 min-w-0">
            <div className="premium-glass-card border-none p-4 md:p-10">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                Job Description
              </h2>
              <div
                className="prose prose-slate max-w-full
                        prose-headings:text-slate-900 prose-headings:font-bold 
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-slate-800
                        prose-li:marker:text-primary
                        prose-p:leading-loose
                        break-words hyphens-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-8 space-y-6">
              {!showApplication ? (
                <div className="bg-slate-100 rounded-3xl p-8 text-center border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    {isInactive ? 'Applications Paused' : 'Applications Closed'}
                  </h3>
                  <p className="text-slate-500">
                    {isInactive
                      ? 'This position is currently not accepting new applications.'
                      : 'The deadline for this position has passed. Please check our other openings.'}
                  </p>
                  <Button asChild className="mt-4 premium-btn">
                    <Link href="/">Browse Other Jobs</Link>
                  </Button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <ApplicationForm jobId={job.id} jobTitle={job.title} fields={fields} />
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground mt-4">
                Having trouble applying? <a href="mailto:support@mediasoft.com.bd" className="text-primary hover:text-blue-700 transition-colors">Contact Support</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      
      <ViewTracker jobId={job.id} />
    </div>
  );
}
