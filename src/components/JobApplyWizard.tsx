'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Building2, Clock, ArrowRight, ArrowLeft, FileText, Send } from 'lucide-react';
import ApplicationForm from '@/components/ApplicationForm';
import { cn } from '@/lib/utils';

interface JobData {
    id: number;
    title: string;
    description: string;
    department: { name: string } | null;
    jobType: { name: string } | null;
    location: { name: string } | null;
    expiryDate: Date | null;
}

interface FormField {
    id: number;
    label: string;
    name: string;
    type: string;
    required: boolean;
    placeholder: string | null;
    options: string | null;
    isSystem: boolean;
}

interface JobApplyWizardProps {
    job: JobData;
    fields: FormField[];
    daysLeft: number;
    isExpired: boolean;
}

export default function JobApplyWizard({ job, fields, daysLeft, isExpired }: JobApplyWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [isAnimating, setIsAnimating] = useState(false);

    const goToStep = (step: number) => {
        if (isAnimating) return;
        setDirection(step > currentStep ? 'forward' : 'backward');
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentStep(step);
            setIsAnimating(false);
        }, 300);
    };

    const steps = [
        { number: 1, title: 'Job Details', icon: FileText },
        { number: 2, title: 'Apply', icon: Send },
    ];

    return (
        <div className="space-y-8">
            {/* Step Indicator */}
            <div className="premium-glass-card border-none p-6 md:p-8">
                <div className="flex items-center justify-center">
                    <div className="flex items-center justify-center w-full max-w-md">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center justify-center flex-1">
                                {/* Step Circle */}
                                <button
                                    onClick={() => goToStep(step.number)}
                                    disabled={isAnimating}
                                    className={cn(
                                        "relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-500 ease-out cursor-pointer",
                                        currentStep >= step.number
                                            ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                                            : "bg-white/50 border-2 border-slate-200 text-slate-400 hover:border-cyan-300 hover:text-cyan-500"
                                    )}
                                >
                                    {currentStep > step.number ? (
                                        <svg className="w-6 h-6 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    )}

                                    {/* Pulse Animation for Current Step */}
                                    {currentStep === step.number && (
                                        <span className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
                                    )}
                                </button>

                                {/* Step Label */}
                                <div className={cn(
                                    "hidden sm:flex flex-col ml-3 transition-colors duration-300",
                                    currentStep >= step.number ? "text-slate-900" : "text-slate-400"
                                )}>
                                    <span className="text-xs font-medium uppercase tracking-wide">Step {step.number}</span>
                                    <span className="text-sm font-semibold">{step.title}</span>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 mx-4 h-1 rounded-full bg-slate-200 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out rounded-full",
                                                currentStep > step.number ? "w-full" : "w-0"
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="relative overflow-hidden">
                {/* Step 1: Job Information */}
                <div
                    className={cn(
                        "transition-all duration-300 ease-out",
                        currentStep === 1
                            ? "opacity-100 translate-x-0"
                            : direction === 'forward'
                                ? "opacity-0 -translate-x-full absolute inset-0"
                                : "opacity-0 translate-x-full absolute inset-0"
                    )}
                >
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
                            {/* Job Quick Info Cards */}
                            <div className={cn(
                                "grid gap-4",
                                job.expiryDate ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"
                            )}>
                                <QuickInfoCard
                                    icon={Building2}
                                    label="Department"
                                    value={job.department?.name || 'N/A'}
                                    delay={0}
                                />
                                <QuickInfoCard
                                    icon={MapPin}
                                    label="Location"
                                    value={job.location?.name || 'N/A'}
                                    delay={100}
                                />
                                <QuickInfoCard
                                    icon={Briefcase}
                                    label="Job Type"
                                    value={job.jobType?.name || 'N/A'}
                                    delay={200}
                                />
                                {job.expiryDate && (
                                    <QuickInfoCard
                                        icon={Clock}
                                        label="Deadline"
                                        value={isExpired ? 'Expired' : `${daysLeft} days left`}
                                        isWarning={daysLeft <= 7 && !isExpired}
                                        isExpired={isExpired}
                                        delay={300}
                                    />
                                )}
                            </div>

                            {/* Job Description */}
                            <div className="premium-glass-card border-none p-6 md:p-10">
                                <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-cyan-500" />
                                    Job Description
                                </h2>
                                <div
                                    className="prose prose-slate max-w-full prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-800 prose-li:marker:text-primary prose-p:leading-loose break-words hyphens-none"
                                    dangerouslySetInnerHTML={{ __html: job.description }}
                                />
                            </div>

                            {/* CTA Button */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={() => goToStep(2)}
                                    disabled={isAnimating || isExpired}
                                    size="lg"
                                    className={cn(
                                        "group relative px-10 py-7 text-lg font-bold rounded-2xl shadow-xl transition-all duration-300",
                                        "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
                                        "hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-1",
                                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    )}
                                >
                                    <span className="flex items-center gap-3">
                                        {isExpired ? 'Applications Closed' : 'Apply for this Position'}
                                        {!isExpired && (
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        )}
                                    </span>

                                    {/* Shimmer Effect */}
                                    {!isExpired && (
                                        <span className="absolute inset-0 rounded-2xl overflow-hidden">
                                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2: Application Form */}
                <div
                    className={cn(
                        "transition-all duration-300 ease-out",
                        currentStep === 2
                            ? "opacity-100 translate-x-0"
                            : direction === 'forward'
                                ? "opacity-0 translate-x-full absolute inset-0"
                                : "opacity-0 -translate-x-full absolute inset-0"
                    )}
                >
                    {currentStep === 2 && (
                        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-right-10 duration-500">
                            {/* Back Button */}
                            <button
                                onClick={() => goToStep(1)}
                                disabled={isAnimating}
                                className="group inline-flex items-center gap-2 text-slate-600 hover:text-cyan-600 font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Back to Job Details
                            </button>

                            {/* Application Form */}
                            <ApplicationForm jobId={job.id} jobTitle={job.title} fields={fields} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Quick Info Card Component
function QuickInfoCard({
    icon: Icon,
    label,
    value,
    isWarning = false,
    isExpired = false,
    delay = 0
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    isWarning?: boolean;
    isExpired?: boolean;
    delay?: number;
}) {
    return (
        <div
            className={cn(
                "premium-glass-card border-none p-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500",
                isExpired && "bg-red-50/70",
                isWarning && !isExpired && "bg-amber-50/70"
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
        >
            <div className={cn(
                "mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2",
                isExpired
                    ? "bg-red-100 text-red-500"
                    : isWarning
                        ? "bg-amber-100 text-amber-600"
                        : "bg-cyan-100 text-cyan-600"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={cn(
                "text-sm font-bold truncate",
                isExpired
                    ? "text-red-600"
                    : isWarning
                        ? "text-amber-600"
                        : "text-slate-800"
            )}>
                {value}
            </p>
        </div>
    );
}
