import { Users, Briefcase, UserCheck, UserX, TrendingUp, Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ApplicationTrendChart, DepartmentDistributionChart, MetricSparkline } from '@/components/admin/DashboardCharts';

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
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    totalApps,
    activeJobs,
    shortlistedApps,
    rejectedApps,
    recentApps,
    chartData
  };
}

export default async function OverviewPage() {
  const {
    totalApps,
    activeJobs,
    shortlistedApps,
    rejectedApps,
    recentApps,
    chartData
  } = await getOverviewData();

  return (
    <div className="premium-bg min-h-screen text-slate-800 p-8 -m-6 md:-m-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Welcome back! Here's your recruitment activity.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="premium-glass-card px-4 py-2 flex items-center gap-3 bg-white/60">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-700">Live Updates</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Apps */}
        <div className="premium-glass-card p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Application</p>
              <h3 className="text-4xl font-extrabold text-slate-800 mt-1">{totalApps}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs flex items-center gap-1 font-bold">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
            <div className="h-10 w-24 opacity-80">
              <MetricSparkline color="#2563eb" />
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="premium-glass-card p-6 border-l-4 border-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-4xl font-extrabold text-slate-800 mt-1">{activeJobs}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-slate-500 text-xs font-semibold">
              Positions Open
            </span>
            <div className="h-10 w-24 opacity-80">
              <MetricSparkline color="#059669" />
            </div>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="premium-glass-card p-6 border-l-4 border-violet-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Shortlisted</p>
              <h3 className="text-4xl font-extrabold text-slate-800 mt-1">{shortlistedApps}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded text-xs font-bold">
              Qualified
            </span>
            <div className="h-10 w-24 opacity-80">
              <MetricSparkline color="#7c3aed" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="premium-glass-card p-6 border-l-4 border-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Rejected</p>
              <h3 className="text-4xl font-extrabold text-slate-800 mt-1">{rejectedApps}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
              <UserX className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-slate-500 text-xs font-semibold">
              Archived
            </span>
            <div className="h-10 w-24 opacity-80">
              <MetricSparkline color="#e11d48" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* Chart Column (2/3 width) */}
        <div className="md:col-span-2 space-y-6">

          {/* Recent Table */}
          <div className="premium-glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Recent Applications</h3>
              <Link href="/admin/dashboard/job-recruitment/applications" className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors font-bold tracking-wide">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentApps.map((app) => (
                <div key={app.id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="transition-transform hover:scale-105">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer">
                        <AvatarImage src={app.photo || undefined} />
                        <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{app.fullName[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors hover:underline">
                        {app.fullName}
                      </Link>
                      <p className="text-xs text-slate-500 font-medium">{app.job.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1 font-semibold">
                      <Calendar className="h-3 w-3" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm
                                    ${app.status === 'New' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-200 text-slate-600'
                      }
                                `}>
                      {app.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">

          {/* Distribution */}
          <div className="premium-glass-card p-6 flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-800 w-full text-left mb-2">Job Distribution</h3>
            <DepartmentDistributionChart data={chartData} />

            <div className="w-full space-y-3 mt-4">
              {chartData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-md shadow-sm" style={{ backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'][idx] }}></div>
                    <span className="text-slate-600 font-medium truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
