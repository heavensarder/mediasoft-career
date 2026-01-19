import { notFound } from 'next/navigation';
import { getJobById } from '@/lib/data';
import ApplicationForm from '@/components/ApplicationForm';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Building2, Calendar } from 'lucide-react';

// This is correct for Next.js 15: params is a Promise
export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobById(parseInt(id));

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Hero */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
             <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{job.title}</h1>
                        <div className="flex flex-wrap gap-4 text-slate-300 text-sm">
                            <span className="flex items-center"><Building2 className="w-4 h-4 mr-1"/> {job.department.name}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {job.location.name}</span>
                            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/> {job.jobType.name}</span>
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Deadline: {new Date(job.expiryDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-base px-4 py-1">
                        {job.status}
                    </Badge>
                </div>
             </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Left Column: Job Description */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Job Description</h2>
                    <div 
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                </div>
            </div>

            {/* Right Column: Application Form */}
            <div className="lg:col-span-1">
                <div className="sticky top-8">
                    <ApplicationForm jobId={job.id} jobTitle={job.title} />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
