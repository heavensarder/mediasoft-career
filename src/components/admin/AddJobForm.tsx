'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { createJobAction, updateJobAction } from '@/lib/job-actions';
import { Department, JobType, Location } from '@prisma/client'; // Import types

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });

import { JobActivationModal } from '@/components/admin/JobActivationModal';

const jobSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    departmentId: z.string().min(1, 'Please select a department'),
    typeId: z.string().min(1, 'Please select a job type'),
    locationId: z.string().min(1, 'Please select a location'),
    expiryDate: z.string().optional().refine((date) => !date || new Date(date) > new Date(), {
        message: "Expiry date must be in the future"
    }),
    status: z.string().min(1, 'Please select a status'),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface AddJobFormProps {
    departments: Department[];
    jobTypes: JobType[];
    locations: Location[];
    initialData?: JobFormValues;
    jobId?: number;
}

import { useRouter } from 'next/navigation';

// ...

export default function AddJobForm({ departments, jobTypes, locations, initialData, jobId }: AddJobFormProps) {
    const [loading, setLoading] = useState(false);
    const [showActivationModal, setShowActivationModal] = useState(false);
    const router = useRouter(); // Initialize router
    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: initialData || {
            title: '',
            description: '',
            departmentId: '',
            typeId: '',
            locationId: '',
            status: 'Inactive'
        }
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
    const status = watch('status');

    const handleStatusChange = (checked: boolean) => {
        if (checked) {
            setShowActivationModal(true);
        } else {
            setValue('status', 'Inactive');
            setValue('expiryDate', ''); // Clear expiry on deactivation
        }
    };

    const handleActivationConfirm = (expiryDate: string | null) => {
        setValue('status', 'Active');
        setValue('expiryDate', expiryDate || '');
        setShowActivationModal(false);
    };

    const onSubmit = async (data: JobFormValues) => {
        setLoading(true);
        console.log("Submitting Job:", data);

        try {
            let result;
            if (jobId) {
                result = await updateJobAction(jobId, data);
            } else {
                result = await createJobAction(data);
            }

            if (result?.success) { // Handle success
                router.push('/admin/dashboard/job-recruitment/job-list');
                router.refresh();
                return;
            }

            if (result?.error) {
                alert(result.error);
                if (result.fieldErrors) {
                    console.error(result.fieldErrors);
                }
            }
        } catch (e) {
            console.error(e);
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{jobId ? 'Edit Job' : 'Job Details'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Status Toggle moved to top */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium text-slate-900">Job Status</label>
                            <p className="text-sm text-slate-500">
                                {status === 'Active' ? 'This job is visible to candidates.' : 'This job is hidden from the public.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${status === 'Active' ? 'text-slate-400' : 'text-slate-900'}`}>Inactive</span>
                            <Switch
                                checked={status === 'Active'}
                                onCheckedChange={handleStatusChange}
                            />
                            <span className={`text-sm font-medium ${status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>Active</span>
                        </div>
                    </div>
                    
                    <JobActivationModal 
                        isOpen={showActivationModal}
                        onClose={() => setShowActivationModal(false)}
                        onConfirm={handleActivationConfirm}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Job Title</label>
                            <Input {...register('title')} placeholder="e.g. Senior Backend Engineer" />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Expiry Date</label>
                            <Input type="date" {...register('expiryDate')} />
                            {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department</label>
                            <select {...register('departmentId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id.toString()}>{dept.name}</option>
                                ))}
                            </select>
                            {errors.departmentId && <p className="text-red-500 text-sm">{errors.departmentId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Job Type</label>
                            <select {...register('typeId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">Select Type</option>
                                {jobTypes.map(type => (
                                    <option key={type.id} value={type.id.toString()}>{type.name}</option>
                                ))}
                            </select>
                            {errors.typeId && <p className="text-red-500 text-sm">{errors.typeId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <select {...register('locationId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">Select Location</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id.toString()}>{loc.name}</option>
                                ))}
                            </select>
                            {errors.locationId && <p className="text-red-500 text-sm">{errors.locationId.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Job Description</label>
                        <RichTextEditor
                            value={form.watch('description') || ""}
                            onChange={(content) => setValue('description', content)}
                            placeholder="Write the job description here..."
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>



                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => router.push('/admin/dashboard/job-recruitment/job-list')}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (jobId ? 'Updating...' : 'Saving...') : (jobId ? 'Update Job' : 'Publish Job')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
