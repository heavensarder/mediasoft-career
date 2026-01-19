import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { 
    PlusCircle, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import JobActions from '@/components/admin/JobActions';

const prisma = new PrismaClient();

async function getJobs() {
    const jobs = await prisma.job.findMany({
        include: {
            department: true,
            jobType: true,
            _count: {
                select: { applications: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return jobs;
}

export default async function JobListPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Job List</h1>
        <Link href="/admin/dashboard/job-recruitment/add-new-job">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Job
            </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {jobs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                            No jobs found. Create your first job posting!
                        </TableCell>
                    </TableRow>
                ) : (
                    jobs.map((job) => (
                        <TableRow key={job.id}>
                            <TableCell className="font-medium">
                                <div>{job.title}</div>
                                <div className="text-xs text-gray-500">ID: #{job.id}</div>
                            </TableCell>
                            <TableCell>{job.department.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{job.jobType.name}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                                    {job.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{job._count.applications}</TableCell>
                            <TableCell>{new Date(job.expiryDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <JobActions jobId={job.id} />
                            </TableCell>
                        </TableRow>
                )))}
            </TableBody>
            </Table>
      </div>
    </div>
  );
}
