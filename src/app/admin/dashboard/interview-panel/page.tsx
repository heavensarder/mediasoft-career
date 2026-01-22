import { getInterviewApplicants, getInterviewAdmins } from '@/lib/interview-actions';
import { auth } from '@/auth';
import InterviewPanelClient from './InterviewPanelClient';

export const dynamic = 'force-dynamic';

export default async function InterviewPanelPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'admin';
    const userId = (session?.user as any)?.id;

    const [{ applications, error }, { interviewers }] = await Promise.all([
        getInterviewApplicants(),
        getInterviewAdmins()
    ]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <InterviewPanelClient
            applications={applications}
            userRole={userRole}
            userId={userId}
            interviewers={interviewers}
        />
    );
}

