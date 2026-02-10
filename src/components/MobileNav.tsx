'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, BookOpen, BarChart3, Bot, GraduationCap, Trophy, Settings, HelpCircle, Shield } from 'lucide-react';

interface MobileNavProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export function MobileNav({ userName, userEmail, userRole }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Practice Tests', href: '/practice', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Study Agent', href: '/agent', icon: Bot },
    { name: 'Full Exam', href: '/exam', icon: GraduationCap },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
    { name: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter(
    (item) => !item.adminOnly || userRole === 'ADMIN'
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden h-10 w-10 flex items-center justify-center text-slate-700 dark:text-slate-300"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-slate-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-indigo-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">NMLS Prep</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Icon className="w-5 h-5 text-slate-400 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-blue-400" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 dark:text-blue-300 font-semibold">
                {userName?.[0] || userEmail?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {userName || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
