"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MapPin,
    Clock,
    Briefcase,
    ArrowRight,
    Code,
    PenTool,
    Megaphone,
    BarChart,
    Headphones,
    Database,
    Server,
    Cpu,
    Layers,
    Smartphone,
    Terminal,
    Monitor,
    Search,
    Filter,
} from "lucide-react";

// Helper function to get icon based on job title
const getJobIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("design") || lowerTitle.includes("ui") || lowerTitle.includes("ux")) return PenTool;
    if (lowerTitle.includes("front") || lowerTitle.includes("react") || lowerTitle.includes("web")) return Monitor;
    if (lowerTitle.includes("back") || lowerTitle.includes("node") || lowerTitle.includes("api")) return Server;
    if (lowerTitle.includes("full") || lowerTitle.includes("stack")) return Layers;
    if (lowerTitle.includes("mobile") || lowerTitle.includes("app") || lowerTitle.includes("flutter") || lowerTitle.includes("ios") || lowerTitle.includes("android")) return Smartphone;
    if (lowerTitle.includes("data") || lowerTitle.includes("sql")) return Database;
    if (lowerTitle.includes("devops") || lowerTitle.includes("cloud")) return Cpu;
    if (lowerTitle.includes("marketing") || lowerTitle.includes("social")) return Megaphone;
    if (lowerTitle.includes("support") || lowerTitle.includes("service")) return Headphones;
    if (lowerTitle.includes("manager") || lowerTitle.includes("lead")) return Briefcase;
    if (lowerTitle.includes("sales") || lowerTitle.includes("business")) return BarChart;
    if (lowerTitle.includes("engineer") || lowerTitle.includes("developer")) return Code;

    return Terminal; // Default icon
};

