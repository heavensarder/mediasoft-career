'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteJobAction } from '@/lib/job-actions';

import ShareButton from '@/components/ShareButton';

interface JobActionsProps {
    jobId: number;
    jobSlug: string;
    jobTitle: string;
}

export default function JobActions({ jobId, jobSlug, jobTitle }: JobActionsProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteJobAction(jobId);
            if (result?.error) {
                alert(result.error);
            } else {
                router.refresh();
            }
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                <div className="mr-1">
                    <ShareButton title={jobTitle} url={`/jobs/${jobSlug}`} />
                </div>

                <Button variant="ghost" size="icon" asChild title="View Details">
                    <Link href={`/jobs/${jobSlug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>

                <Button variant="ghost" size="icon" asChild title="Edit Job">
                    <Link href={`/admin/dashboard/job-recruitment/edit-job/${jobId}`}>
                        <Edit className="h-4 w-4" />
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    title="Delete Job"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this job posting.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
