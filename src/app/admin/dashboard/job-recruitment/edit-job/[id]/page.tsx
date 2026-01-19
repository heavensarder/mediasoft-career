import { PrismaClient } from '@prisma/client';
import AddJobForm from '@/components/admin/AddJobForm';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

async function getJob(id: number) {
    const job = await prisma.job.findUnique({
        where: { id }
    });
    return job;
}

async function getLookupData() {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    const jobTypes = await prisma.jobType.findMany({ orderBy: { name: 'asc' } });
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    return { departments, jobTypes, locations };
}

export default async function EditJobPage({ params }: { params: { id: string } }) {
    // Next.js params are async in some versions, but standard is sync in others.
    // In App Router, params is a Promise in newer versions, but let's assume standard access for now or await it if strict.
    // Safe approach: await params
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) return notFound();

    const job = await getJob(id);
    const { departments, jobTypes, locations } = await getLookupData();

    if (!job) return notFound();

    // Map Prisma Job to Form Values
    const initialData = {
        title: job.title,
        description: job.description,
        departmentId: job.departmentId.toString(),
        typeId: job.typeId.toString(),
        locationId: job.locationId.toString(),
        expiryDate: job.expiryDate.toISOString().split('T')[0], // YYYY-MM-DD
        isDraft: job.isDraft
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Edit Job</h1>
             {/* We need to update AddJobForm to accept initialData and an 'edit' mode or id for updating */}
             {/* For now, we will pass initialData and handle the update logic in the form component or a new wrapper */}
            <AddJobForm 
                departments={departments} 
                jobTypes={jobTypes} 
                locations={locations}
                initialData={initialData}
                jobId={id}
            />
        </div>
    );
}
