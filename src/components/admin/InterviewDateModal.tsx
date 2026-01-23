'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, ArrowRight, UserPlus } from 'lucide-react';

interface Interviewer {
    id: number;
    name: string;
}

interface InterviewDateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentDate?: Date | null;
    onSave: (date: Date | null, interviewerId?: number | null) => void;
    mode: 'status_change' | 'edit';
    isAdmin?: boolean;
    interviewers?: Interviewer[];
    currentInterviewerId?: number | null;
}

export default function InterviewDateModal({
    open,
    onOpenChange,
    currentDate,
    onSave,
    mode,
    isAdmin = false,
    interviewers = [],
    currentInterviewerId = null,
}: InterviewDateModalProps) {
    const [date, setDate] = useState(
        currentDate ? new Date(currentDate).toISOString().slice(0, 10) : ''
    );
    const [time, setTime] = useState(
        currentDate ? new Date(currentDate).toTimeString().slice(0, 5) : '10:00'
    );
    const [selectedInterviewer, setSelectedInterviewer] = useState<string>(
        currentInterviewerId ? currentInterviewerId.toString() : ''
    );
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setDate(currentDate ? new Date(currentDate).toISOString().slice(0, 10) : '');
            setTime(currentDate ? new Date(currentDate).toTimeString().slice(0, 5) : '10:00');
            setSelectedInterviewer(currentInterviewerId ? currentInterviewerId.toString() : '');
        }
    }, [open, currentDate, currentInterviewerId]);

    const handleSetNow = async () => {
        if (!date) {
            return;
        }
        setIsLoading(true);
        const dateTime = new Date(`${date}T${time}`);
        const interviewerId = selectedInterviewer ? parseInt(selectedInterviewer) : null;
        await onSave(dateTime, interviewerId);
        setIsLoading(false);
    };

    const handleSetLater = async () => {
        setIsLoading(true);
        const interviewerId = selectedInterviewer ? parseInt(selectedInterviewer) : null;
        await onSave(null, interviewerId);
        setIsLoading(false);
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        const interviewerId = selectedInterviewer ? parseInt(selectedInterviewer) : null;
        if (date) {
            const dateTime = new Date(`${date}T${time}`);
            await onSave(dateTime, interviewerId);
        } else {
            await onSave(null, interviewerId);
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {mode === 'status_change' ? 'Schedule Interview' : 'Update Interview Date'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'status_change'
                            ? 'Set the interview date now or schedule it later.'
                            : 'Update the interview date and time.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Interview Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Interview Time
                        </Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Assign Interviewer (Super Admin only, only when changing status to Interview) */}
                    {isAdmin && interviewers.length > 0 && mode === 'status_change' && (
                        <div className="space-y-2">
                            <Label htmlFor="interviewer" className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Assign to Interviewer
                            </Label>
                            <Select value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interviewer (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Assignment</SelectItem>
                                    {interviewers.map(i => (
                                        <SelectItem key={i.id} value={i.id.toString()}>
                                            {i.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Only the assigned interviewer will be able to view and mark this applicant.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {mode === 'status_change' ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleSetLater}
                                disabled={isLoading}
                                className="w-full sm:w-auto"
                            >
                                Set Date Later
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleSetNow}
                                disabled={isLoading || !date}
                                className="w-full sm:w-auto"
                            >
                                Set Interview Date Now
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={isLoading}
                            >
                                Update
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
