import { prisma } from "@/lib/prisma";
import SettingsSection from "@/components/admin/SettingsSection";
import FormBuilder from "@/components/admin/FormBuilder";
import * as actions from '@/lib/settings-actions';
import * as formActions from '@/lib/form-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Briefcase, MapPin, FileText, Settings } from "lucide-react";

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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings className="h-6 w-6" />
            </div>
            Settings & Configuration
          </h1>
          <p className="text-muted-foreground ml-14 max-w-2xl">
            Manage your organization's recruitment parameters, job attributes, and application form structure.
          </p>
      </div>

      <Tabs defaultValue="departments" className="w-full space-y-8">
        <TabsList className="bg-transparent p-0 w-full flex flex-row justify-start gap-2 h-auto border-b border-border/40 pb-0.5 overflow-x-auto">
          <TabsTrigger 
            value="departments" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger 
            value="jobTypes" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Briefcase className="h-4 w-4" />
            Job Types
          </TabsTrigger>
          <TabsTrigger 
            value="locations" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger 
            value="form" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Application Form
          </TabsTrigger>
        </TabsList>

        <div className="bg-transparent pt-2">
            <TabsContent value="departments" className="focus-visible:outline-none mt-0">
              <SettingsSection
                title="Departments"
                description="Create and manage the different departments within your company structure."
                items={departments}
                onCreate={actions.createDepartment}
                onUpdate={actions.updateDepartment}
                onDelete={actions.deleteDepartment}
              />
            </TabsContent>

            <TabsContent value="jobTypes" className="focus-visible:outline-none mt-0">
              <SettingsSection
                title="Job Types"
                description="Define the various employment engagement models (e.g., Full-time, Contract)."
                items={jobTypes}
                onCreate={actions.createJobType}
                onUpdate={actions.updateJobType}
                onDelete={actions.deleteJobType}
              />
            </TabsContent>

            <TabsContent value="locations" className="focus-visible:outline-none mt-0">
              <SettingsSection
                title="Locations"
                description="Configure the physical or remote working locations available for jobs."
                items={locations}
                onCreate={actions.createLocation}
                onUpdate={actions.updateLocation}
                onDelete={actions.deleteLocation}
              />
            </TabsContent>

            <TabsContent value="form" className="focus-visible:outline-none mt-0">
              <FormBuilder
                fields={formFields}
                onSeed={formActions.seedSystemFields}
                onCreate={formActions.createFormField}
                onUpdate={formActions.updateFormField}
                onDelete={formActions.deleteFormField}
                onReorder={formActions.reorderFormFields}
              />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
