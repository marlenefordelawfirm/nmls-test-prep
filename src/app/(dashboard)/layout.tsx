import { requireAuth } from '@/lib/utils/auth';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeSync } from '@/components/ThemeSync';
import { MobileNav } from '@/components/MobileNav';
import {
  Home,
  BookOpen,
  BarChart3,
  Bot,
  Settings,
  HelpCircle,
  GraduationCap,
  Trophy,
  Shield
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

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
    (item) => !item.adminOnly || session.user.role === 'ADMIN'
  );

  return (
    <>
      {/* Sync user's theme preference from database */}
      <ThemeSync />

      {/* Accessibility: Skip to main content */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex">
        {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700 flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-neutral-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">NMLS Prep</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-indigo-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Icon className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-blue-400" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 dark:text-blue-300 font-semibold">
                {session.user.name?.[0] || session.user.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <MobileNav
              userName={session.user.name || 'Student'}
              userEmail={session.user.email || ''}
              userRole={session.user.role || ''}
            />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome back, {session.user.name || 'Student'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {session.user.role === 'ADMIN' && (
              <span className="px-2 py-1 bg-indigo-100 dark:bg-blue-900 text-indigo-700 dark:text-blue-300 rounded-full text-xs font-medium">
                Admin
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-gray-50 dark:bg-neutral-950 p-6">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
