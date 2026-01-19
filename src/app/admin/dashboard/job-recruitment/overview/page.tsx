import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, UserCheck, UserX } from 'lucide-react';
import OverviewCharts from '@/components/admin/OverviewCharts';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
// const prisma = new PrismaClient();

async function getOverviewData() {
  const [
    totalApps,
    activeJobs,
    shortlistedApps,
    rejectedApps,
    recentApps,
    jobsWithCounts
  ] = await Promise.all([
    prisma.application.count(),
    prisma.job.count({ where: { status: "Active" } }),
    prisma.application.count({ where: { status: "Shortlisted" } }),
    prisma.application.count({ where: { status: "Rejected" } }),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { job: true },
    }),
    prisma.job.findMany({
      select: {
        title: true,
        _count: {
          select: { applications: true }
        }
      }
    })
  ]);

  // Format data for chart
  const chartData = jobsWithCounts
    .map(job => ({
      name: job.title,
      value: job._count.applications
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value) // Sort by highest app count
    .slice(0, 5); // Take top 5 for cleaner chart? Or all? Let's verify. 

  return {
    totalApps,
    activeJobs,
    shortlistedApps,
    rejectedApps,
    recentApps,
    chartData,
    jobsWithCounts
  };
}

export default async function OverviewPage() {
  const { 
    totalApps, 
    activeJobs, 
    shortlistedApps, 
    rejectedApps, 
    recentApps, 
    chartData,
    jobsWithCounts 
  } = await getOverviewData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApps}</div>
            <p className="text-xs text-muted-foreground">All time applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlistedApps}</div>
            <p className="text-xs text-muted-foreground">Candidates shortlisted</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedApps}</div>
             <p className="text-xs text-muted-foreground">Candidates rejected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
             <CardDescription>
              Displaying latest 5 applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentApps.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No applications yet.</div>
              ) : (
                  recentApps.map((app) => (
                    <div key={app.id} className="flex items-center">
                      <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                        <Avatar className="h-9 w-9 hover:opacity-80 transition-opacity cursor-pointer">
                            <AvatarImage src={app.photo || undefined} alt="Avatar" />
                            <AvatarFallback>{app.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="ml-4 space-y-1">
                        <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`}>
                            <p className="text-sm font-medium leading-none hover:underline hover:text-blue-600 cursor-pointer">{app.fullName}</p>
                        </Link>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                      </div>
                      <div className="ml-auto font-medium text-sm text-right">
                        <div>{app.job.title}</div>
                        <div className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                       <Badge className={`ml-4 ${app.status === 'New' ? 'bg-blue-500' : app.status === 'Rejected' ? 'bg-red-500' : app.status === 'Shortlisted' ? 'bg-green-500' : 'bg-gray-500'}`}>
                            {app.status}
                       </Badge>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Applications Distribution</CardTitle>
            <CardDescription>
              Top jobs by application count
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {jobsWithCounts.slice(0, 5).map((job, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <div className="space-y-1 flex-1">
                            <p className="font-medium leading-none truncate w-[180px]">{job.title}</p>
                        </div>
                        <div className="ml-auto font-bold">
                            {job._count.applications}
                        </div>
                    </div>
                ))}
             </div>
             <OverviewCharts data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