export function JobList({ jobs }: { jobs: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedJobType, setSelectedJobType] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");

    // Extract unique departments and job types for filters
    const departments = useMemo(() => {
        const deps = new Set(jobs.map((job) => job.department?.name).filter(Boolean));
        return ["All", ...Array.from(deps)];
    }, [jobs]);

    const jobTypes = useMemo(() => {
        const types = new Set(jobs.map((job) => job.jobType?.name).filter(Boolean));
        return ["All", ...Array.from(types)];
    }, [jobs]);

    const statuses = ["All", "Active", "Inactive"];

    // Filter jobs based on search and dropdowns
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDepartment = selectedDepartment === "All" || job.department?.name === selectedDepartment;
            const matchesType = selectedJobType === "All" || job.jobType?.name === selectedJobType;
            const matchesStatus = selectedStatus === "All" || job.status === selectedStatus;

            return matchesSearch && matchesDepartment && matchesType && matchesStatus;
        });
    }, [jobs, searchQuery, selectedDepartment, selectedJobType, selectedStatus]);

    return (
        <div className="space-y-8">
            {/* Search and Filters - Glassmorphic / Clean Design */}
            <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg shadow-blue-500/5 p-4 transform hover:scale-[1.002] transition-all duration-500">
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#00ADE7] transition-colors" />
                        </div>
                        <Input
                            placeholder="Search for your next role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#00ADE7] focus:ring-4 focus:ring-[#00ADE7]/10 rounded-xl transition-all duration-300 text-base placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex gap-3 flex-col sm:flex-row overflow-x-auto pb-2 sm:pb-0 items-center">
                        {/* Status Filter */}
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white border-slate-200 rounded-xl shadow-sm hover:border-[#00ADE7]/50 focus:ring-4 focus:ring-[#00ADE7]/10 transition-all font-medium text-slate-600">
                                <div className="flex items-center gap-2 truncate">
                                    <Filter className="h-4 w-4 text-[#00ADE7]" />
                                    <span className="hidden sm:inline">Status</span>
                                    <span className="sm:hidden font-medium">Status:</span>
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl shadow-blue-500/10">
                                {statuses.map((status) => (
                                    <SelectItem key={status} value={status} className="focus:bg-blue-50 focus:text-[#00ADE7] cursor-pointer rounded-lg my-1">
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Department Filter */}
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-white border-slate-200 rounded-xl shadow-sm hover:border-[#00ADE7]/50 focus:ring-4 focus:ring-[#00ADE7]/10 transition-all font-medium text-slate-600">
                                <div className="flex items-center gap-2 truncate">
                                    <Briefcase className="h-4 w-4 text-[#00ADE7]" />
                                    <span className="hidden sm:inline">Dept</span>
                                    <span className="sm:hidden font-medium">Dept:</span>
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl shadow-blue-500/10 max-h-[300px]">
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept} className="focus:bg-blue-50 focus:text-[#00ADE7] cursor-pointer rounded-lg my-1">
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Job Type Filter */}
                        <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                            <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white border-slate-200 rounded-xl shadow-sm hover:border-[#00ADE7]/50 focus:ring-4 focus:ring-[#00ADE7]/10 transition-all font-medium text-slate-600">
                                <div className="flex items-center gap-2 truncate">
                                    <Clock className="h-4 w-4 text-[#00ADE7]" />
                                    <span className="hidden sm:inline">Type</span>
                                    <span className="sm:hidden font-medium">Type:</span>
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl shadow-blue-500/10">
                                {jobTypes.map((type) => (
                                    <SelectItem key={type} value={type} className="focus:bg-blue-50 focus:text-[#00ADE7] cursor-pointer rounded-lg my-1">
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Job List */}
            <div className="grid gap-5">
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Search className="h-10 w-10 text-blue-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No positions found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">We couldn't find any jobs matching your current filters. Try adjusting your search or clearing filters.</p>
                        <Button
                            variant="outline"
                            className="rounded-full px-8 border-[#00ADE7] text-[#00ADE7] hover:bg-[#00ADE7] hover:text-white transition-all duration-300"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedDepartment("All");
                                setSelectedJobType("All");
                                setSelectedStatus("All");
                            }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                ) : (
                    filteredJobs.map((job) => {
                        const JobIcon = getJobIcon(job.title);

                        return (
                            <div
                                key={job.id}
                                className="group bg-white rounded-xl p-1 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 border border-slate-100 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row gap-6 p-6 items-start md:items-center">
                                    {/* Icon/Logo Placeholder */}
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E0F7FF] to-blue-50 text-[#00ADE7] flex items-center justify-center shrink-0 shadow-sm border border-blue-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        <JobIcon className="w-8 h-8 group-hover:text-[#0095c8] transition-colors" />
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <Link href={`/jobs/${job.slug}`} className="block w-fit">
                                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#00ADE7] transition-colors flex items-center gap-2">
                                                {job.title}
                                                {job.status === 'Active' && (
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                )}
                                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-[#00ADE7]" />
                                            </h3>
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                                                <Briefcase className="w-4 h-4 text-slate-400" />
                                                {job.department?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {job.jobType?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                {job.location?.name}
                                            </span>
                                            {job.status === 'Active' && job.expiryDate && (
                                                <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-md border border-orange-100">
                                                    <Clock className="w-4 h-4" />
                                                    Expires: {new Date(job.expiryDate).toLocaleDateString('en-GB')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto mt-4 md:mt-0">
                                        <Button
                                            asChild
                                            className={`w-full md:w-auto h-11 px-8 font-bold tracking-wide rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${job.status === 'Active'
                                                ? "!bg-[#00ADE7] !text-white hover:!bg-[#0095c8] shadow-blue-500/20 hover:shadow-blue-500/40 !border-none"
                                                : "!bg-white !text-slate-500 !border-2 !border-slate-100 hover:!border-slate-300 hover:!bg-slate-50 hover:!text-slate-700"
                                                }`}
                                        >
                                            <Link href={`/jobs/${job.slug}`}>
                                                {job.status === 'Active' ? 'Apply Now' : 'View Details'}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
