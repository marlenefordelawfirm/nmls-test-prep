'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target, Zap, Calendar, TrendingUp, BookOpen, CheckCircle2, RefreshCw } from 'lucide-react';
import { AchievementIcon } from '@/components/AchievementIcon';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  icon: string | null;
  category: string;
  completedAt?: Date | null;
}

interface AchievementsData {
  achievements: Achievement[];
  stats: {
    totalAchievements: number;
    completedAchievements: number;
    perfectScores: number;
    studyStreak: number;
    testsCompleted: number;
    totalStudyHours: number;
  };
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/achievements');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch achievements');
      }

      setData(result.data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data for development (unused now)
  const _mockData: AchievementsData = {
    achievements: [],
    stats: {
      totalAchievements: 0,
      completedAchievements: 0,
      perfectScores: 0,
      studyStreak: 0,
      testsCompleted: 0,
      totalStudyHours: 0
    }
  };

  const getIcon = (icon: Achievement['icon']) => {
    // Icons are now stored as emoji strings in the database
    // Return Trophy as fallback icon component
    return Trophy;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      tests: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      study: 'bg-indigo-50 dark:bg-blue-900/20 border-indigo-200 dark:border-blue-800',
      performance: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      consistency: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    };
    return colorMap[category];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 dark:bg-neutral-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 dark:bg-neutral-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{error || 'No achievements data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { achievements, stats } = data;
  const completionPercentage = Math.round((stats.completedAchievements / stats.totalAchievements) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white mb-2">
                Your Achievements
              </h1>
              <p className="text-slate-600 dark:text-gray-400 dark:text-gray-400">
                Track your progress and celebrate your milestones
              </p>
            </div>
            <button
              onClick={fetchAchievements}
              className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Overall Progress</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300 dark:text-gray-300">
                  {stats.completedAchievements} of {stats.totalAchievements} achievements unlocked
                </span>
                <span className="text-sm font-bold text-blue-700">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-neutral-700 dark:bg-neutral-700 rounded-full h-3">
                <div
                  className="bg-blue-700 h-3 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Perfect Scores
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{stats.perfectScores}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Study Streak
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{stats.studyStreak} days</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Tests Completed
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{stats.testsCompleted}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Study Hours
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{stats.totalStudyHours}h</p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">All Achievements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);

              return (
                <div
                  key={achievement.id}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    achievement.isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                      : getCategoryColor(achievement.category)
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      achievement.isCompleted
                        ? 'bg-emerald-600'
                        : 'bg-blue-700'
                    }`}>
                      {achievement.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <AchievementIcon icon={achievement.icon || 'trophy'} className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${
                          achievement.isCompleted
                            ? 'text-emerald-900 dark:text-emerald-100'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {achievement.title}
                        </h3>
                        {achievement.isCompleted && (
                          <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mb-3 ${
                        achievement.isCompleted
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-600 dark:text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {!achievement.isCompleted && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 dark:text-gray-300 dark:text-gray-300">
                              {achievement.progress} / {achievement.target}
                            </span>
                            <span className="text-xs font-bold text-blue-700">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-neutral-700 dark:bg-neutral-700 rounded-full h-2">
                            <div
                              className="bg-blue-700 h-2 rounded-full transition-all"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
