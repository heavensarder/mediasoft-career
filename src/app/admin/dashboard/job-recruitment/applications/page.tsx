import { Suspense } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import ApplicationFilters from '@/components/admin/ApplicationFilters';
import DeleteApplicationButton from '@/components/admin/DeleteApplicationButton';
import { prisma } from '@/lib/prisma';
import { getApplications } from '@/lib/application-actions';
import PaginationControls from '@/components/ui/pagination-controls';

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
    const per_page = params?.per_page ? parseInt(params.per_page) : 10;

    const { applications, totalCount, totalPages } = await getApplications(query, status, jobId, page, per_page, gender);

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

            <Suspense fallback={<div>Loading filters...</div>}>
                <ApplicationFilters jobs={allJobs} />
            </Suspense>

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
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="cursor-pointer">
                                                    <Avatar className="h-9 w-9 hover:opacity-80 transition-opacity">
                                                        <AvatarImage src={app.photo || undefined} alt="Avatar" />
                                                        <AvatarFallback>{app.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="text-center">{app.fullName}</DialogTitle>
                                                </DialogHeader>
                                                <div className="flex justify-center p-4">
                                                    {app.photo ? (
                                                        <img
                                                            src={app.photo}
                                                            alt={app.fullName}
                                                            className="rounded-lg object-contain max-h-[80vh] w-auto"
                                                        />
                                                    ) : (
                                                        <div className="h-64 w-64 rounded-full bg-slate-200 flex items-center justify-center text-4xl text-slate-500">
                                                            {app.fullName.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
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

            <PaginationControls
                hasNextPage={page < totalPages}
                hasPrevPage={page > 1}
                totalPages={totalPages}
            />
        </div>
    );
}
