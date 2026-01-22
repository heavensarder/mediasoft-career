'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Star,
    AlertTriangle,
    LayoutGrid,
    LayoutList,
    ChevronDown,
    StopCircle,
    UserPlus
} from 'lucide-react';
import { updateInterviewStatus, setInterviewDate, endInterviews, assignInterviewers } from '@/lib/interview-actions';
import { toast } from 'sonner';
import InterviewDateModal from '@/components/admin/InterviewDateModal';
import InterviewPDFExport from '@/components/admin/InterviewPDFExport';

interface Interviewer {
    id: number;
    name: string;
}

interface Application {
    id: number;
    fullName: string;
    email: string;
    mobile: string;
    photo: string | null;
    interviewDate: Date | null;
    status: string;
    totalScore: number;
    assignedInterviewerIds: number[];
    assignedInterviewers?: Array<{ interviewer: { id: number; name: string } }>;
    job: {
        id: number;
        title: string;
    };
    interviewMarking: {
        writtenExam: number | null;
        technicalViva: number | null;
        projectRating: number | null;
    } | null;
}

interface InterviewPanelClientProps {
    applications: Application[];
    userRole: 'admin' | 'interview_admin';
    userId?: string;
    interviewers?: Interviewer[];
}

const STATUS_OPTIONS = ['Interview', 'Selected', 'Rejected'];

