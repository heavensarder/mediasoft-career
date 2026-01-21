'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CalendarIcon, CheckCircle2, ShieldAlert } from "lucide-react";

interface JobActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (expiryDate: string | null) => void;
}

export function JobActivationModal({ isOpen, onClose, onConfirm }: JobActivationModalProps) {
    const [step, setStep] = useState<'initial' | 'date'>('initial');
    const [date, setDate] = useState<string>('');

    const handleReset = () => {
        // slight delay to prevent flicker during close animation if needed, 
        // but here we just reset immediately for simplicity as key resets usually
        setStep('initial');
        setDate('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    }

    const handleConfirmDate = () => {
        if (!date) return;
        onConfirm(date);
        handleClose();
    };

    const handleConfirmNoExpiry = () => {
        onConfirm(null);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                        Activate Job
                    </DialogTitle>
                    <DialogDescription>
                        This job will become visible to candidates immediately.
                    </DialogDescription>
                </DialogHeader>

                {step === 'initial' ? (
                    <div className="flex flex-col gap-4 py-4">
                        <p className="text-sm text-slate-600 font-medium">Please select an activation mode:</p>
                        
                        <Button 
                            onClick={handleConfirmNoExpiry} 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-auto py-3 px-4 flex items-center justify-between group"
                        >
                            <span className="flex flex-col items-start">
                                <span className="font-bold">Activate without Expiry</span>
                                <span className="text-[10px] opacity-80 font-normal">Job remains active indefinitely</span>
                            </span>
                            <CheckCircle2 className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>

                        <div className="relative my-2">
                           <div className="absolute inset-0 flex items-center">
                               <span className="w-full border-t border-slate-200" />
                           </div>
                           <div className="relative flex justify-center text-xs uppercase">
                               <span className="bg-background px-2 text-slate-400">Or</span>
                           </div>
                       </div>

                        <Button 
                            onClick={() => setStep('date')} 
                            variant="outline" 
                            className="w-full h-auto py-3 px-4 flex items-center justify-between border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        >
                             <span className="flex flex-col items-start text-slate-700">
                                <span className="font-bold">Set Expiry Date</span>
                                <span className="text-[10px] text-slate-500 font-normal">Automatically deactivate on date</span>
                            </span>
                            <CalendarIcon className="h-5 w-5 text-slate-400" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 py-4">
                         <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex gap-2 items-start border border-blue-100">
                            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>Job will automatically become <strong>Inactive</strong> after this date.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Select Expiry Date</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="h-10 border-slate-300"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                             <Button variant="ghost" onClick={() => setStep('initial')} className="flex-1">Back</Button>
                             <Button onClick={handleConfirmDate} disabled={!date} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                Save & Activate
                             </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
