'use client';

import { useState } from 'react';
import { submitApplication } from '@/lib/application-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

const FileUploadInput = ({ field, commonProps }: { field: FormField, commonProps: any }) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setFileName(file.name);
        else setFileName(null);
    };

    return (
        <div className="relative group">
            <div className={cn(
                "flex items-center justify-between p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer",
                fileName
                    ? "border-[#00ADE7] bg-[#00ADE7]/5"
                    : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#00ADE7]/50 hover:shadow-sm"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-full transition-colors",
                        fileName ? "bg-[#00ADE7] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#00ADE7]/10 group-hover:text-[#00ADE7]"
                    )}>
                        <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className={cn("text-sm font-semibold", fileName ? "text-[#00ADE7]" : "text-slate-700")}>
                            {fileName || `Click to upload ${field.label}`}
                        </span>
                        {!fileName && <span className="text-xs text-slate-500 mt-0.5">PDF, DOC, DOCX up to 10MB</span>}
                    </div>
                </div>
                {fileName && (
                    <span className="text-xs font-bold text-[#00ADE7] bg-[#00ADE7]/10 px-3 py-1 rounded-full">
                        Change
                    </span>
                )}
            </div>
            <Input
                {...commonProps}
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
        </div>
    );
};

export default function ApplicationForm({ jobId, jobTitle, fields }: { jobId: number, jobTitle: string, fields: FormField[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        const formData = new FormData(event.currentTarget);
        formData.append('jobId', jobId.toString());

        try {
            // Collect dynamic fields that are NOT system fields
            const dynamicData: Record<string, string> = {};
            fields.filter(f => !f.isSystem).forEach(f => {
                const value = formData.get(f.name);
                if (value) dynamicData[f.name] = value.toString();
            });
            formData.append('dynamicData', JSON.stringify(dynamicData));

            const result = await submitApplication(null, formData);
            if (result?.error) {
                setErrorMsg(result.error);
            } else if (result?.success) {
                setSuccess(true);
            }
        } catch (e) {
            setErrorMsg("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (success) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center">
                    <h3 className="text-2xl font-bold text-green-700 mb-2">Application Submitted!</h3>
                    <p className="text-green-600">
                        Thank you for applying to <strong>{jobTitle}</strong>.
                        We have received your application and will review it shortly.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Helper to render field inputs
    const renderField = (field: FormField) => {
        const commonProps = {
            id: field.name,
            name: field.name,
            required: field.required,
            placeholder: field.placeholder || undefined,
            className: "h-11 premium-input bg-white/50"
        };

        switch (field.type) {
            case 'textarea':
                return <Textarea {...commonProps} className="min-h-[120px] premium-input bg-white/50" />;;
            case 'select':
                return (
                    <select {...commonProps} className={cn("flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background premium-input bg-white/50", commonProps.className)}>
                        <option value="">Select {field.label}</option>
                        {field.options?.split(',').map(opt => (
                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="flex flex-wrap gap-4 pt-1">
                        {field.options?.split(',').map(opt => (
                            <label key={opt.trim()} className="flex items-center space-x-2 cursor-pointer bg-white/40 px-3 py-1.5 rounded-lg border border-transparent hover:border-primary/20 transition-all">
                                <input type="radio" name={field.name} value={opt.trim()} className="accent-primary h-4 w-4" required={field.required} />
                                <span className="text-sm font-medium text-slate-700">{opt.trim()}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'file':
                if (field.name === 'photo') {
                    return (
                        <div className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-6 text-center hover:bg-primary/10 transition-colors relative group">
                            <input
                                {...commonProps}
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handlePhotoChange}
                            />
                            {photoPreview ? (
                                <div className="relative inline-block">
                                    <img src={photoPreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-full border-4 border-white shadow-md relative z-0" />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <UploadCloud className="text-white h-8 w-8" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                        <UploadCloud className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-primary">Upload Photo</span>
                                    <span className="text-xs mt-1 opacity-70">Click or drag image</span>
                                </div>
                            )}
                        </div>
                    );
                } else {
                    return <FileUploadInput field={field} commonProps={commonProps} />;
                }
            default: // text, email, number, date
                let inputType = field.type;

                // System Override for Social Links to enforce URL validation
                const urlFields = ['facebook', 'portfolio', 'github', 'linkedin', 'website', 'twitter'];
                if (urlFields.includes(field.name.toLowerCase())) {
                    inputType = 'url';
                } else if (field.type === 'phone') {
                    inputType = 'tel';
                }

                return <Input {...commonProps} type={inputType} />;
        }
    };

    return (
        <Card className="premium-glass-card border-none overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500" />
            <CardContent className="pt-8 px-6 sm:px-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 mb-2">Apply Now</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Please complete the form below. Fields marked with <span className="text-destructive">*</span> are required.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-8 text-sm flex items-center border border-destructive/20">
                        <span className="text-lg mr-2">⚠️</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {fields.map(field => (
                        <div key={field.id} className={cn("space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500", `fill-mode-backwards delay-[${field.id * 50}ms]`)}>
                            {field.type !== 'file' && (
                                <Label htmlFor={field.name} className="text-base font-medium text-slate-700">
                                    {field.label} {field.required && <span className="text-destructive">*</span>}
                                </Label>
                            )}
                            {field.type === 'file' && field.name !== 'photo' && (
                                <Label htmlFor={field.name} className="text-base font-medium text-slate-700">
                                    {field.label} {field.required && <span className="text-destructive">*</span>}
                                </Label>
                            )}
                            {renderField(field)}
                        </div>
                    ))}

                    <div className="flex items-start space-x-3 pt-4 pb-4">
                        <input type="checkbox" id="agreement" name="agreement" required className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary" />
                        <label htmlFor="agreement" className="text-sm text-slate-600 leading-tight cursor-pointer select-none">
                            By using this form you agree with the storage and handling of your data by this website. <span className="text-destructive">*</span>
                        </label>
                    </div>

                    <Button type="submit" size="lg" className="w-full text-lg h-14 font-semibold shadow-lg hover:shadow-xl transition-all premium-btn bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting Application...
                            </>
                        ) : (
                            'Submit Application'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

