import { requireAuth } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Shield, Users, FileText, Award, Database, Settings } from 'lucide-react';
import { SeedAchievementsButton } from '@/components/admin/SeedAchievementsButton';

async function getAdminStats() {
  const [totalUsers, totalTests, totalQuestions, totalAchievements, contentAreas] = await Promise.all([
    prisma.user.count(),
    prisma.testAttempt.count({ where: { status: 'COMPLETED' } }),
    prisma.question.count({ where: { approvalStatus: 'APPROVED' } }),
    prisma.achievement.count(),
    prisma.contentArea.count(),
  ]);

  return {
    totalUsers,
    totalTests,
    totalQuestions,
    totalAchievements,
    contentAreas,
  };
}

export default async function AdminDashboard() {
  const session = await requireAuth();

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-700" />
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-slate-600">
          Manage system settings, users, content, and view platform statistics
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Completed Tests</p>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalTests}</p>
        </div>

        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Questions</p>
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalQuestions}</p>
        </div>

        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Achievements</p>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalAchievements}</p>
        </div>
      </div>

      {/* Management Sections */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-700 transition-colors">
                  User Management
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                  View users, monitor progress, and reset accounts
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/knowledge-base"
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Question Bank
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                  Manage questions by category and control visibility
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/thresholds"
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                <Settings className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  Financial Thresholds
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                  Manage regulatory financial thresholds and limits
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Achievements System</h3>
                <SeedAchievementsButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-700" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
            <span className="text-sm font-medium text-slate-600">Database</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
            <span className="text-sm font-medium text-slate-600">Content Areas</span>
            <span className="text-sm font-bold text-slate-900">{stats.contentAreas} Active</span>
          </div>
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
            <span className="text-sm font-medium text-slate-600">System Version</span>
            <span className="text-sm font-bold text-slate-900">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
