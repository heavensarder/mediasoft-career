'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createInterviewer, updateInterviewer } from '@/lib/interviewer-actions';
import { toast } from 'sonner';
import { Loader2, User, Mail, Lock, FileText, Code, FolderKanban } from 'lucide-react';

interface Interviewer {
    id: number;
    name: string;
    email: string;
    markingPermissions: {
        writtenExam: boolean;
        technicalViva: boolean;
        project: boolean;
    } | null;
}

interface InterviewerFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    interviewer: Interviewer | null;
}

export default function InterviewerFormModal({
    open,
    onOpenChange,
    interviewer,
}: InterviewerFormModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [writtenExam, setWrittenExam] = useState(false);
    const [technicalViva, setTechnicalViva] = useState(false);
    const [project, setProject] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!interviewer;

    useEffect(() => {
        if (interviewer) {
            setName(interviewer.name);
            setEmail(interviewer.email);
            setPassword('');
            setWrittenExam(interviewer.markingPermissions?.writtenExam ?? false);
            setTechnicalViva(interviewer.markingPermissions?.technicalViva ?? false);
            setProject(interviewer.markingPermissions?.project ?? false);
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setWrittenExam(false);
            setTechnicalViva(false);
            setProject(false);
        }
    }, [interviewer, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const permissions = { writtenExam, technicalViva, project };

            if (isEditing) {
                const result = await updateInterviewer(interviewer.id, {
                    name,
                    email,
                    password: password || undefined,
                    permissions,
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Interviewer updated successfully');
                    onOpenChange(false);
                }
            } else {
                if (!password) {
                    toast.error('Password is required for new interviewers');
                    setIsLoading(false);
                    return;
                }

                const result = await createInterviewer({
                    name,
                    email,
                    password,
                    permissions,
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Interviewer created successfully');
                    onOpenChange(false);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Interviewer' : 'Add New Interviewer'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Password
                            {isEditing && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isEditing ? '••••••••' : 'Enter password'}
                            required={!isEditing}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-medium">Marking Permissions</Label>
                        <p className="text-sm text-muted-foreground">
                            Select which sections this interviewer can mark
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="writtenExam"
                                    checked={writtenExam}
                                    onCheckedChange={(checked) => setWrittenExam(!!checked)}
                                />
                                <Label htmlFor="writtenExam" className="flex items-center gap-2 cursor-pointer">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Written Exam (0-30)
                                </Label>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="technicalViva"
                                    checked={technicalViva}
                                    onCheckedChange={(checked) => setTechnicalViva(!!checked)}
                                />
                                <Label htmlFor="technicalViva" className="flex items-center gap-2 cursor-pointer">
                                    <Code className="h-4 w-4 text-muted-foreground" />
                                    Technical Viva (0-10)
                                </Label>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="project"
                                    checked={project}
                                    onCheckedChange={(checked) => setProject(!!checked)}
                                />
                                <Label htmlFor="project" className="flex items-center gap-2 cursor-pointer">
                                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                    Project (Star Rating)
                                </Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