export default function InterviewPanelClient({
    applications,
    userRole,
    userId,
    interviewers = []
}: InterviewPanelClientProps) {
    const [dateModalOpen, setDateModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
    const [selectedAppDate, setSelectedAppDate] = useState<Date | null>(null);
    const [selectedAppInterviewerId, setSelectedAppInterviewerId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Rejection confirmation state
    const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
    const [pendingReject, setPendingReject] = useState<{ id: number; name: string } | null>(null);

    // End Interview state
    const [endInterviewOpen, setEndInterviewOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<string>('all');

    // Assign interviewer state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assigningApp, setAssigningApp] = useState<Application | null>(null);
    const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);

    const isAdmin = userRole === 'admin';

    // Filter applications for interview admin (only assigned ones)
    const filteredApplications = useMemo(() => {
        if (isAdmin) return applications;
        const userIdNum = parseInt(userId || '0');
        return applications.filter(app =>
            app.assignedInterviewerIds?.includes(userIdNum)
        );
    }, [applications, isAdmin, userId]);

    // Group applications by job position
    const groupedByPosition = useMemo(() => {
        const groups: Record<string, Application[]> = {};
        filteredApplications.forEach(app => {
            const key = app.job.title;
            if (!groups[key]) groups[key] = [];
            groups[key].push(app);
        });
        // Sort each group by totalScore descending
        Object.values(groups).forEach(group => {
            group.sort((a, b) => b.totalScore - a.totalScore);
        });
        return groups;
    }, [filteredApplications]);

    // Get unique job positions
    const jobPositions = useMemo(() => Object.keys(groupedByPosition), [groupedByPosition]);

    // Initialize all sections as expanded
    useState(() => {
        setExpandedSections(new Set(jobPositions));
    });

    const toggleSection = (title: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(title)) {
            newSet.delete(title);
        } else {
            newSet.add(title);
        }
        setExpandedSections(newSet);
    };

    const handleStatusChange = async (id: number, status: string, name: string) => {
        if (status === 'Rejected') {
            setPendingReject({ id, name });
            setRejectConfirmOpen(true);
            return;
        }

        const result = await updateInterviewStatus(id, status as any);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Status updated to ${status}`);
        }
    };

    const handleConfirmReject = async () => {
        if (!pendingReject) return;

        const result = await updateInterviewStatus(pendingReject.id, 'Rejected');
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`${pendingReject.name} has been rejected`);
        }

        setRejectConfirmOpen(false);
        setPendingReject(null);
    };

    const handleEndInterview = async () => {
        const jobId = selectedPosition === 'all' ? null : parseInt(selectedPosition);
        const result = await endInterviews(jobId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message || 'Interviews ended successfully');
        }

        setEndInterviewOpen(false);
        setSelectedPosition('all');
    };

    const handleAssignInterviewers = async () => {
        if (!assigningApp) return;

        const ids = selectedInterviewers.map(id => parseInt(id));
        const result = await assignInterviewers(assigningApp.id, ids);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Assigned to ${ids.length} interviewer(s) successfully`);
        }

        setAssignModalOpen(false);
        setAssigningApp(null);
        setSelectedInterviewers([]);
    };

    const handleDateClick = (app: Application) => {
        if (!isAdmin) return; // Only admin can change dates
        setSelectedAppId(app.id);
        setSelectedAppDate(app.interviewDate);
        setDateModalOpen(true);
    };

    const handleDateSave = async (date: Date | null) => {
        if (selectedAppId) {
            // Update date only
            const dateResult = await setInterviewDate(selectedAppId, date);
            if (dateResult.error) {
                toast.error(dateResult.error);
            } else {
                toast.success('Interview date updated');
            }
        }
        setDateModalOpen(false);
        setSelectedAppId(null);
        setSelectedAppDate(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Interview': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Selected': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Shortlisted': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getWrittenExamColor = (score: number | null) => {
        if (score === null) return '';
        return score >= 15 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
    };

    const getTechnicalVivaColor = (score: number | null) => {
        if (score === null) return '';
        return score >= 6 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
    };

    const renderStars = (rating: number | null) => {
        if (rating === null) return <span className="text-muted-foreground text-xs">—</span>;
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    // Check if marking is enabled (interview day or after)
    const isMarkingEnabled = (interviewDate: Date | null) => {
        if (!interviewDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const interview = new Date(interviewDate);
        interview.setHours(0, 0, 0, 0);
        return today >= interview;
    };

    // Render single applicant row
    const renderApplicantRow = (app: Application) => (
        <TableRow key={app.id} className="hover:bg-white/30 transition-colors">
            <TableCell>
                <div className="flex items-center gap-3">
                    {app.photo ? (
                        <img src={app.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {app.fullName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="font-medium">{app.fullName}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                {isAdmin ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs"
                        onClick={() => handleDateClick(app)}
                    >
                        <Calendar className="h-3 w-3" />
                        {app.interviewDate
                            ? format(new Date(app.interviewDate), 'MMM d, yyyy h:mm a')
                            : <span className="text-muted-foreground italic">Not Scheduled</span>
                        }
                    </Button>
                ) : (
                    <span className="text-sm">
                        {app.interviewDate
                            ? format(new Date(app.interviewDate), 'MMM d, yyyy h:mm a')
                            : <span className="text-muted-foreground italic">Not Scheduled</span>
                        }
                    </span>
                )}
            </TableCell>
            <TableCell className={`text-center ${getWrittenExamColor(app.interviewMarking?.writtenExam ?? null)}`}>
                {app.interviewMarking?.writtenExam ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className={`text-center ${getTechnicalVivaColor(app.interviewMarking?.technicalViva ?? null)}`}>
                {app.interviewMarking?.technicalViva ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="text-center">
                {renderStars(app.interviewMarking?.projectRating ?? null)}
            </TableCell>
            <TableCell className="text-center">
                <Badge variant="secondary" className="font-bold">
                    {app.totalScore}<span className="text-muted-foreground font-normal">/50</span>
                </Badge>
            </TableCell>
            <TableCell>
                {isAdmin ? (
                    <Select
                        value={app.status}
                        onValueChange={(value) => handleStatusChange(app.id, value, app.fullName)}
                    >
                        <SelectTrigger className={`w-[120px] h-8 text-xs font-medium border ${getStatusColor(app.status)}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Badge className={`${getStatusColor(app.status)} border`}>
                        {app.status}
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <div className="flex justify-end gap-2">
                    {isAdmin && (
                        <Button
                            variant="outline"
                            size="sm"
                            className={`text-xs border-0 text-white hover:text-white shadow-sm ${app.assignedInterviewerIds?.length > 0
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'}`}
                            onClick={() => {
                                setAssigningApp(app);
                                setSelectedInterviewers(app.assignedInterviewerIds?.map(id => id.toString()) || []);
                                setAssignModalOpen(true);
                            }}
                        >
                            <UserPlus className="h-3 w-3 mr-1" />
                            {app.assignedInterviewerIds?.length > 0 ? `Assigned (${app.assignedInterviewerIds.length})` : 'Assign'}
                        </Button>
                    )}
                    <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-gradient-to-r from-slate-500 to-slate-600 border-0 text-white hover:text-white hover:from-slate-600 hover:to-slate-700 shadow-sm"
                        >
                            View Details
                        </Button>
                    </Link>
                    {isMarkingEnabled(app.interviewDate) ? (
                        <Link href={`/admin/dashboard/interview-panel/marking/${app.id}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 border-0 text-white hover:text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm"
                            >
                                Set Mark
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-gradient-to-r from-gray-300 to-gray-400 border-0 text-white/80 cursor-not-allowed opacity-60 shadow-sm"
                            disabled
                            title={app.interviewDate ? "Available on interview day" : "No interview scheduled"}
                        >
                            Set Mark
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow >
    );

    // Render single applicant card (grid view)
    const renderApplicantCard = (app: Application) => (
        <div key={app.id} className="premium-glass-card p-4 hover:shadow-xl transition-all">
            <div className="flex items-start gap-4 mb-4">
                {app.photo ? (
                    <img src={app.photo} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-white" />
                ) : (
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold ring-2 ring-white">
                        {app.fullName.charAt(0)}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{app.fullName}</h3>
                    <p className="text-xs text-slate-500 truncate">{app.email}</p>
                    <Badge className={`${getStatusColor(app.status)} mt-2 border text-xs`}>
                        {app.status}
                    </Badge>
                </div>
                <Badge variant="secondary" className="font-bold text-lg px-3 py-1">
                    {app.totalScore}<span className="text-muted-foreground font-normal text-sm">/50</span>
                </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-4 p-3 bg-white/50 rounded-lg">
                <div>
                    <p className="text-xs text-slate-500">Written</p>
                    <p className={`font-bold ${getWrittenExamColor(app.interviewMarking?.writtenExam ?? null)}`}>
                        {app.interviewMarking?.writtenExam ?? '—'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Technical</p>
                    <p className={`font-bold ${getTechnicalVivaColor(app.interviewMarking?.technicalViva ?? null)}`}>{app.interviewMarking?.technicalViva ?? '—'}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Project</p>
                    <div className="flex justify-center">
                        {renderStars(app.interviewMarking?.projectRating ?? null)}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {isAdmin && (
                    <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs border-0 text-white hover:text-white shadow-sm ${app.assignedInterviewerIds?.length > 0
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                            : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'}`}
                        onClick={() => {
                            setAssigningApp(app);
                            setSelectedInterviewers(app.assignedInterviewerIds?.map(id => id.toString()) || []);
                            setAssignModalOpen(true);
                        }}
                    >
                        <UserPlus className="h-3 w-3 mr-1" />
                        {app.assignedInterviewerIds?.length > 0 ? `Assigned (${app.assignedInterviewerIds.length})` : 'Assign'}
                    </Button>
                )}
                <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs bg-gradient-to-r from-slate-500 to-slate-600 border-0 text-white hover:text-white hover:from-slate-600 hover:to-slate-700 shadow-sm">
                        View Details
                    </Button>
                </Link>
                {isMarkingEnabled(app.interviewDate) ? (
                    <Link href={`/admin/dashboard/interview-panel/marking/${app.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs bg-gradient-to-r from-blue-500 to-indigo-600 border-0 text-white hover:text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm">
                            Set Mark
                        </Button>
                    </Link>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs bg-gradient-to-r from-gray-300 to-gray-400 border-0 text-white/80 cursor-not-allowed opacity-60 shadow-sm"
                        disabled
                        title={app.interviewDate ? "Available on interview day" : "No interview scheduled"}
                    >
                        Set Mark
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <div className="premium-bg min-h-screen text-slate-800 p-4 sm:p-8 -m-4 sm:-m-6 md:-m-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">
                        Interview Panel
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">
                        {isAdmin
                            ? 'Manage interview applicants, schedule interviews, and enter marks'
                            : 'View and mark your assigned applicants'
                        }
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-white/60 rounded-lg p-1 border border-white/50">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            className="gap-1"
                            onClick={() => setViewMode('list')}
                        >
                            <LayoutList className="h-4 w-4" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className="gap-1"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Grid
                        </Button>
                    </div>

                    {/* Admin-only buttons */}
                    {isAdmin && (
                        <>
                            <Button
                                variant="outline"
                                className="gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                onClick={() => setEndInterviewOpen(true)}
                            >
                                <StopCircle className="h-4 w-4" />
                                End Interview
                            </Button>
                            <InterviewPDFExport applications={filteredApplications} />
                        </>
                    )}
                </div>
            </div>

            {/* Content by Job Position */}
            {filteredApplications.length === 0 ? (
                <div className="premium-glass-card p-12 text-center">
                    <p className="text-muted-foreground">
                        {isAdmin
                            ? "No interview applicants found. Change an applicant's status to \"Interview\" to see them here."
                            : "No applicants assigned to you yet."
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {jobPositions.map(position => (
                        <Collapsible
                            key={position}
                            open={expandedSections.has(position) || expandedSections.size === 0}
                            onOpenChange={() => toggleSection(position)}
                        >
                            <div className="premium-glass-card overflow-hidden">
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.has(position) || expandedSections.size === 0 ? '' : '-rotate-90'
                                                }`} />
                                            <h2 className="text-xl font-bold text-slate-800">{position}</h2>
                                            <Badge variant="secondary">{groupedByPosition[position].length} applicants</Badge>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                                    onClick={() => {
                                                        const jobId = applications.find(a => a.job.title === position)?.job.id;
                                                        if (jobId) {
                                                            setSelectedPosition(jobId.toString());
                                                            setEndInterviewOpen(true);
                                                        }
                                                    }}
                                                >
                                                    <StopCircle className="h-3 w-3 mr-1" />
                                                    End
                                                </Button>
                                                <InterviewPDFExport
                                                    applications={groupedByPosition[position]}
                                                    positionTitle={position}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    {viewMode === 'list' ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-white/20 hover:bg-white/30">
                                                    <TableHead className="font-semibold">Applicant</TableHead>
                                                    <TableHead className="font-semibold">Interview Date</TableHead>
                                                    <TableHead className="font-semibold text-center">Written (30)</TableHead>
                                                    <TableHead className="font-semibold text-center">Technical (10)</TableHead>
                                                    <TableHead className="font-semibold text-center">Project (★)</TableHead>
                                                    <TableHead className="font-semibold text-center">Total</TableHead>
                                                    <TableHead className="font-semibold">Status</TableHead>
                                                    <TableHead className="font-semibold text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {groupedByPosition[position].map(renderApplicantRow)}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                                            {groupedByPosition[position].map(renderApplicantCard)}
                                        </div>
                                    )}
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    ))}
                </div>
            )}

            {/* Interview Date Modal */}
            <InterviewDateModal
                open={dateModalOpen}
                onOpenChange={setDateModalOpen}
                currentDate={selectedAppDate}
                onSave={handleDateSave}
                mode="edit"
                isAdmin={isAdmin}
                interviewers={interviewers}
                currentInterviewerId={selectedAppInterviewerId}
            />

            {/* Rejection Confirmation Dialog */}
            <AlertDialog open={rejectConfirmOpen} onOpenChange={setRejectConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Confirm Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject <strong>{pendingReject?.name}</strong>?
                            This will update their status to Rejected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingReject(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmReject}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Reject Applicant
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* End Interview Dialog */}
            <AlertDialog open={endInterviewOpen} onOpenChange={setEndInterviewOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <StopCircle className="h-5 w-5 text-red-500" />
                            End Interview
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove applicants from the Interview Panel (change status from "Interview").
                            Select which position to end interviews for.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Positions</SelectItem>
                                {jobPositions.map(pos => (
                                    <SelectItem key={pos} value={applications.find(a => a.job.title === pos)?.job.id.toString() || pos}>
                                        {pos}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEndInterview}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            End Interview
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assign Interviewers Dialog */}
            <AlertDialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-violet-500" />
                            Assign to Interviewers
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Assign <strong>{assigningApp?.fullName}</strong> to one or more interviewers.
                            Selected interviewers will be able to see and mark this applicant.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
                        {interviewers.map(i => (
                            <label key={i.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedInterviewers.includes(i.id.toString())}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedInterviewers([...selectedInterviewers, i.id.toString()]);
                                        } else {
                                            setSelectedInterviewers(selectedInterviewers.filter(id => id !== i.id.toString()));
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                />
                                <span className="text-sm font-medium">{i.name}</span>
                            </label>
                        ))}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setAssigningApp(null);
                            setSelectedInterviewers([]);
                        }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAssignInterviewers}
                            className="bg-violet-600 text-white hover:bg-violet-700"
                        >
                            Assign ({selectedInterviewers.length})
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
