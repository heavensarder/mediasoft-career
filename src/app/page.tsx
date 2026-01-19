import Link from 'next/link';
import { getActiveJobs } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Briefcase } from 'lucide-react';

export default async function Home() {
  const jobs = await getActiveJobs();

  return (

    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Join Our Team</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are looking for talented individuals to help us build the future of technology.
            Explore our open positions and find your next career opportunity.
          </p>
        </div>
      </div>

      {/* Job List Section */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-10 text-foreground text-center">Open Positions</h2>

        {jobs.length === 0 ? (
          <div className="clay-card p-12 text-center text-muted-foreground max-w-lg mx-auto bg-card">
            <div className="mb-4 bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8 text-muted-foreground px-1" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Openings Right Now</h3>
            <p>We are not actively hiring for any roles at the moment. Please check back later!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job: any) => (
              <div key={job.id} className="clay-card p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between group hover:border-primary/50 transition-colors">
                {/* Left Side: Info */}
                <div className="space-y-3 flex-1">
                  <div>
                    <Link href={`/jobs/${job.slug}`} className="block w-fit">
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium flex items-center gap-1.5 border border-blue-100">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.department.name}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium border border-slate-200">
                        {job.jobType.name}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium flex items-center gap-1.5 border border-slate-200">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location.name}
                      </span>
                      {job.status === 'Active' && job.expiryDate && (
                        <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full text-sm font-medium flex items-center gap-1.5 border border-orange-100">
                          <Clock className="w-3.5 h-3.5" />
                          Expires: {new Date(job.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action */}
                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                  <Link href={`/jobs/${job.slug}`} className="w-full md:w-auto">
                    <Button className="clay-button w-full md:w-auto px-6 h-11 text-base shadow-none hover:shadow-none hover:translate-y-0 active:scale-100 active:shadow-inner">
                      {job.status === 'Active' ? 'Apply Now' : 'View Details'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
