import { PrismaClient } from '@prisma/client';
import SettingsSection from "@/components/admin/SettingsSection";
import * as actions from '@/lib/settings-actions';

const prisma = new PrismaClient();

async function getSettingsData() {
    const departments = await prisma.department.findMany();
    const jobTypes = await prisma.jobType.findMany();
    const locations = await prisma.location.findMany();
    return { departments, jobTypes, locations };
}

export default async function SettingsPage() {
  const { departments, jobTypes, locations } = await getSettingsData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Departments */}
        <SettingsSection 
            title="Departments"
            description="Manage organization departments."
            items={departments}
            onCreate={actions.createDepartment}
            onDelete={actions.deleteDepartment}
        />

        {/* Job Types */}
        <SettingsSection 
            title="Job Types"
            description="Manage employment types."
            items={jobTypes}
            onCreate={actions.createJobType}
            onDelete={actions.deleteJobType}
        />

        {/* Locations */}
        <SettingsSection 
            title="Locations"
            description="Manage office locations."
            items={locations}
            onCreate={actions.createLocation}
            onDelete={actions.deleteLocation}
        />
      </div>
    </div>
  );
}
