'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Settings,
  Download,
  LogOut,
  ChevronDown,
  Globe,
  Terminal,
  ClipboardList,
  UserCheck,
  Mail,
  History
} from 'lucide-react';
import { handleSignOut } from '@/lib/auth-actions';
import { getNewApplicationCount } from '@/lib/application-actions';
import { useState, useEffect } from 'react';


const menuItems = [
  {
    title: 'Job Recruitment',
    icon: Briefcase,
    adminOnly: true,
    submenu: [
      { name: 'Overview', href: '/admin/dashboard/job-recruitment/overview', icon: LayoutDashboard },
      { name: 'Job List', href: '/admin/dashboard/job-recruitment/job-list', icon: Briefcase },
      { name: 'Add New Job', href: '/admin/dashboard/job-recruitment/add-new-job', icon: PlusCircle },
      { name: 'Applications', href: '/admin/dashboard/job-recruitment/applications', icon: Users, showCount: true },
      { name: 'Manage', href: '/admin/dashboard/job-recruitment/settings', icon: Settings },
      { name: 'Export', href: '/admin/dashboard/job-recruitment/export', icon: Download },
    ],
  },
  {
    title: 'Interview Panel',
    icon: ClipboardList,
    submenu: [
      { name: 'Interview List', href: '/admin/dashboard/interview-panel', icon: ClipboardList, exact: true },
      { name: 'Interviewer', href: '/admin/dashboard/interview-panel/interviewers', icon: UserCheck, adminOnly: true },
    ],
  },
  {
    title: 'White Label',
    icon: Settings,
    adminOnly: true,
    submenu: [
      { name: 'Branding', href: '/admin/dashboard/white-label', icon: Settings, exact: true },
      { name: 'Image Slider', href: '/admin/dashboard/white-label/image-slider', icon: LayoutDashboard },
      { name: 'SEO Manager', href: '/admin/dashboard/seo-manager', icon: Globe },
    ]
  },
  {
    title: 'Developer',
    icon: Terminal,
    adminOnly: true,
    submenu: [
      { name: 'API Zone', href: '/admin/dashboard/developer-zone', icon: Terminal, exact: true },
      { name: 'History', href: '/admin/dashboard/developer-zone/history', icon: History }
    ]
  }
];

interface SidebarProps {
  newApplicationCount?: number;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  userRole?: 'admin' | 'interview_admin';
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({
  newApplicationCount = 0,
  logoUrl,
  faviconUrl,
  userRole = 'admin',
  userName = 'Admin User',
  userEmail = 'admin@mediasoft.com'
}: SidebarProps) {
  const pathname = usePathname();
  const isMainAdmin = userRole === 'admin';

  // Filter menu items based on role
  const filteredMenuItems = menuItems
    .filter(item => !item.adminOnly || isMainAdmin)
    .map(item => ({
      ...item,
      submenu: item.submenu.filter(subItem => !(subItem as any).adminOnly || isMainAdmin)
    }));

  const [openMenus, setOpenMenus] = useState<string[]>(
    isMainAdmin
      ? ['Job Recruitment', 'Interview Panel', 'White Label']
      : ['Interview Panel']
  );
  const [appCount, setAppCount] = useState(newApplicationCount);

  useEffect(() => {
    // Initial sync
    setAppCount(newApplicationCount);
  }, [newApplicationCount]);

  // Removed redundant fetch on navigation to improve performance
  // The count is updated via Server Actions calling router.refresh() 
  // which updates the 'newApplicationCount' prop from layout.tsx

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="flex h-full flex-col bg-white/40 backdrop-blur-xl border-r border-white/50 w-64 z-20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Header / Brand */}
      <div className="flex h-16 items-center px-6 border-b border-white/40 bg-white/20">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard/job-recruitment/overview">
            {logoUrl ? (
              <img src={logoUrl} alt="Company Logo" className="h-10 max-w-[160px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                  M
                </div>
                <span className="text-lg font-bold text-slate-800 tracking-tight">MediaSoft</span>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => (
            <div key={item.title} className="mb-4">
              {/* Section Title as Button */}
              <button
                onClick={() => toggleMenu(item.title)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2 hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  {item.title}
                </div>
                <ChevronDown
                  className={clsx('h-3 w-3 transition-transform', {
                    'rotate-180': openMenus.includes(item.title),
                  })}
                />
              </button>

              {/* Submenu Items */}
              {openMenus.includes(item.title) && (
                <div className="space-y-1">
                  {item.submenu.map((subItem) => {
                    const isActive = (subItem as any).exact
                      ? pathname === subItem.href
                      : pathname === subItem.href || pathname.startsWith(subItem.href + '/');

                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={clsx(
                          'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                          {
                            'bg-primary/10 text-primary': isActive,
                            'text-muted-foreground hover:text-foreground hover:bg-muted': !isActive,
                          }
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <subItem.icon className={clsx("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                          <span>{subItem.name}</span>
                        </div>
                        {(subItem as any).showCount && appCount > 0 && (
                          <span className={clsx(
                            "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full text-[10px] font-bold px-1",
                            isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                          )}>
                            {appCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-200 p-4 bg-slate-50/50">
        {/* User Info Card */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 mb-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-white shadow-sm">
            {faviconUrl ? (
              <img src={faviconUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-slate-800 truncate">{userName}</span>
            <span className="text-[11px] text-slate-500 truncate">{userEmail}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5">
          {isMainAdmin && (
            <>
              <Link
                href="/admin/dashboard/mail-configuration"
                className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <Mail className="mr-2.5 h-4 w-4 text-slate-400" />
                Mail Configuration
              </Link>
              <Link
                href="/admin/dashboard/settings"
                className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <Settings className="mr-2.5 h-4 w-4 text-slate-400" />
                Settings
              </Link>
            </>
          )}
          <form action={handleSignOut}>
            <button className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="mr-2.5 h-4 w-4 text-red-400" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
