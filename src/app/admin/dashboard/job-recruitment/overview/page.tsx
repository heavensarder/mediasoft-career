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

      {/* metric Cards Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">

        {/* Total Apps */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-blue-500 shadow-xl shadow-blue-200 transition-transform hover:-translate-y-1">
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white shadow-sm border border-white/10">Total</span>
            </div>
            <h3 className="text-5xl font-black tracking-tight mb-1 drop-shadow-sm">{totalApps}</h3>
            <p className="text-blue-50 font-bold text-lg tracking-wide opacity-90">Applications</p>
          </div>
          {/* Watermark Icon */}
          <Users className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10 rotate-12" />
        </div>

        {/* Active Jobs */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-xl shadow-emerald-200 transition-transform hover:-translate-y-1">
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white shadow-sm border border-white/10">Active</span>
            </div>
            <h3 className="text-5xl font-black tracking-tight mb-1 drop-shadow-sm">{activeJobs}</h3>
            <p className="text-emerald-50 font-bold text-lg tracking-wide opacity-90">Positions Open</p>
          </div>
          {/* Watermark Icon */}
          <Briefcase className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10 rotate-12" />
        </div>

        {/* Shortlisted */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-600 to-violet-500 shadow-xl shadow-violet-200 transition-transform hover:-translate-y-1">
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white shadow-sm border border-white/10">Qualified</span>
            </div>
            <h3 className="text-5xl font-black tracking-tight mb-1 drop-shadow-sm">{shortlistedApps}</h3>
            <p className="text-violet-50 font-bold text-lg tracking-wide opacity-90">Candidates</p>
          </div>
          {/* Watermark Icon */}
          <UserCheck className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10 rotate-12" />
        </div>

        {/* Rejected */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-rose-600 to-rose-500 shadow-xl shadow-rose-200 transition-transform hover:-translate-y-1">
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
                <UserX className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white shadow-sm border border-white/10">Archived</span>
            </div>
            <h3 className="text-5xl font-black tracking-tight mb-1 drop-shadow-sm">{rejectedApps}</h3>
            <p className="text-rose-50 font-bold text-lg tracking-wide opacity-90">Rejected</p>
          </div>
          {/* Watermark Icon */}
          <UserX className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10 rotate-12" />
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
                      <Link href={`/admin/dashboard/job-recruitment/applications/${app.id}`} className="text-sm font-bold text-slate-800 group-hover:text-[#00ADE7] transition-colors">
                        {app.fullName}
                      </Link>
                      <p className="text-xs text-slate-500 font-medium">Applied for <span className="text-[#00ADE7]">{app.job.title}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1 font-semibold">
                      <Calendar className="h-3 w-3" />
                      {(() => {
                        const date = new Date(app.createdAt);
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);

                        if (date.toDateString() === today.toDateString()) {
                          return "Today";
                        } else if (date.toDateString() === yesterday.toDateString()) {
                          return "Yesterday";
                        } else {
                          return date.toLocaleDateString();
                        }
                      })()}
                    </span>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                      app.status === 'New' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      app.status === 'Shortlisted' ? 'bg-green-100 text-green-700 border-green-200' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                      app.status === 'Selected' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      app.status === 'Interview' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
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
            <h3 className="text-xl font-bold text-slate-800 w-full text-left mb-2">Job Applications</h3>
            <DepartmentDistributionChart data={chartData} />


          </div>

        </div>
      </div>
    </div>
  );
}
