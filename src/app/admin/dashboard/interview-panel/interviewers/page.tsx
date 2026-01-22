import { getInterviewers } from '@/lib/interviewer-actions';
import { getSessionUser } from '@/lib/interview-auth';
import { redirect } from 'next/navigation';
import InterviewersClient from './InterviewersClient';

export const dynamic = 'force-dynamic';

export default async function InterviewersPage() {
    const user = await getSessionUser();

    // Only main admin can access this page
    if (!user) {
        redirect('/admin/login');
    }

    if (user.role !== 'admin') {
        redirect('/admin/dashboard/interview-panel');
    }

    const { interviewers, error } = await getInterviewers();

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return <InterviewersClient interviewers={interviewers || []} />;
}

