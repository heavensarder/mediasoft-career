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
  ChevronDown
} from 'lucide-react';
import { handleSignOut } from '@/lib/auth-actions';
import { useState } from 'react';


const menuItems = [
  {
    title: 'Job Recruitment',
    icon: Briefcase,
    submenu: [
      { name: 'Overview', href: '/admin/dashboard/job-recruitment/overview', icon: LayoutDashboard },
      { name: 'Job List', href: '/admin/dashboard/job-recruitment/job-list', icon: Briefcase },
      { name: 'Add New Job', href: '/admin/dashboard/job-recruitment/add-new-job', icon: PlusCircle },
      { name: 'Applications', href: '/admin/dashboard/job-recruitment/applications', icon: Users, showCount: true },
      { name: 'Settings', href: '/admin/dashboard/job-recruitment/settings', icon: Settings },
      { name: 'Export', href: '/admin/dashboard/job-recruitment/export', icon: Download },
    ],
  },
  {
    title: 'White Label',
    icon: Settings,
    submenu: [
      { name: 'Branding', href: '/admin/dashboard/white-label', icon: Settings },
    ]
  }
];

interface SidebarProps {
  newApplicationCount?: number;
  logoUrl?: string | null;
}

export default function Sidebar({ newApplicationCount = 0, logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Job Recruitment', 'White Label']);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="flex h-full flex-col bg-white/30 backdrop-blur-xl border-r border-white/40 w-64 z-20 shadow-xl">
      {/* Header / Brand */}
      <div className="flex h-16 items-center px-6 border-b border-white/40 bg-white/20">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Company Logo" className="h-8 max-w-[150px] object-contain" />
          ) : (
            <>
              <div className="h-8 w-8 bg-primary/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                M
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">MediaSoft</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => (
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
                    const isActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
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
                        {subItem.showCount && newApplicationCount > 0 && (
                          <span className={clsx(
                            "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full text-[10px] font-bold px-1",
                            isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                          )}>
                            {newApplicationCount}
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
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Admin User</span>
            <span className="text-xs text-muted-foreground">admin@mediasoft.com</span>
          </div>
        </div>
        <form action={handleSignOut}>
          <button className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/20">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
