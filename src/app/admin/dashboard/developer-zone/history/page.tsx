"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    History,
    Search,
    Calendar,
    User,
    Activity,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Filter,
    RefreshCw,
    Briefcase,
    Settings,
    Users,
    ClipboardList,
    Trash2,
    Edit,
    Plus,
    Eye,
    LogIn,
    LogOut
} from "lucide-react";
import { getActivityLogs, getActivityStats, getUniqueActions, getUniqueUsers } from '@/lib/activity-log-actions';
import { formatDistanceToNow, format } from 'date-fns';

// Action color and icon mapping
const actionConfig: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
    CREATE_JOB: { color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: Plus, label: 'Created Job' },
    UPDATE_JOB: { color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Edit, label: 'Updated Job' },
    DELETE_JOB: { color: 'text-red-700', bgColor: 'bg-red-100', icon: Trash2, label: 'Deleted Job' },
    TOGGLE_JOB_STATUS: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Activity, label: 'Toggled Job Status' },
    UPDATE_APPLICATION_STATUS: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Users, label: 'Updated Application' },
    ADD_APPLICATION_NOTE: { color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: ClipboardList, label: 'Added Note' },
    SCHEDULE_INTERVIEW: { color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: Calendar, label: 'Scheduled Interview' },
    MARK_INTERVIEW: { color: 'text-teal-700', bgColor: 'bg-teal-100', icon: ClipboardList, label: 'Marked Interview' },
    CREATE_INTERVIEWER: { color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: Plus, label: 'Added Interviewer' },
    UPDATE_INTERVIEWER: { color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Edit, label: 'Updated Interviewer' },
    DELETE_INTERVIEWER: { color: 'text-red-700', bgColor: 'bg-red-100', icon: Trash2, label: 'Removed Interviewer' },
    UPDATE_SETTINGS: { color: 'text-slate-700', bgColor: 'bg-slate-100', icon: Settings, label: 'Updated Settings' },
    UPDATE_BRANDING: { color: 'text-pink-700', bgColor: 'bg-pink-100', icon: Eye, label: 'Updated Branding' },
    UPDATE_SEO: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: TrendingUp, label: 'Updated SEO' },
    LOGIN: { color: 'text-green-700', bgColor: 'bg-green-100', icon: LogIn, label: 'Logged In' },
    LOGOUT: { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: LogOut, label: 'Logged Out' },
};

const defaultActionConfig = { color: 'text-slate-700', bgColor: 'bg-slate-100', icon: Activity, label: 'Activity' };

interface ActivityLog {
    id: number;
    userId: number | null;
    userType: string;
    userName: string;
    userEmail: string;
    action: string;
    entityType: string | null;
    entityId: number | null;
    entityName: string | null;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Stats {
    todayCount: number;
    weekCount: number;
    totalCount: number;
    topActions: { action: string; count: number }[];
    recentUsers: { userName: string; userEmail: string }[];
}

export default function HistoryPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [uniqueActions, setUniqueActions] = useState<string[]>([]);
    const [uniqueUsers, setUniqueUsers] = useState<{ userName: string; userEmail: string }[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const loadData = useCallback(async () => {
        setIsLoading(true);

        const [logsResult, statsResult] = await Promise.all([
            getActivityLogs({
                page: currentPage,
                limit: 15,
                action: actionFilter || undefined,
                userEmail: userFilter || undefined,
                search: search || undefined,
            }),
            getActivityStats(),
        ]);

        if (logsResult.success) {
            setLogs(logsResult.logs as ActivityLog[]);
            setPagination(logsResult.pagination);
        }

        if (statsResult.success && statsResult.stats) {
            setStats(statsResult.stats);
        }

        setIsLoading(false);
    }, [currentPage, actionFilter, userFilter, search]);

    const loadFilters = async () => {
        const [actionsResult, usersResult] = await Promise.all([
            getUniqueActions(),
            getUniqueUsers(),
        ]);

        if (actionsResult.success) {
            setUniqueActions(actionsResult.actions);
        }

        if (usersResult.success) {
            setUniqueUsers(usersResult.users);
        }
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadFilters();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadData();
    };

    const clearFilters = () => {
        setSearch('');
        setActionFilter('');
        setUserFilter('');
        setCurrentPage(1);
    };

    const getActionConfig = (action: string) => {
        return actionConfig[action] || defaultActionConfig;
    };

    return (
        <div className="space-y-8 max-w-6xl pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-200">
                        <History className="h-7 w-7 text-white" />
                    </div>
                    Activity History
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Track and monitor all user activities across the platform.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className="rounded-xl shadow-lg overflow-hidden relative p-6"
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <p className="text-blue-100 font-semibold text-sm mb-2">Today's Activities</p>
                        <div className="text-5xl font-extrabold text-white">{stats?.todayCount ?? 0}</div>
                        <p className="text-blue-200 text-sm mt-2 font-medium">actions recorded</p>
                    </div>
                </div>

                <div
                    className="rounded-xl shadow-lg overflow-hidden relative p-6"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <p className="text-emerald-100 font-semibold text-sm mb-2">This Week</p>
                        <div className="text-5xl font-extrabold text-white">{stats?.weekCount ?? 0}</div>
                        <p className="text-emerald-200 text-sm mt-2 font-medium">activities logged</p>
                    </div>
                </div>

                <div
                    className="rounded-xl shadow-lg overflow-hidden relative p-6"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <p className="text-violet-100 font-semibold text-sm mb-2">Total Records</p>
                        <div className="text-5xl font-extrabold text-white">{stats?.totalCount ?? 0}</div>
                        <p className="text-violet-200 text-sm mt-2 font-medium">all-time activities</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-slate-500" />
                            <CardTitle className="text-lg">Filters</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-slate-500 hover:text-slate-700"
                        >
                            Clear All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by entity name or user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>

                        {/* Action Filter */}
                        <select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px]"
                        >
                            <option value="">All Actions</option>
                            {uniqueActions.map((action) => (
                                <option key={action} value={action}>
                                    {getActionConfig(action).label}
                                </option>
                            ))}
                        </select>

                        {/* User Filter */}
                        <select
                            value={userFilter}
                            onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px]"
                        >
                            <option value="">All Users</option>
                            {uniqueUsers.map((user) => (
                                <option key={user.userEmail} value={user.userEmail}>
                                    {user.userName}
                                </option>
                            ))}
                        </select>

                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Activity Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-slate-500" />
                            <CardTitle className="text-lg">Activity Log</CardTitle>
                            {pagination && (
                                <Badge variant="secondary" className="ml-2">
                                    {pagination.total} records
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadData}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <History className="h-12 w-12 mb-4 text-slate-300" />
                            <p className="text-lg font-medium">No activities found</p>
                            <p className="text-sm">Activities will appear here as users perform actions.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {logs.map((log) => {
                                const config = getActionConfig(log.action);
                                const IconComponent = config.icon;

                                return (
                                    <div
                                        key={log.id}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors group"
                                    >
                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm ring-2 ring-white shadow">
                                                {log.userName.charAt(0).toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Activity Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-slate-800">{log.userName}</span>
                                                <Badge className={`${config.bgColor} ${config.color} border-0 gap-1`}>
                                                    <IconComponent className="h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                                {log.entityName && (
                                                    <span className="text-slate-600">
                                                        <span className="text-slate-400">→</span> {log.entityName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                                <span>{log.userEmail}</span>
                                                {log.entityType && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="capitalize">{log.entityType}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <div className="flex-shrink-0 text-right">
                                            <div className="text-sm font-medium text-slate-600">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
                            <div className="text-sm text-slate-500">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                                    disabled={currentPage === pagination.totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
