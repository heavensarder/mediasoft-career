
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
import PrintButton from '@/components/admin/PrintButton';
import ApplicantEmailModal from '@/components/admin/ApplicantEmailModal';
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

    // Fetch dynamic form fields to display custom data
    const formFields = await prisma.formField.findMany({
        where: { isActive: true, isSystem: false },
        orderBy: { order: 'asc' }
    });

    return (
        <div className="space-y-6">
            {/* Screen View */}
            <div className="print:hidden space-y-6">
                <MarkAsViewed id={application.id} status={application.status} />
                <div className="flex items-center justify-between pb-6 border-b">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard/job-recruitment/applications">
                            <Button variant="ghost" size="icon" className="cursor-pointer glass-button">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Application Details</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ApplicantEmailModal applicantEmail={application.email} applicantName={application.fullName} />
                        <PrintButton />
                        <StatusSelector id={application.id} currentStatus={application.status} />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Applicant Info - Screen */}
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
                                        <a href={`mailto:${application.email}`} className="text-blue-500"><Mail className="h-3 w-3" /></a>
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

                    {/* Professional Info - Screen */}
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

                    {/* Cover Letter & Objectives - Screen */}
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

                    {/* Dynamic Fields Section - Screen */}
                    {formFields.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formFields.map((field) => {
                                    const value = (application.dynamicData as any)?.[field.name];
                                    if (!value) return null;

                                    return (
                                        <div key={field.id}>
                                            <span className="font-semibold block text-sm text-gray-500 mb-1">{field.label}</span>
                                            {field.type === 'file' ? (
                                                <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    <Download className="h-4 w-4" /> Download File
                                                </a>
                                            ) : (
                                                <span className="text-base text-gray-900">{value.toString()}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Print View - Official Document Structure */}
            <div className="hidden print:block space-y-8 p-8 max-w-[210mm] mx-auto bg-white text-slate-900">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                M
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">MediaSoft</h1>
                        </div>
                        <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Job Application Record</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Applied On</p>
                        <p className="font-bold text-slate-900 text-lg">{new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Candidate Header */}
                <div className="grid grid-cols-[200px_1fr] gap-8 items-start">
                    {application.photo ? (
                        <img src={application.photo} alt="Applicant" className="w-[200px] h-[200px] rounded-lg object-cover border-2 border-slate-200 shadow-sm" />
                    ) : (
                        <div className="w-[200px] h-[200px] rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-sm border-2 border-slate-200">No Photo</div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight mb-2">{application.fullName}</h2>
                            <div className="inline-block bg-slate-100 px-3 py-1 rounded text-slate-700 font-medium text-sm">
                                Applied for <span className="text-blue-700 font-bold">{application.job.title}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-y-2 text-sm max-w-lg">
                            <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Email</span>
                                <span className="font-bold text-slate-900 break-words">{application.email}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Mobile</span>
                                <span className="font-bold text-slate-900">{application.mobile}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Experience</span>
                                <span className="font-bold text-slate-900">{application.experience}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Expected Salary</span>
                                <span className="font-bold text-slate-900">{application.expectedSalary}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Education</span>
                                <span className="font-bold text-slate-900 leading-tight">{application.education}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 py-1 pt-2">
                                <span className="text-slate-500 font-medium">Status</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 uppercase tracking-wide">
                                    {application.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {/* Objectives */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-200 pb-2">Career Objective</h3>
                        <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                            {application.objective || <span className="text-slate-400 italic">No objective provided.</span>}
                        </div>
                    </div>

                    {/* Achievements */}
                    {application.achievements && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-200 pb-2">Key Achievements</h3>
                            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                                <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                                    {application.achievements}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Data Grid */}
                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-200 pb-2">Personal Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Date of Birth</span>
                                    <span className="font-bold text-slate-900">{new Date(application.dob).toLocaleDateString()}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Gender</span>
                                    <span className="font-bold text-slate-900">{application.gender}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">NID / Passport</span>
                                    <span className="font-bold text-slate-900">{application.nid}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Current Salary</span>
                                    <span className="font-bold text-slate-900">{application.currentSalary || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {formFields.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-200 pb-2">Additional Info</h3>
                                <div className="space-y-2 text-sm">
                                    {formFields.map((field) => {
                                        const value = (application.dynamicData as any)?.[field.name];
                                        if (!value) return null;
                                        return (
                                            <div key={field.id} className="grid grid-cols-[140px_1fr] gap-4 py-1 border-b border-slate-100">
                                                <span className="text-slate-500 font-medium">{field.label}</span>
                                                <span className="font-bold text-slate-900 break-words">
                                                    {field.type === 'file' ? (
                                                        <span className="text-blue-600 italic flex items-center gap-1">
                                                            <Download className="h-3 w-3" /> File Attachment
                                                        </span>
                                                    ) : value}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <p>Generated by MediaSoft Recruitment System</p>
                    <p>{new Date().toLocaleDateString()} &bull; {new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    );
}
