
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, 
    Download, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Linkedin, 
    Facebook, 
    Globe, 
    Github,
    Briefcase,
    GraduationCap,
    Award,
    User
} from "lucide-react";
import Link from 'next/link';
import ResumeViewerWrapper from '@/components/admin/ResumeViewerWrapper';
import StatusSelector from '@/components/admin/StatusSelector';
import MarkAsViewed from '@/components/admin/MarkAsViewed';
import PrintButton from '@/components/admin/PrintButton';
import ApplicantEmailModal from '@/components/admin/ApplicantEmailModal';
import { prisma } from '@/lib/prisma';

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
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Screen View */}
            <div className="print:hidden space-y-8">
                <MarkAsViewed id={application.id} status={application.status} />
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard/job-recruitment/applications">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200 hover:bg-slate-100 transition-all hover:scale-105">
                                <ArrowLeft className="h-4 w-4 text-slate-600" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                {application.fullName}
                            </h1>
                            <p className="text-slate-500 font-medium">
                                Applied for <Link href={`/admin/dashboard/job-recruitment/job-list`} className="text-[#00ADE7] hover:underline">{application.job.title}</Link>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <ApplicantEmailModal applicantEmail={application.email} applicantName={application.fullName} />
                        <PrintButton />
                        <StatusSelector id={application.id} currentStatus={application.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar - Profile Overview */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="overflow-hidden border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                            <CardContent className="p-0">
                                <div className="bg-gradient-to-b from-slate-50 to-white p-8 flex flex-col items-center text-center border-b border-slate-100">
                                    {application.photo ? (
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[20px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                            <img 
                                                src={application.photo} 
                                                alt="Applicant" 
                                                className="relative w-48 h-48 rounded-2xl object-cover shadow-2xl border-4 border-white" 
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-48 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-xl">
                                            <User className="h-20 w-20 opacity-20" />
                                        </div>
                                    )}
                                    
                                    <div className="mt-6 space-y-2">
                                        <h2 className="text-2xl font-bold text-slate-900">{application.fullName}</h2>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium rounded-md px-3 py-1 text-xs uppercase tracking-wider">
                                            {application.gender}
                                        </Badge>
                                    </div>

                                    {/* Social Links */}
                                    <div className="flex items-center justify-center gap-4 mt-6">
                                        {application.linkedin && (
                                            <a href={application.linkedin} target="_blank" className="p-2 text-[#0077b5] bg-blue-50 rounded-full hover:bg-[#0077b5] hover:text-white transition-all hover:scale-110 shadow-sm">
                                                <Linkedin className="h-5 w-5" />
                                            </a>
                                        )}
                                        {application.facebook && (
                                            <a href={application.facebook} target="_blank" className="p-2 text-[#1877F2] bg-blue-50 rounded-full hover:bg-[#1877F2] hover:text-white transition-all hover:scale-110 shadow-sm">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        )}
                                        {application.portfolio && (
                                            <a href={application.portfolio} target="_blank" className="p-2 text-slate-600 bg-slate-100 rounded-full hover:bg-slate-800 hover:text-white transition-all hover:scale-110 shadow-sm">
                                                <Globe className="h-5 w-5" />
                                            </a>
                                        )}
                                        {/* Placeholder for Github if we had it, or other links */}
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 bg-white">
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Info</h3>
                                        
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs text-slate-500 font-medium">Email Address</p>
                                                <p className="text-sm font-semibold text-slate-700 truncate" title={application.email}>{application.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                                                <p className="text-sm font-semibold text-slate-700">{application.mobile}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-purple-500 shadow-sm group-hover:scale-110 transition-transform">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Date of Birth</p>
                                                <p className="text-sm font-semibold text-slate-700">{new Date(application.dob).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">NID/Passport</p>
                                                <p className="text-sm font-semibold text-slate-700">{application.nid}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-slate-100">
                                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Salary Expectations</h3>
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Current</p>
                                                <p className="text-sm font-bold text-slate-800">{application.currentSalary || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Expected</p>
                                                <p className="text-sm font-bold text-[#00ADE7]">{application.expectedSalary || "N/A"}</p>
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Summary / Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Education</p>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight mt-0.5">{application.education}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Experience</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{application.experience}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Source</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{application.source}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Professional Details Tabs/Sections */}
                        <Card className="border-0 shadow-md">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="flex items-center gap-2">
                                     <span className="bg-[#00ADE7] w-1 h-6 rounded-full inline-block"></span>
                                     Candidate Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <span className="text-slate-400">01.</span> Career Objective
                                    </h3>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                                        {application.objective || "No objective provided."}
                                    </div>
                                </div>

                                {application.achievements && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <span className="text-slate-400">02.</span> Key Achievements
                                        </h3>
                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                                            {application.achievements}
                                        </div>
                                    </div>
                                )}

                                {application.message && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <span className="text-slate-400">03.</span> Cover Letter / Message
                                        </h3>
                                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm italic">
                                            "{application.message}"
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resume Section */}
                        <Card className="border-0 shadow-md overflow-hidden">
                             <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Download className="h-5 w-5 text-[#00ADE7]" />
                                    Resume & Documents
                                </h3>
                                {application.resume && (
                                    <a href={application.resume} target="_blank" rel="noreferrer">
                                        <Button variant="ghost" size="sm" className="!bg-[#00ADE7] !text-white hover:!bg-[#0095c8] !border-0 !shadow-lg hover:!shadow-xl !transition-all hover:!scale-105 active:!scale-95 !font-bold !px-6 glass-button-filled">
                                            <Download className="mr-2 h-4 w-4" /> Download Resume
                                        </Button>
                                    </a>
                                )}
                             </div>
                            <CardContent className="p-0 bg-slate-100 min-h-[500px]">
                                {application.resume ? (
                                    <ResumeViewerWrapper url={application.resume} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <Download className="h-16 w-16 mb-4 opacity-20" />
                                        <p>No resume uploaded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Dynamic Fields */}
                        {formFields.length > 0 && (
                            <Card className="border-0 shadow-md">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {formFields.map((field) => {
                                            const value = (application.dynamicData as any)?.[field.name];
                                            if (!value) return null;

                                            return (
                                                <div key={field.id} className="group p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                                    <span className="font-semibold block text-xs text-slate-500 uppercase tracking-wider mb-2">{field.label}</span>
                                                    {field.type === 'file' ? (
                                                        <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 font-medium bg-white p-2 rounded border border-slate-200 w-fit">
                                                            <Download className="h-4 w-4" /> Download File
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-800">{value.toString()}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Print View - Official Document Structure (Kept mostly similar but cleaned up) */}
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
