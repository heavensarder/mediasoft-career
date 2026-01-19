'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { createJobAction, updateJobAction } from '@/lib/job-actions';
import { Department, JobType, Location } from '@prisma/client'; // Import types

const Tiptap = dynamic(() => import('@/components/ui/tiptap'), { ssr: false });

const jobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  departmentId: z.string().min(1, 'Please select a department'),
  typeId: z.string().min(1, 'Please select a job type'),
  locationId: z.string().min(1, 'Please select a location'),
  expiryDate: z.string().refine((date) => new Date(date) > new Date(), {
     message: "Expiry date must be in the future"
  }),
  isDraft: z.boolean().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface AddJobFormProps {
    departments: Department[];
    jobTypes: JobType[];
    locations: Location[];
    initialData?: JobFormValues;
    jobId?: number;
}

export default function AddJobForm({ departments, jobTypes, locations, initialData, jobId }: AddJobFormProps) {
    const [loading, setLoading] = useState(false);
    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: initialData || {
            title: '',
            description: '',
            departmentId: '',
            typeId: '',
            locationId: '',
            isDraft: false
        }
    });

    const { register, handleSubmit, setValue, formState: { errors } } = form;

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

            if (result?.error) {
                alert(result.error);
                 if (result.fieldErrors) {
                    console.error(result.fieldErrors);
                 }
            }
        } catch (e) {
            alert("An unexpected error occurred.");
            console.error(e);
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <Tiptap content={initialData?.description || ""} onChange={(content) => setValue('description', content)} />
                         {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>

                     <div className="flex items-center space-x-2">
                         <input type="checkbox" {...register('isDraft')} id="isDraft" className="h-4 w-4" />
                         <label htmlFor="isDraft" className="text-sm font-medium">Save as Draft</label>
                     </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (jobId ? 'Updating...' : 'Saving...') : (jobId ? 'Update Job' : 'Publish Job')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
