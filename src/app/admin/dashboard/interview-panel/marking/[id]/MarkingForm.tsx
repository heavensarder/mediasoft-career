'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { saveMarking } from '@/lib/interview-actions';
import { toast } from 'sonner';
import { Loader2, Save, FileText, Code, FolderKanban, ShieldAlert, Ban } from 'lucide-react';
import StarRating from '@/components/admin/StarRating';

interface MarkingFormProps {
    applicationId: number;
    initialMarking: {
        writtenExam: number | null;
        technicalViva: number | null;
        projectRating: number | null;
        excludeWritten?: boolean;
        excludeTechnical?: boolean;
        excludeProject?: boolean;
    } | null;
    permissions: {
        writtenExam: boolean;
        technicalViva: boolean;
        project: boolean;
    };
    userRole: 'admin' | 'interview_admin';
}

export default function MarkingForm({
    applicationId,
    initialMarking,
    permissions,
    userRole
}: MarkingFormProps) {
    const [writtenExam, setWrittenExam] = useState(initialMarking?.writtenExam ?? 0);
    const [technicalViva, setTechnicalViva] = useState(initialMarking?.technicalViva ?? 0);
    const [projectRating, setProjectRating] = useState(initialMarking?.projectRating ?? 0);
    const [excludeWritten, setExcludeWritten] = useState(initialMarking?.excludeWritten ?? false);
    const [excludeTechnical, setExcludeTechnical] = useState(initialMarking?.excludeTechnical ?? false);
    const [excludeProject, setExcludeProject] = useState(initialMarking?.excludeProject ?? false);
    const [isLoading, setIsLoading] = useState(false);

    const isMainAdmin = userRole === 'admin';

    // Check if user has access to any section
    const hasWrittenAccess = permissions.writtenExam || isMainAdmin;
    const hasTechnicalAccess = permissions.technicalViva || isMainAdmin;
    const hasProjectAccess = permissions.project || isMainAdmin;
    const hasAnyPermission = hasWrittenAccess || hasTechnicalAccess || hasProjectAccess;

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const scores: any = {};
            if (hasWrittenAccess) scores.writtenExam = writtenExam;
            if (hasTechnicalAccess) scores.technicalViva = technicalViva;
            if (hasProjectAccess) scores.projectRating = projectRating;

            // Include exclusion flags (only super admin can set these)
            if (isMainAdmin) {
                scores.excludeWritten = excludeWritten;
                scores.excludeTechnical = excludeTechnical;
                scores.excludeProject = excludeProject;
            }

            const result = await saveMarking(applicationId, scores);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Marks saved successfully');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total only for visible sections, respecting exclusions
    const totalScore =
        (hasWrittenAccess && !excludeWritten ? writtenExam : 0) +
        (hasTechnicalAccess && !excludeTechnical ? technicalViva : 0) +
        (hasProjectAccess && !excludeProject ? (projectRating * 2) : 0);
    const maxScore =
        (hasWrittenAccess && !excludeWritten ? 30 : 0) +
        (hasTechnicalAccess && !excludeTechnical ? 10 : 0) +
        (hasProjectAccess && !excludeProject ? 10 : 0);

    const SectionCard = ({
        title,
        icon: Icon,
        children
    }: {
        title: string;
        icon: any;
        children: React.ReactNode
    }) => (
        <div className="rounded-xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-lg p-6 transition-all">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            {children}
        </div>
    );

    // If interview admin has no permissions at all
    if (!hasAnyPermission) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
                <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-amber-800 mb-2">No Marking Permissions</h3>
                <p className="text-amber-600">
                    You don't have permission to mark any sections for this applicant.
                    Please contact the administrator to request access.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Written Exam Section - Only show if has access */}
            {hasWrittenAccess && (
                <SectionCard title="Written Exam" icon={FileText}>
                    <div className={`space-y-4 ${excludeWritten ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                            <Label>Score (0-30)</Label>
                            <span className={`text-2xl font-bold ${excludeWritten ? 'text-slate-400 line-through' : writtenExam >= 15 ? 'text-green-600' : 'text-red-600'}`}>{writtenExam}</span>
                        </div>
                        <Slider
                            value={[writtenExam]}
                            onValueChange={([value]: number[]) => setWrittenExam(value)}
                            max={30}
                            step={1}
                            className="py-4"
                            disabled={excludeWritten}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>10</span>
                            <span>20</span>
                            <span>30</span>
                        </div>
                    </div>
                    {/* Don't Include checkbox - Super Admin only */}
                    {isMainAdmin && (
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
                            <Checkbox
                                id="excludeWritten"
                                checked={excludeWritten}
                                onCheckedChange={(checked) => setExcludeWritten(checked === true)}
                            />
                            <Label htmlFor="excludeWritten" className="text-sm text-red-600 flex items-center gap-1 cursor-pointer">
                                <Ban className="h-3.5 w-3.5" />
                                Don't Include
                            </Label>
                        </div>
                    )}
                </SectionCard>
            )}

            {/* Technical Viva Section - Only show if has access */}
            {hasTechnicalAccess && (
                <SectionCard title="Technical Viva" icon={Code}>
                    <div className={`space-y-4 ${excludeTechnical ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                            <Label>Score (0-10)</Label>
                            <span className={`text-2xl font-bold ${excludeTechnical ? 'text-slate-400 line-through' : technicalViva >= 6 ? 'text-green-600' : 'text-red-600'}`}>{technicalViva}</span>
                        </div>
                        <Slider
                            value={[technicalViva]}
                            onValueChange={([value]: number[]) => setTechnicalViva(value)}
                            max={10}
                            step={1}
                            className="py-4"
                            disabled={excludeTechnical}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>
                    {/* Don't Include checkbox - Super Admin only */}
                    {isMainAdmin && (
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
                            <Checkbox
                                id="excludeTechnical"
                                checked={excludeTechnical}
                                onCheckedChange={(checked) => setExcludeTechnical(checked === true)}
                            />
                            <Label htmlFor="excludeTechnical" className="text-sm text-red-600 flex items-center gap-1 cursor-pointer">
                                <Ban className="h-3.5 w-3.5" />
                                Don't Include
                            </Label>
                        </div>
                    )}
                </SectionCard>
            )}

            {/* Project Section - Only show if has access */}
            {hasProjectAccess && (
                <SectionCard title="Project Evaluation" icon={FolderKanban}>
                    <div className={`space-y-4 ${excludeProject ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                            <Label>Rating (1-5 Stars)</Label>
                            <span className={`text-lg font-medium ${excludeProject ? 'text-slate-400 line-through' : 'text-muted-foreground'}`}>
                                {projectRating > 0 ? `${projectRating} / 5` : 'Not rated'}
                            </span>
                        </div>
                        <div className="flex justify-center py-2">
                            <StarRating
                                value={projectRating}
                                onChange={setProjectRating}
                                disabled={excludeProject}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Each star = 2 points (Max: 10 points)
                        </p>
                    </div>
                    {/* Don't Include checkbox - Super Admin only */}
                    {isMainAdmin && (
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
                            <Checkbox
                                id="excludeProject"
                                checked={excludeProject}
                                onCheckedChange={(checked) => setExcludeProject(checked === true)}
                            />
                            <Label htmlFor="excludeProject" className="text-sm text-red-600 flex items-center gap-1 cursor-pointer">
                                <Ban className="h-3.5 w-3.5" />
                                Don't Include in Total
                            </Label>
                        </div>
                    )}
                </SectionCard>
            )}

            {/* Total Score - Only for visible sections */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Your Total Score</span>
                    <span className="text-3xl font-bold text-primary">
                        {totalScore} / {maxScore}
                    </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                    {hasWrittenAccess && `Written: ${writtenExam}`}
                    {hasWrittenAccess && hasTechnicalAccess && ' + '}
                    {hasTechnicalAccess && `Technical: ${technicalViva}`}
                    {(hasWrittenAccess || hasTechnicalAccess) && hasProjectAccess && ' + '}
                    {hasProjectAccess && `Project: ${projectRating * 2}`}
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Marks
                </Button>
            </div>
        </div>
    );
}

