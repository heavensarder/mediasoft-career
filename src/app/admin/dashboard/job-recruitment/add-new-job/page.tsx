import { PrismaClient } from '@prisma/client';
import AddJobForm from '@/components/admin/AddJobForm';

const prisma = new PrismaClient();

async function getLookupData() {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    const jobTypes = await prisma.jobType.findMany({ orderBy: { name: 'asc' } });
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    return { departments, jobTypes, locations };
}

export default async function AddJobPage() {
    const { departments, jobTypes, locations } = await getLookupData();

    return (
        <div className="space-y-6">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">Post a New Job</h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">Create a new job opportunity for your organization.</p>
            </div>
            <AddJobForm 
                departments={departments} 
                jobTypes={jobTypes} 
                locations={locations} 
            />
        </div>
    );
}
