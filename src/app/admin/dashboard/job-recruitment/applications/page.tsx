import { Suspense } from 'react';
import { User, Download } from 'lucide-react';

import ApplicationFilters from '@/components/admin/ApplicationFilters';
import { prisma } from '@/lib/prisma';
import { getApplications } from '@/lib/application-actions';
import PaginationControls from '@/components/ui/pagination-controls';
import DownloadDataButton from '@/components/admin/DownloadDataButton';
import AdminApplicationList from '@/components/admin/AdminApplicationList';
import AutoRefresh from '@/components/admin/AutoRefresh';

async function getJobs() {
    return await prisma.job.findMany({
        select: { id: true, title: true },
        where: { status: 'Active' },
    });
}

export default async function ApplicationsPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        status?: string;
        jobId?: string;
        page?: string;
        per_page?: string;
        gender?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || '';
    const status = params?.status || '';
    const jobId = params?.jobId || '';
    const gender = params?.gender || '';
    const page = params?.page ? parseInt(params.page) : 1;
    const per_page = params?.per_page ? parseInt(params.per_page) : 12; // Increased for grid view

    const { applications, totalCount, totalPages } = await getApplications(query, status, jobId, page, per_page, gender);

    // Fetch all jobs for the filter dropdown
    const allJobs = await prisma.job.findMany({ select: { id: true, title: true } });

    return (
        <div className="space-y-8 pb-10">
            <AutoRefresh interval={5000} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-6 w-6" />
                        </div>
                        Applications
                    </h1>
                    <p className="text-muted-foreground mt-1 ml-14">
                        Review and manage candidate applications ({totalCount} total).
                    </p>
                </div>
                <DownloadDataButton
                    mode="applications"
                    filters={{ query, status, jobId, gender }}
                    label="Export All"
                    className="premium-btn bg-white/50 border-primary/20 text-primary hover:bg-primary/5"
                />
            </div>

            <Suspense fallback={<div>Loading filters...</div>}>
                <ApplicationFilters jobs={allJobs} />
            </Suspense>

            <AdminApplicationList applications={applications} />

            <div className="mt-8">
                <PaginationControls
                    hasNextPage={page < totalPages}
                    hasPrevPage={page > 1}
                    totalPages={totalPages}
                />
            </div>
        </div>
    );
}
