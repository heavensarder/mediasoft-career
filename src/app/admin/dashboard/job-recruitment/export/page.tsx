import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ExportControls from "@/components/admin/ExportControls";

export default async function ExportPage() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true }
  });

  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, departmentId: true }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="clay-card">
          <CardHeader>
            <CardTitle>Export Applications</CardTitle>
            <CardDescription>Filter and download application data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExportControls departments={departments} jobs={jobs} />
          </CardContent>
        </Card>

        <Card className="clay-card">
          <CardHeader>
            <CardTitle>Export Jobs</CardTitle>
            <CardDescription>Download all job postings list.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center text-muted-foreground text-sm border rounded-lg clay-input mb-4">
              Simple list of all job postings.
            </div>
            <Button variant="outline" className="w-full clay-button bg-secondary text-secondary-foreground hover:text-white">
              <Download className="mr-2 h-4 w-4" /> Download Job List
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
