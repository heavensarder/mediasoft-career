import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import {
    PlusCircle,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import JobActions from '@/components/admin/JobActions';

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
        orderBy: { createdAt: 'desc' }
    });
    return jobs;
}

export default async function JobListPage() {
    const jobs = await getJobs();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">Job List</h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Manage and track all your job openings.</p>
                </div>
                <Link href="/admin/dashboard/job-recruitment/add-new-job">
                    <Button className="premium-btn shadow-md hover:shadow-lg transition-all">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Job
                    </Button>
                </Link>
            </div>

            <div className="premium-glass-card bg-white p-6 overflow-hidden">
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700">Job Title</TableHead>
                                <TableHead className="font-semibold text-slate-700">Department</TableHead>
                                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700">Views</TableHead>
                                <TableHead className="font-semibold text-slate-700">Applications</TableHead>
                                <TableHead className="font-semibold text-slate-700">Expiry Date</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                        No jobs found. Create your first job posting!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="text-slate-900">{job.title}</div>
                                            <div className="text-xs text-slate-400 font-mono">ID: #{job.id}</div>
                                        </TableCell>
                                        <TableCell>{job.department?.name || <span className="text-gray-400 italic">Uncategorized</span>}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50">{job.jobType?.name || 'Unspecified'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={job.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-500 hover:bg-slate-600'}>
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                {job.views}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                                {job._count.applications} Applicants
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {job.expiryDate
                                                ? new Date(job.expiryDate).toLocaleDateString()
                                                : <span className="text-slate-400 italic">N/A</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <JobActions jobId={job.id} jobSlug={(job as any).slug} jobTitle={job.title} />
                                        </TableCell>
                                    </TableRow>
                                )))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
