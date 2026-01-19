import { PrismaClient } from '@prisma/client';
import AddJobForm from '@/components/admin/AddJobForm';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';

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
    // Next.js params are async in some versions.
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) return notFound();

    const job = await getJob(id);
    const { departments, jobTypes, locations } = await getLookupData();

    if (!job) return notFound();

    // Access slug safely (case to any to handle stale Prisma Client)
    const slug = (job as any).slug;
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/jobs/${slug}`;

    // Map Prisma Job to Form Values
    const initialData = {
        title: job.title,
        description: job.description,
        departmentId: job.departmentId?.toString() || "",
        typeId: job.typeId?.toString() || "",
        locationId: job.locationId?.toString() || "",
        expiryDate: job.expiryDate ? job.expiryDate.toISOString().split('T')[0] : "", // YYYY-MM-DD or empty string
        status: job.status || "Active"
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Edit Job</h1>
                {slug && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">Public Link:</span>
                        <ShareButton title={job.title} url={publicUrl} />
                    </div>
                )}
            </div>

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
