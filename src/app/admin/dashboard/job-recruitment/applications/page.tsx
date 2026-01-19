import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusSelector from '@/components/admin/StatusSelector';

import ApplicationFilters from '@/components/admin/ApplicationFilters';
import DeleteApplicationButton from '@/components/admin/DeleteApplicationButton';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient(); // Removed local instantiation

async function getApplications(query: string, status: string, jobId: string) {
    const where: Prisma.ApplicationWhereInput = {};

    if (status) {
        where.status = status;
    }

    if (jobId && !isNaN(parseInt(jobId))) {
        where.jobId = parseInt(jobId);
    }

    if (query) {
        where.OR = [
            { fullName: { contains: query } }, // removed mode: 'insensitive' for compatibility check if needed, but usually fine
            { email: { contains: query } },
            { mobile: { contains: query } },
            { nid: { contains: query } },
        ];
    }

    const applications = await prisma.application.findMany({
        where,
        include: {
            job: true,
        },
        orderBy: { createdAt: 'desc' }
    });
    return applications;
}

async function getJobs() {
    return await prisma.job.findMany({
        select: { id: true, title: true },
        where: { status: 'Active' }, // Only show active jobs in filter? Or all? Let's show all for now since older apps might be on closed jobs.
        // Actually, removing status filter to allow filtering by closed jobs too.
    });
}

export default async function ApplicationsPage({
    searchParams,
}: {
    searchParams?: {
        query?: string;
        status?: string;
        jobId?: string;
    };
}) {
    // Await searchParams before using properties (Next.js 15 requirement, good practice generally)
    // Note: In Next.js 14 it's not strictly async but good practice.
    // However, to be safe:
    const params = await searchParams; 
    const query = params?.query || '';
    const status = params?.status || '';
    const jobId = params?.jobId || '';

    const applications = await getApplications(query, status, jobId);
    // Fetch all jobs for the filter dropdown
    const allJobs = await prisma.job.findMany({ select: { id: true, title: true } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export All
        </Button>
      </div>

      <ApplicationFilters jobs={allJobs} />

      <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {applications.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                            No applications found matching your filters.
                        </TableCell>
                    </TableRow>
                ) : (
                    applications.map((app) => (
                        <TableRow key={app.id} className={app.status === 'New' ? "bg-slate-50" : ""}>
                            <TableCell>
                                <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                                    <Avatar className="h-9 w-9 hover:opacity-80 transition-opacity cursor-pointer">
                                        <AvatarImage src={app.photo || undefined} alt="Avatar" />
                                        <AvatarFallback>{app.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Link>
                            </TableCell>
                            <TableCell className="font-medium">
                                <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="hover:underline hover:text-blue-600 block">
                                    {app.fullName}
                                </Link>
                            </TableCell>
                            <TableCell>{app.job.title}</TableCell>
                            <TableCell>{app.email}</TableCell>
                            <TableCell>
                                <StatusSelector id={app.id} currentStatus={app.status} />
                            </TableCell>
                            <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                                        <Button variant="outline" size="sm" className="cursor-pointer h-8">
                                            View
                                        </Button>
                                    </Link>
                                    <DeleteApplicationButton id={app.id} />
                                </div>
                            </TableCell>
                        </TableRow>
                )))}
            </TableBody>
            </Table>
      </div>
    </div>
  );
}
