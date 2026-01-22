"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    LayoutGrid,
    LayoutList,
    Briefcase,
    Clock,
    Calendar,
    Eye,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import JobActions from '@/components/admin/JobActions';
import JobStatusToggle from '@/components/admin/JobStatusToggle';

interface Job {
    id: number;
    title: string;
    slug: string | null;
    status: string;
    views: number;
    createdAt: Date;
    expiryDate: Date | null;
    department: { name: string } | null;
    jobType: { name: string } | null;
    _count: { applications: number };
}

export default function AdminJobList({ jobs }: { jobs: Job[] }) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    if (jobs.length === 0) {
        return (
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
        );
    }

    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex justify-end">
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`h-9 w-9 p-0 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-slate-100 text-[#00ADE7]'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                        title="List View"
                    >
                        <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`h-9 w-9 p-0 rounded-md transition-all ${viewMode === 'grid'
                            ? 'bg-slate-100 text-[#00ADE7]'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                // GRID VIEW
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
                                            <JobStatusToggle jobId={job.id} initialStatus={job.status || 'Active'} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#00ADE7] transition-colors line-clamp-2 mb-1">
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
                                        {format(new Date(job.createdAt), 'dd/MM/yyyy')}
                                    </span>
                                    {job.expiryDate && (
                                        <span className={`flex items-center gap-1.5 ${new Date(job.expiryDate) < new Date() ? 'text-red-500' : ''}`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(job.expiryDate), 'dd/MM/yyyy')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // LIST VIEW - Modern Row Design
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="group bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-[#00ADE7]/30 transition-all duration-200 flex flex-col sm:flex-row gap-4 items-center"
                        >
                            {/* Icon & ID */}
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-400 group-hover:text-[#00ADE7] transition-colors shrink-0">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div className="text-xs font-mono text-slate-400 mb-0.5">#{job.id}</div>
                            </div>

                            {/* Title & Type */}
                            <div className="flex-1 min-w-[250px]">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#00ADE7] transition-colors line-clamp-1">
                                        {job.title}
                                    </h3>
                                    <div className="shrink-0">
                                        <JobStatusToggle jobId={job.id} initialStatus={job.status || 'Active'} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {job.jobType?.name}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span>{job.department?.name || "No Dept"}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 px-4 border-l border-r border-slate-100 min-w-[200px] justify-center">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-slate-800">{job._count.applications}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Aplicants</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-slate-800">{job.views}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Views</div>
                                </div>
                            </div>

                            {/* Dates & Action */}
                            <div className="flex items-center gap-6 min-w-[200px] justify-between sm:justify-end w-full sm:w-auto">
                                <div className="text-right hidden xl:block">
                                    <div className="text-xs text-slate-500 mb-1">
                                        Posted: <span className="font-medium text-slate-700">{format(new Date(job.createdAt), 'dd/MM/yyyy')}</span>
                                    </div>
                                    {job.expiryDate && (
                                        <div className={`text-xs ${new Date(job.expiryDate) < new Date() ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                                            Exp: <span className="font-medium">{format(new Date(job.expiryDate), 'dd/MM/yyyy')}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                                    <JobActions jobId={job.id} jobSlug={job.slug as string} jobTitle={job.title} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
