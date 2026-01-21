import Sidebar from '@/components/admin/Sidebar';
import { signOut } from '@/auth';
import { getNewApplicationCount } from '@/lib/application-actions';
import { getSystemSetting } from '@/lib/settings-actions';
import ApplicationListener from '@/components/admin/ApplicationListener';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [newApplicationCount, logoUrl] = await Promise.all([
    getNewApplicationCount(),
    getSystemSetting('company_logo')
  ]);

  return (
    <div className={`flex h-screen flex-col md:flex-row md:overflow-hidden bg-background ${inter.className}`}>
      <ApplicationListener />
      <div className="w-full flex-none md:w-64 print:hidden">
        <Sidebar newApplicationCount={newApplicationCount} logoUrl={logoUrl} />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 print:p-0 print:overflow-visible">
        {children}
      </div>
    </div>
  );
}
