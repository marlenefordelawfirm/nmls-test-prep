'use client';

import { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Clock, Target, BookOpen, Award, Calendar, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalPracticeTests: number;
    totalFullExams: number;
    totalQuestions: number;
    averageScore: number;
    totalStudyTimeMinutes: number;
    studyDays: number;
  };
  performanceByArea: {
    contentAreaId: string;
    contentAreaName: string;
    questionsAnswered: number;
    correctAnswers: number;
    averageScore: number;
  }[];
  recentActivity: {
    date: string;
    type: 'PRACTICE' | 'FULL_EXAM';
    contentArea?: string;
    score: number;
    timeSpent: number;
  }[];
  weakAreas: {
    subTopicName: string;
    accuracy: number;
    questionsAnswered: number;
  }[];
  strengths: {
    subTopicName: string;
    accuracy: number;
    questionsAnswered: number;
  }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Network error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <p className="text-sm text-red-700">{error || 'No analytics data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { overview, performanceByArea, recentActivity, weakAreas, strengths } = analytics;
  const studyHours = Math.floor(overview.totalStudyTimeMinutes / 60);
  const studyMinutes = overview.totalStudyTimeMinutes % 60;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white mb-2">
                Your Analytics
              </h1>
              <p className="text-slate-600">
                Track your progress and identify areas for improvement
              </p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <BarChart className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Practice Tests
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{overview.totalPracticeTests}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Full Exams
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{overview.totalFullExams}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Questions Answered
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{overview.totalQuestions.toLocaleString()}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Average Score
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">{Math.round(overview.averageScore)}%</p>
          </div>
        </div>

        {/* Study Time & Consistency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Total Study Time</h2>
            </div>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-blue-700">
                {studyHours}h {studyMinutes}m
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">
                Across {overview.studyDays} {overview.studyDays === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Study Consistency</h2>
            </div>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-emerald-600">
                {overview.studyDays}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">
                {overview.studyDays >= 7 ? 'Excellent consistency! 🔥' : 'Keep building your streak!'}
              </p>
            </div>
          </div>
        </div>

        {/* Performance by Content Area */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Performance by Content Area</h2>
          </div>
          <div className="space-y-4">
            {performanceByArea.map((area) => (
              <div key={area.contentAreaId} className="border-b border-slate-100 dark:border-neutral-700 dark:border-neutral-700 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white dark:text-white">{area.contentAreaName}</p>
                    <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">
                      {area.questionsAnswered} {area.questionsAnswered === 1 ? 'question' : 'questions'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      area.averageScore >= 75 ? 'text-emerald-600' :
                      area.averageScore >= 60 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {Math.round(area.averageScore)}%
                    </p>
                    <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">
                      {area.correctAnswers}/{area.questionsAnswered} correct
                    </p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-neutral-800 dark:bg-neutral-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      area.averageScore >= 75 ? 'bg-emerald-600' :
                      area.averageScore >= 60 ? 'bg-amber-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(area.averageScore, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <ArrowUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Top Strengths</h2>
            </div>
            {strengths.length > 0 ? (
              <div className="space-y-3">
                {strengths.map((strength, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{strength.subTopicName}</p>
                      <p className="text-xs text-emerald-700">
                        {strength.questionsAnswered} {strength.questionsAnswered === 1 ? 'question' : 'questions'}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">{Math.round(strength.accuracy)}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-gray-400 dark:text-gray-400">Complete more tests to see your strengths!</p>
            )}
          </div>

          {/* Weaknesses */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <ArrowDown className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Areas to Improve</h2>
            </div>
            {weakAreas.length > 0 ? (
              <div className="space-y-3">
                {weakAreas.map((weakness, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                    <div>
                      <p className="text-sm font-bold text-red-900">{weakness.subTopicName}</p>
                      <p className="text-xs text-red-700">
                        {weakness.questionsAnswered} {weakness.questionsAnswered === 1 ? 'question' : 'questions'}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-red-600">{Math.round(weakness.accuracy)}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-gray-400 dark:text-gray-400">Great job! No weak areas identified yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Recent Activity</h2>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-neutral-700 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white dark:text-white">
                      {activity.type === 'PRACTICE' ? 'Practice Test' : 'Full Exam'}
                      {activity.contentArea ? ` - ${activity.contentArea}` : ''}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString()} • {formatTime(Math.floor(activity.timeSpent / 60))}
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${
                    activity.score >= 75 ? 'text-emerald-600' :
                    activity.score >= 60 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {Math.round(activity.score)}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-gray-400 dark:text-gray-400">No recent activity to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}
