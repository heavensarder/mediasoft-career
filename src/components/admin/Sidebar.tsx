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
    <div className="flex h-full flex-col bg-slate-900 text-white w-64">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <div key={item.title}>
              <button
                onClick={() => toggleMenu(item.title)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
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
                        'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white',
                        {
                          'bg-slate-800 text-white': pathname === subItem.href,
                          'text-slate-400': pathname !== subItem.href,
                        }
                      )}
                    >
                      <span>{subItem.name}</span>
                      {subItem.showCount && newApplicationCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
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
      <div className="border-t border-slate-800 p-4">
        <form action={handleSignOut}>
          <button className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
