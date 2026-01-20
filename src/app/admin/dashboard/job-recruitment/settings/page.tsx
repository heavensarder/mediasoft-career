import { prisma } from "@/lib/prisma";
import SettingsSection from "@/components/admin/SettingsSection";
import FormBuilder from "@/components/admin/FormBuilder";
import * as actions from '@/lib/settings-actions';
import * as formActions from '@/lib/form-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getSettingsData() {
  const departments = await prisma.department.findMany();
  const jobTypes = await prisma.jobType.findMany();
  const locations = await prisma.location.findMany();
  const formFields = await prisma.formField.findMany({ orderBy: { order: 'asc' } });
  return { departments, jobTypes, locations, formFields };
}

export default async function SettingsPage() {
  const { departments, jobTypes, locations, formFields } = await getSettingsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">Settings</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Configure system-wide settings and preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="departments" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto h-12">
          <TabsTrigger value="departments" className="text-base">Departments</TabsTrigger>
          <TabsTrigger value="jobTypes" className="text-base">Job Types</TabsTrigger>
          <TabsTrigger value="locations" className="text-base">Locations</TabsTrigger>
          <TabsTrigger value="form" className="text-base">App Form</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="focus-visible:outline-none">
          <SettingsSection
            title="Departments"
            description="Manage the various departments in your organization."
            items={departments}
            onCreate={actions.createDepartment}
            onUpdate={actions.updateDepartment}
            onDelete={actions.deleteDepartment}
          />
        </TabsContent>

        <TabsContent value="jobTypes" className="focus-visible:outline-none">
          <SettingsSection
            title="Job Types"
            description="Define the types of employment offered (e.g., Full-time, Remote)."
            items={jobTypes}
            onCreate={actions.createJobType}
            onUpdate={actions.updateJobType}
            onDelete={actions.deleteJobType}
          />
        </TabsContent>

        <TabsContent value="locations" className="focus-visible:outline-none">
          <SettingsSection
            title="Locations"
            description="Manage your office locations or remote regions."
            items={locations}
            onCreate={actions.createLocation}
            onUpdate={actions.updateLocation}
            onDelete={actions.deleteLocation}
          />
        </TabsContent>

        <TabsContent value="form" className="focus-visible:outline-none">
          <FormBuilder
            fields={formFields}
            onSeed={formActions.seedSystemFields}
            onCreate={formActions.createFormField}
            onUpdate={formActions.updateFormField}
            onDelete={formActions.deleteFormField}
            onReorder={formActions.reorderFormFields}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
