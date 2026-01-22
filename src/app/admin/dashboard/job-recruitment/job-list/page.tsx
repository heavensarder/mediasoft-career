import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
    PlusCircle,
    Briefcase
} from 'lucide-react';
import AdminJobList from '@/components/admin/AdminJobList';

const prisma = new PrismaClient();

async function getJobs() {
    const jobs = await prisma.job.findMany({
        include: {
            department: true,
            jobType: true,
            _count: {
                select: { applications: true }
            }
        },
        orderBy: [
            { status: 'asc' }, // 'Active' comes before 'Closed', 'Draft', 'Inactive'
            { createdAt: 'desc' }
        ]
    });
    return jobs;
}

export default async function JobListPage() {
    const jobs = await getJobs();

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">
                        Job Recruitment
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">
                        Manage your job postings and track candidate applications.
                    </p>
                </div>
                <Link href="/admin/dashboard/job-recruitment/add-new-job">
                    <Button className="rounded-full bg-[#00ADE7] hover:bg-[#0095c8] text-white shadow-lg shadow-blue-500/20 px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create New Position
                    </Button>
                </Link>
            </div>

            <AdminJobList jobs={jobs} />
        </div>
    );
}
