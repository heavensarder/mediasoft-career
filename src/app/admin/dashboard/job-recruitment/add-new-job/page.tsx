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
            <h1 className="text-3xl font-bold">Post a New Job</h1>
            <AddJobForm 
                departments={departments} 
                jobTypes={jobTypes} 
                locations={locations} 
            />
        </div>
    );
}
