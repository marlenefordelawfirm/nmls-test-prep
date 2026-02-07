'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  User,
  FileText,
  Target,
  Award,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AchievementIcon } from '@/components/AchievementIcon';

interface UserProgress {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    subscriptionTier: string;
    createdAt: string;
  };
  testAttempts: Array<{
    id: string;
    type: string;
    rawScore: number;
    totalQuestions: number;
    correctAnswers: number;
    createdAt: string;
    contentArea: {
      name: string;
    } | null;
  }>;
  contentAreaProgress: Array<{
    id: string;
    masteryScore: number;
    status: string;
    totalAttempts: number;
    bestScore: number | null;
    contentArea: {
      name: string;
    };
  }>;
  achievements: Array<{
    id: string;
    progress: number;
    isCompleted: boolean;
    completedAt: string | null;
    achievement: {
      title: string;
      description: string;
      category: string;
      targetValue: number;
      icon: string;
    };
  }>;
  stats: {
    totalTests: number;
    averageScore: number;
    studyHours: number;
    completedAchievements: number;
  };
}

export default function UserProgressPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchUserProgress();
  }, [userId]);

  const fetchUserProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch user progress');
      }
    } catch (err) {
      setError('Network error fetching user progress');
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async () => {
    if (!confirm(
      'Are you sure you want to reset this user\'s progress? This will delete:\n\n' +
      '• All test attempts and answers\n' +
      '• All content area progress\n' +
      '• All achievement progress\n\n' +
      'This action cannot be undone!'
    )) {
      return;
    }

    setResetting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        alert('User progress has been reset successfully');
        fetchUserProgress(); // Refresh data
      } else {
        setError(result.error || 'Failed to reset user progress');
      }
    } catch (err) {
      setError('Network error resetting user progress');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error || 'User not found'}</p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <AdminBreadcrumb
          items={[
            { label: 'User Management', href: '/admin/users' },
            { label: data.user.name || data.user.email }
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <User className="w-8 h-8 text-blue-700" />
              {data.user.name || 'No Name'}
            </h1>
            <p className="text-slate-600">{data.user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                data.user.role === 'ADMIN'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {data.user.role}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                data.user.subscriptionTier === 'FREE'
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {data.user.subscriptionTier}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUserProgress}
              className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleResetProgress}
              disabled={resetting}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
            >
              {resetting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Reset Progress
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Total Tests</p>
            <FileText className="w-5 h-5 text-blue-700" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.stats.totalTests}</p>
        </div>

        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Average Score</p>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.stats.averageScore}%</p>
        </div>

        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Study Hours</p>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.stats.studyHours}h</p>
        </div>

        <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Achievements</p>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {data.stats.completedAchievements}/{data.achievements.length}
          </p>
        </div>
      </div>

      {/* Content Area Progress */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-700" />
          Content Area Progress
        </h2>
        <div className="space-y-3">
          {data.contentAreaProgress.length > 0 ? (
            data.contentAreaProgress.map((progress) => (
              <div key={progress.id} className="bg-slate-50 dark:bg-neutral-800 rounded-xl p-4 border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{progress.contentArea.name}</span>
                  <span className="text-sm font-bold text-blue-700">{progress.masteryScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-neutral-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-700 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, progress.masteryScore)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Status: <span className="font-medium">{progress.status.replace('_', ' ')}</span></span>
                  <span>Attempts: <span className="font-medium">{progress.totalAttempts}</span></span>
                  <span>Best: <span className="font-medium">{progress.bestScore?.toFixed(1) || 'N/A'}%</span></span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-600 dark:text-gray-400 text-center py-6">No content area progress yet</p>
          )}
        </div>
      </div>

      {/* Test Attempts History */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-700" />
          Recent Test Attempts
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Date</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Type</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Content Area</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Score</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">Questions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.testAttempts.slice(0, 10).map((attempt) => (
                <tr key={attempt.id} className="border-b border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-gray-300 text-xs font-bold rounded border border-slate-200">
                      {attempt.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {attempt.contentArea?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${
                      attempt.rawScore >= 75 ? 'text-emerald-600' :
                      attempt.rawScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {attempt.rawScore.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {attempt.correctAnswers}/{attempt.totalQuestions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.testAttempts.length === 0 && (
          <p className="text-slate-600 dark:text-gray-400 text-center py-6">No test attempts yet</p>
        )}
      </div>

      {/* Achievements Progress */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-700" />
          Achievements Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.achievements.map((ua) => (
            <div key={ua.id} className={`rounded-xl p-4 border ${
              ua.isCompleted
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ua.isCompleted ? 'bg-emerald-600' : 'bg-blue-700'
                }`}>
                  <AchievementIcon icon={ua.achievement.icon || 'trophy'} className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{ua.achievement.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mb-2">{ua.achievement.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          ua.isCompleted ? 'bg-emerald-600' : 'bg-blue-700'
                        }`}
                        style={{ width: `${Math.min(100, (ua.progress / ua.achievement.targetValue) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {ua.progress}/{ua.achievement.targetValue}
                    </span>
                  </div>
                  {ua.isCompleted && ua.completedAt && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Completed {new Date(ua.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
