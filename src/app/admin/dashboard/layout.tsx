import Sidebar from '@/components/admin/Sidebar';
import { auth } from '@/auth';
import { getNewApplicationCount } from '@/lib/application-actions';
import { getSystemSetting } from '@/lib/settings-actions';
import ApplicationListener from '@/components/admin/ApplicationListener';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const [newApplicationCount, logoUrl, faviconUrl] = await Promise.all([
    getNewApplicationCount(),
    getSystemSetting('company_logo'),
    getSystemSetting('site_favicon')
  ]);

  const userRole = (session?.user as any)?.role || 'admin';
  const userName = session?.user?.name || 'Admin User';
  const userEmail = session?.user?.email || 'admin@mediasoft.com';

  return (
    <div className={`flex h-screen flex-col md:flex-row md:overflow-hidden bg-background ${inter.className}`}>
      <ApplicationListener />
      <div className="w-full flex-none md:w-64 print:hidden">
        <Sidebar
          newApplicationCount={newApplicationCount}
          logoUrl={logoUrl}
          faviconUrl={faviconUrl}
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
        />
      </div>
      <div className="flex-grow flex flex-col md:overflow-y-auto print:overflow-visible">
        <div className="flex-grow p-6 md:p-12 print:p-0">
          {children}
        </div>
        {/* Copyright Footer */}
        <footer className="p-4 text-center text-xs text-muted-foreground border-t border-slate-100 bg-white/50 print:hidden">
          © {new Date().getFullYear()}{' '}
          <a
            href="https://www.mediasoftbd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Mediasoft Data Systems Limited
          </a>
          . All rights reserved.
        </footer>
      </div>
    </div>
  );
}

