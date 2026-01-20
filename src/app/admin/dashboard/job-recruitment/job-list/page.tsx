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
    Trash2,
    Briefcase,
    Clock,
    Calendar
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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
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

            {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Briefcase className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No active jobs</h3>
                    <p className="text-slate-500 max-w-sm mb-8">
                        You haven't posted any jobs yet. Start hiring by creating your first position.
                    </p>
                    <Link href="/admin/dashboard/job-recruitment/add-new-job">
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-[#00ADE7] hover:border-[#00ADE7]">
                            Create Job
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Actions Dropdown (Top Right) */}
                            <div className="absolute top-4 right-4 z-10">
                                <JobActions jobId={job.id} jobSlug={job.slug as string} jobTitle={job.title} />
                            </div>

                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="mb-6 pr-8">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#00ADE7]">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <div>
                                            {job.status === 'Active' ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1.5">
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                    </span>
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#00ADE7] transition-colors line-clamp-2">
                                        {job.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-mono mt-1">ID: #{job.id}</p>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-100 font-medium rounded-md px-2.5 py-1">
                                        {job.department?.name || "No Dept"}
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-100 font-medium rounded-md px-2.5 py-1">
                                        {job.jobType?.name || "No Type"}
                                    </Badge>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-bold text-slate-800">{job._count.applications}</span>
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Applicants</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
                                        <div className="flex items-center gap-1.5 text-slate-800">
                                            <Eye className="h-4 w-4 text-slate-400" />
                                            <span className="text-xl font-bold">{job.views}</span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Views</span>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                                    </span>
                                    {job.expiryDate && (
                                        <span className={`flex items-center gap-1.5 ${new Date(job.expiryDate) < new Date() ? 'text-red-500' : ''}`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                            Exp: {new Date(job.expiryDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
