"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, Download, Calendar, Mail, Briefcase, User, LayoutGrid, LayoutList } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusSelector from '@/components/admin/StatusSelector';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DeleteApplicationButton from '@/components/admin/DeleteApplicationButton';

interface Application {
    id: number;
    fullName: string;
    email: string;
    photo: string | null;
    status: string;
    createdAt: Date;
    job: {
        title: string;
    };
}

export default function AdminApplicationList({ applications }: { applications: Application[] }) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/40 rounded-3xl border border-dashed border-slate-300">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 opacity-50">
                    <User className="h-10 w-10" />
                </div>
                <p className="text-xl font-medium">No applications found</p>
                <p>Try adjusting your filters or search query.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {applications.map((app) => (
                        <div key={app.id} className={`group relative rounded-2xl p-3 shadow-sm border hover:shadow-xl transition-all duration-300 flex gap-4 min-h-[140px] overflow-hidden ${app.status === 'New'
                            ? 'bg-sky-50/60 border-sky-200 hover:border-sky-300'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}>
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00ADE7]/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-[#00ADE7]/10 pointer-events-none"></div>

                            {/* Image Section */}
                            <div className="relative w-28 h-32 flex-shrink-0 z-20">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="w-full h-full rounded-xl overflow-hidden cursor-pointer shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                                            <Avatar className="w-full h-full rounded-none">
                                                <AvatarImage
                                                    src={app.photo || undefined}
                                                    alt="Avatar"
                                                    className="object-cover object-top w-full h-full transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <AvatarFallback className="w-full h-full rounded-none font-bold bg-slate-50 text-slate-300 text-3xl flex items-center justify-center">
                                                    {app.fullName.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Hover Overlay Icon */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <Eye className="text-white w-6 h-6 drop-shadow-md" />
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-none shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">{app.fullName}</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center p-6">
                                            {app.photo ? (
                                                <img
                                                    src={app.photo}
                                                    alt={app.fullName}
                                                    className="rounded-2xl object-contain max-h-[60vh] w-auto shadow-2xl ring-4 ring-white"
                                                />
                                            ) : (
                                                <div className="h-48 w-48 rounded-full bg-slate-100 flex items-center justify-center text-5xl text-slate-300 shadow-inner">
                                                    {app.fullName.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 flex flex-col justify-between relative z-10 min-w-0 py-1">
                                <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="absolute inset-0 z-0"></Link>

                                <div className="relative z-10 pointer-events-none">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-base text-slate-800 leading-tight group-hover:text-[#00ADE7] transition-colors truncate pr-6 pointer-events-auto" title={app.fullName}>
                                            <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                                                {app.fullName}
                                            </Link>
                                        </h3>

                                        {/* Hidden Actions */}
                                        <div className="absolute right-0 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 pointer-events-auto">
                                            <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                                                <div className="h-7 w-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-[#00ADE7] hover:border-[#00ADE7] hover:text-white transition-colors cursor-pointer">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </div>
                                            </Link>
                                            <DeleteApplicationButton id={app.id} />
                                        </div>
                                    </div>

                                    <div className="mt-1.5 pointer-events-auto">
                                        <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="text-xs text-muted-foreground hover:text-slate-600 transition-colors inline-block">
                                            Applied for <span className="font-bold text-[#00ADE7]">{app.job.title}</span>
                                        </Link>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 pointer-events-auto">
                                        <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <span className="truncate">{app.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-50 relative z-20">
                                    <div className="flex flex-col pointer-events-none">
                                        <span className="text-[10px] text-slate-400 font-medium">Applied on</span>
                                        <span className="text-xs font-semibold text-slate-600 active:text-slate-800">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="transform scale-90 origin-bottom-right pointer-events-auto">
                                        <StatusSelector id={app.id} currentStatus={app.status} />
                                    </div>
                                </div>
                                <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="absolute inset-0 z-0 block" aria-label="View details" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // LIST VIEW - Modern Row Design
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className={`group rounded-xl p-4 shadow-sm border hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 items-center ${app.status === 'New'
                                ? 'bg-sky-50 border-sky-200 hover:border-sky-300'
                                : 'bg-white border-slate-200/60 hover:border-[#00ADE7]/30'
                                }`}
                        >
                            {/* Avatar & Info */}
                            <div className="flex items-center gap-4 min-w-[250px]">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="h-12 w-12 rounded-xl overflow-hidden cursor-pointer shadow-sm border border-slate-100 group-hover:scale-105 transition-all shrink-0">
                                            <Avatar className="w-full h-full">
                                                <AvatarImage src={app.photo || undefined} alt={app.fullName} className="object-cover" />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-slate-400 font-bold">
                                                    {app.fullName.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-none shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">{app.fullName}</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center p-6">
                                            {app.photo ? (
                                                <img
                                                    src={app.photo}
                                                    alt={app.fullName}
                                                    className="rounded-2xl object-contain max-h-[60vh] w-auto shadow-2xl ring-4 ring-white"
                                                />
                                            ) : (
                                                <div className="h-48 w-48 rounded-full bg-slate-100 flex items-center justify-center text-5xl text-slate-300 shadow-inner">
                                                    {app.fullName.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <div>
                                    <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="block">
                                        <h3 className="text-base font-bold text-slate-800 group-hover:text-[#00ADE7] transition-colors mb-0.5">
                                            {app.fullName}
                                        </h3>
                                    </Link>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate max-w-[150px]">{app.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Job Info */}
                            <div className="flex-1 min-w-[200px]">
                                <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="block">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 hover:text-[#00ADE7] transition-colors">
                                            {app.job.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                </Link>
                            </div>

                            {/* Status */}
                            <div className="min-w-[140px] flex justify-center">
                                <StatusSelector id={app.id} currentStatus={app.status} />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end min-w-[100px]">
                                <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                                    <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#00ADE7] hover:border-[#00ADE7] hover:text-white transition-all shadow-sm">
                                        <Eye className="h-4 w-4" />
                                    </div>
                                </Link>
                                <DeleteApplicationButton id={app.id} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
