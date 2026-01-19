
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail } from "lucide-react";
import Link from 'next/link';
import ResumeViewerWrapper from '@/components/admin/ResumeViewerWrapper';
import StatusSelector from '@/components/admin/StatusSelector';
import MarkAsViewed from '@/components/admin/MarkAsViewed';
import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient();

async function getApplication(id: number) {
    return await prisma.application.findUnique({
        where: { id },
        include: { job: true }
    });
}

export default async function ApplicationDetailsPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return notFound();

    const application = await getApplication(id);
    if (!application) return notFound();

    return (
        <div className="space-y-6">
            <MarkAsViewed id={application.id} status={application.status} />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard/job-recruitment/applications">
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Application Details</h1>
                </div>
                <div className="flex items-center gap-3">
                    <StatusSelector id={application.id} currentStatus={application.status} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Applicant Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applicant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4 mb-4">
                             {application.photo ? (
                                <img src={application.photo} alt="Applicant" className="w-24 h-24 rounded-full object-cover border" />
                             ) : (
                                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">No Photo</div>
                             )}
                             <div>
                                 <span className="text-xl font-bold block">{application.fullName}</span>
                                 <Badge variant="outline" className="mt-1">{application.gender}</Badge>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold block text-sm text-gray-500">Email</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm">{application.email}</span>
                                    <a href={`mailto:${application.email}`} className="text-blue-500"><Mail className="h-3 w-3"/></a>
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold block text-sm text-gray-500">Phone</span>
                                <span className="text-sm">{application.mobile}</span>
                            </div>
                            <div>
                                <span className="font-semibold block text-sm text-gray-500">NID/Passport</span>
                                <span className="text-sm">{application.nid}</span>
                            </div>
                            <div>
                                <span className="font-semibold block text-sm text-gray-500">Date of Birth</span>
                                <span className="text-sm">{new Date(application.dob).toLocaleDateString()}</span>
                            </div>
                             <div>
                                <span className="font-semibold block text-sm text-gray-500">Current Salary</span>
                                <span className="text-sm">{application.currentSalary || "N/A"}</span>
                            </div>
                            <div>
                                <span className="font-semibold block text-sm text-gray-500">Expected Salary</span>
                                <span className="text-sm">{application.expectedSalary || "N/A"}</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <span className="font-semibold block text-sm text-gray-500">Social Profiles</span>
                            <div className="flex flex-col gap-1 mt-1 text-sm">
                                {application.linkedin && <a href={application.linkedin} target="_blank" className="text-blue-600 hover:underline">LinkedIn Profile</a>}
                                {application.facebook && <a href={application.facebook} target="_blank" className="text-blue-600 hover:underline">Facebook Profile</a>}
                                {application.portfolio && <a href={application.portfolio} target="_blank" className="text-blue-600 hover:underline">Portfolio/Website</a>}
                                {!application.linkedin && !application.facebook && !application.portfolio && <span className="text-gray-400">No profiles provided.</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Info */}
                <Card>
                     <CardHeader>
                        <CardTitle>Professional Context</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="font-semibold block text-sm text-gray-500">Applied For</span>
                            <Link href={`/admin/dashboard/job-recruitment/job-list`} className="text-blue-600 hover:underline text-lg font-medium">
                                {application.job.title}
                            </Link>
                        </div>
                         <div>
                            <span className="font-semibold block text-sm text-gray-500">Latest Education</span>
                            <span className="text-lg">{application.education}</span>
                        </div>
                         <div>
                            <span className="font-semibold block text-sm text-gray-500">Experience</span>
                            <span className="text-lg">{application.experience}</span>
                        </div>
                        <div>
                            <span className="font-semibold block text-sm text-gray-500">Recruitment Source</span>
                            <span className="text-base">{application.source}</span>
                        </div>
                         <div>
                            <span className="font-semibold block text-sm text-gray-500">Resume/CV</span>
                            {application.resume ? (
                                <div className="space-y-4">
                                    <a href={application.resume} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                        <Download className="h-4 w-4" /> Download Resume
                                    </a>
                                    <ResumeViewerWrapper url={application.resume} />
                                </div>
                            ) : (
                                <span className="text-gray-400">No resume uploaded</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 {/* Cover Letter & Objectives */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Career Objective & Message</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                             <h4 className="font-semibold text-sm text-gray-500 mb-1">Career Objective</h4>
                             <div className="bg-slate-50 p-4 rounded-md whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                {application.objective || "N/A"}
                            </div>
                        </div>
                        {application.achievements && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500 mb-1">Achievements</h4>
                                <div className="bg-slate-50 p-4 rounded-md whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                    {application.achievements}
                                </div>
                            </div>
                        )}
                         {application.message && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500 mb-1">Applicant Message</h4>
                                <div className="bg-slate-50 p-4 rounded-md whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                    {application.message}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
