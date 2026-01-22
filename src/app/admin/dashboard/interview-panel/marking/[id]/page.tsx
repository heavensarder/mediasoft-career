import { getInterviewApplicant, getMarking } from '@/lib/interview-actions';
import { getSessionUser, getMarkingPermissions } from '@/lib/interview-auth';
import MarkingForm from './MarkingForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface MarkingPageProps {
    params: Promise<{ id: string }>;
}

export default async function MarkingPage({ params }: MarkingPageProps) {
    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">Invalid application ID</p>
            </div>
        );
    }

    const [user, { application, error }, { marking }] = await Promise.all([
        getSessionUser(),
        getInterviewApplicant(applicationId),
        getMarking(applicationId),
    ]);

    if (error || !application) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">{error || 'Application not found'}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">Unauthorized</p>
            </div>
        );
    }

    const permissions = await getMarkingPermissions(user.id);

    return (
        <div className="premium-bg min-h-screen text-slate-800 p-4 sm:p-8 -m-4 sm:-m-6 md:-m-12">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Link href="/admin/dashboard/interview-panel">
                    <Button variant="ghost" className="gap-2 mb-6 hover:bg-white/50">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Interview Panel
                    </Button>
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">
                        Interview Marking
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">
                        Enter scores for the candidate evaluation
                    </p>
                </div>

                {/* Applicant Info Card */}
                <div className="premium-glass-card p-6 mb-6">
                    <div className="flex items-center gap-4">
                        {application.photo ? (
                            <img
                                src={application.photo}
                                alt=""
                                className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-lg"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold ring-2 ring-white shadow-lg">
                                {application.fullName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{application.fullName}</h2>
                            <p className="text-slate-600 font-medium">{(application as any).job?.title || 'Position'}</p>
                            <p className="text-sm text-slate-500">{application.email}</p>
                        </div>
                    </div>
                </div>

                {/* Marking Form */}
                <MarkingForm
                    applicationId={applicationId}
                    initialMarking={marking}
                    permissions={permissions || { writtenExam: false, technicalViva: false, project: false }}
                    userRole={user.role}
                />
            </div>
        </div>
    );
}

