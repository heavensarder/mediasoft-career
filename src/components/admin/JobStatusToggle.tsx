'use client';

import { useState, useTransition } from 'react';
// 4: import { Switch } from '@/components/ui/switch';
import { Switch } from '@/components/ui/switch';
import { Badge } from "@/components/ui/badge";
import { toggleJobStatusAction } from '@/lib/job-actions';
import { Loader2 } from 'lucide-react';
import { JobActivationModal } from '@/components/admin/JobActivationModal';

interface JobStatusToggleProps {
    jobId: number;
    initialStatus: string;
}

export default function JobStatusToggle({ jobId, initialStatus }: JobStatusToggleProps) {
    const [status, setStatus] = useState<string>(initialStatus);
    const [isPending, startTransition] = useTransition();
    const [showActivationModal, setShowActivationModal] = useState(false);

    // Dynamic import to avoid circular dependencies if any, but regular import is fine here
    // import { JobActivationModal } from '@/components/admin/JobActivationModal'; -> I need to add this import to the top

    const handleToggle = (checked: boolean) => {
        if (checked) {
            // Turning ON: Show modal
            setShowActivationModal(true);
        } else {
            // Turning OFF: Just do it
            performToggle('Inactive', null);
        }
    };

    const performToggle = (newStatus: 'Active' | 'Inactive', expiryDate?: string | null) => {
        const previousStatus = status;
        
        // Optimistic update
        setStatus(newStatus);

        startTransition(async () => {
            const result = await toggleJobStatusAction(jobId, newStatus, expiryDate);
            if (result?.error) {
                // Revert on error
                setStatus(previousStatus);
                console.error(result.error);
            }
        });
    };

    const handleActivationConfirm = (expiryDate: string | null) => {
        performToggle('Active', expiryDate);
        setShowActivationModal(false);
    };

    const isActive = status === 'Active';

    return (
        <div className="flex items-center gap-2">
            {isActive ? (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1.5 min-w-[80px] justify-center">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Active
                </Badge>
            ) : (
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full min-w-[80px] justify-center">
                    Inactive
                </Badge>
            )}
            
            <div className="flex items-center">
                {isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin text-slate-400" />}
                <Switch
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                    className="data-[state=checked]:bg-emerald-500"
                />
            </div>
            
            <JobActivationModal 
                isOpen={showActivationModal} 
                onClose={() => setShowActivationModal(false)}
                onConfirm={handleActivationConfirm}
            />
        </div>
    );
}
