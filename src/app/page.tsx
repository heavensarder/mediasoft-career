import Link from 'next/link';
import { getActiveJobs } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Briefcase } from 'lucide-react';

export default async function Home() {
  const jobs = await getActiveJobs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          We are looking for talented individuals to help us build the future of technology.
          Explore our open positions and find your next career opportunity.
        </p>
      </div>

      {/* Job List Section */}
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Open Positions</h2>
        
        {jobs.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No open positions at the moment. Please check back later.
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold text-blue-600">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{job.department.name}</Badge>
                         <Badge variant="outline">{job.jobType.name}</Badge>
                      </div>
                    </div>
                     <Link href={`/jobs/${job.id}`}>
                        <Button>Apply Now</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.jobType.name}
                    </div>
                     <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
