import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/admin/dashboard/interview-panel');
    }

    // Directly check if user exists in Admin table (super admin only)
    const admin = await prisma.admin.findUnique({
        where: { email: session.user.email }
    });

    if (!admin) {
        redirect('/admin/dashboard/interview-panel');
    }

    return <SettingsClient />;
}
