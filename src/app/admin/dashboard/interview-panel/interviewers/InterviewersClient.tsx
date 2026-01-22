'use client';

import { useState } from 'react';
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

    const PermissionBadge = ({ enabled, icon: Icon, label }: { enabled: boolean; icon: any; label: string }) => (
        <Badge
            variant={enabled ? 'default' : 'outline'}
            className={`gap-1 ${enabled ? '' : 'opacity-40'}`}
        >
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );

    return (
        <div className="premium-bg min-h-screen text-slate-800 p-4 sm:p-8 -m-4 sm:-m-6 md:-m-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">
                        Interviewer Management
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">
                        Manage interview admin users and their marking permissions
                    </p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Interviewer
                </Button>
            </div>

            {/* Table */}
            <div className="premium-glass-card p-0 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-white/20 hover:bg-white/30">
                            <TableHead className="font-semibold">Interviewer</TableHead>
                            <TableHead className="font-semibold">Marking Permissions</TableHead>
                            <TableHead className="font-semibold">Created</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interviewers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <UserCheck className="h-8 w-8 opacity-50" />
                                        <p>No interviewers found. Add your first interviewer to get started.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            interviewers.map((interviewer) => (
                                <TableRow key={interviewer.id} className="hover:bg-white/30 transition-colors">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{interviewer.name}</p>
                                            <p className="text-sm text-muted-foreground">{interviewer.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            <PermissionBadge
                                                enabled={interviewer.markingPermissions?.writtenExam ?? false}
                                                icon={FileText}
                                                label="Written"
                                            />
                                            <PermissionBadge
                                                enabled={interviewer.markingPermissions?.technicalViva ?? false}
                                                icon={Code}
                                                label="Technical"
                                            />
                                            <PermissionBadge
                                                enabled={interviewer.markingPermissions?.project ?? false}
                                                icon={FolderKanban}
                                                label="Project"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(interviewer.createdAt).toISOString().split('T')[0]}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(interviewer)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteId(interviewer.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

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
