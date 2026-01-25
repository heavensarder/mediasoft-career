'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Pencil,
    Trash2,
    FileText,
    Code,
    FolderKanban,
    UserCheck
} from 'lucide-react';
import { deleteInterviewer } from '@/lib/interviewer-actions';
import { toast } from 'sonner';
import InterviewerFormModal from './InterviewerFormModal';
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

interface Interviewer {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    markingPermissions: {
        writtenExam: boolean;
        technicalViva: boolean;
        project: boolean;
    } | null;
}

interface InterviewersClientProps {
    interviewers: Interviewer[];
}

export default function InterviewersClient({ interviewers }: InterviewersClientProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInterviewer, setEditingInterviewer] = useState<Interviewer | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    const handleAdd = () => {
        setEditingInterviewer(null);
        setIsFormOpen(true);
    };

    const handleEdit = (interviewer: Interviewer) => {
        setEditingInterviewer(interviewer);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);

        const result = await deleteInterviewer(deleteId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Interviewer deleted successfully');
        }

        setIsDeleting(false);
        setDeleteId(null);
    };

    const PermissionBadge = ({ enabled, icon: Icon, label, colorClass }: { enabled: boolean; icon: any; label: string; colorClass: string }) => (
        <Badge
            variant={enabled ? 'default' : 'outline'}
            className={enabled 
                ? `gap-1 ${colorClass} border-0` 
                : 'gap-1 opacity-50 bg-slate-50 text-slate-400 border-slate-200'
            }
        >
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );

    const renderCard = (interviewer: Interviewer) => (
        <div key={interviewer.id} className="premium-glass-card p-5 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between min-h-[220px]">
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md transform group-hover:scale-105 transition-transform duration-300">
                            {interviewer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 line-clamp-1" title={interviewer.name}>{interviewer.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1" title={interviewer.email}>{interviewer.email}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marking Access</p>
                    <div className="flex flex-wrap gap-2">
                        <PermissionBadge
                            enabled={interviewer.markingPermissions?.writtenExam ?? false}
                            icon={FileText}
                            label="Written"
                            colorClass="bg-blue-100 text-blue-700 hover:bg-blue-200"
                        />
                        <PermissionBadge
                            enabled={interviewer.markingPermissions?.technicalViva ?? false}
                            icon={Code}
                            label="Technical"
                            colorClass="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        />
                        <PermissionBadge
                            enabled={interviewer.markingPermissions?.project ?? false}
                            icon={FolderKanban}
                            label="Project"
                            colorClass="bg-amber-100 text-amber-700 hover:bg-amber-200"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <span className="text-xs text-slate-400 font-medium">
                    Since {format(new Date(interviewer.createdAt), 'MMM d, yyyy')}
                </span>
                <div className="flex gap-1 opactiy-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(interviewer)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(interviewer.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="premium-bg min-h-screen text-slate-800 p-4 sm:p-8 -m-4 sm:-m-6 md:-m-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm flex items-center gap-3">
                        Interviewer Management
                        <Badge variant="secondary" className="text-lg px-3 py-0.5 rounded-full bg-white/50 text-slate-600">
                            {interviewers.length}
                        </Badge>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg max-w-2xl">
                        Manage interview admin users, configure their roles, and set precise marking permissions for each exam section.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 self-start lg:self-auto">
                    {/* View Toggle */}
                    <div className="flex bg-white/60 rounded-lg p-1 border border-white/50 shadow-sm">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            className="gap-1.5 h-9"
                            onClick={() => setViewMode('list')}
                        >
                            <FileText className="h-4 w-4" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className="gap-1.5 h-9"
                            onClick={() => setViewMode('grid')}
                        >
                            <FolderKanban className="h-4 w-4" />
                            Grid
                        </Button>
                    </div>

                    <Button onClick={handleAdd} className="gap-2 h-11 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all premium-btn">
                        <Plus className="h-5 w-5" />
                        Add Interviewer
                    </Button>
                </div>
            </div>

            {/* Content */}
            {interviewers.length === 0 ? (
                <div className="premium-glass-card p-16 text-center flex flex-col items-center justify-center">
                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <UserCheck className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Interviewers Found</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Get started by adding your first interviewer. They will be able to mark candidates based on the permissions you set.
                    </p>
                    <Button onClick={handleAdd} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Interviewer
                    </Button>
                </div>
            ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {interviewers.map(renderCard)}
                </div>
            ) : (
                // List View
                <div className="premium-glass-card p-0 overflow-hidden animate-in fade-in duration-500">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-100/50">
                                <TableHead className="font-semibold py-4 pl-6">Interviewer</TableHead>
                                <TableHead className="font-semibold py-4">Marking Permissions</TableHead>
                                <TableHead className="font-semibold py-4">Created</TableHead>
                                <TableHead className="font-semibold py-4 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interviewers.map((interviewer) => (
                                <TableRow key={interviewer.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                {interviewer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">{interviewer.name}</p>
                                                <p className="text-xs text-muted-foreground">{interviewer.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <PermissionBadge
                                                enabled={interviewer.markingPermissions?.writtenExam ?? false}
                                                icon={FileText}
                                                label="Written"
                                                colorClass="bg-blue-50 text-blue-700 border-blue-200"
                                            />
                                            <PermissionBadge
                                                enabled={interviewer.markingPermissions?.technicalViva ?? false}
                                                icon={Code}
                                                label="Technical"
                                                colorClass="bg-emerald-50 text-emerald-700 border-emerald-200"
                                            />
                                            <PermissionBadge
                                                enabled={interviewer.markingPermissions?.project ?? false}
                                                icon={FolderKanban}
                                                label="Project"
                                                colorClass="bg-amber-50 text-amber-700 border-amber-200"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground py-4">
                                        {format(new Date(interviewer.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                                onClick={() => handleEdit(interviewer)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => setDeleteId(interviewer.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Form Modal */}
            <InterviewerFormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                interviewer={editingInterviewer}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Interviewer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the interviewer account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
