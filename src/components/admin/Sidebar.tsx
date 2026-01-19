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
];

interface SidebarProps {
  newApplicationCount?: number;
}

export default function Sidebar({ newApplicationCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Job Recruitment']);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border shadow-lg z-10">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <div key={item.title}>
              <button
                onClick={() => toggleMenu(item.title)}
                className="flex w-full items-center justify-between rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-all"
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </div>
                <ChevronDown
                  className={clsx('h-4 w-4 transition-transform', {
                    'rotate-180': openMenus.includes(item.title),
                  })}
                />
              </button>
              {openMenus.includes(item.title) && (
                <div className="mt-1 space-y-1 pl-10">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={clsx(
                        'flex items-center justify-between rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
                        {
                          'clay-button text-white shadow-md': pathname === subItem.href,
                          'text-muted-foreground hover:text-primary hover:bg-sidebar-accent': pathname !== subItem.href,
                        }
                      )}
                    >
                      <span>{subItem.name}</span>
                      {subItem.showCount && newApplicationCount > 0 && (
                        <span className={clsx(
                          "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                          pathname === subItem.href ? "bg-white text-primary" : "bg-primary text-white"
                        )}>
                          {newApplicationCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-sidebar-border p-4">
        <form action={handleSignOut}>
          <button className="flex w-full items-center rounded-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
