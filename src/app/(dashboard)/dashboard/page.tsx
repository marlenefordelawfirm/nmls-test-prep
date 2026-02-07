import { getCurrentUser } from '@/lib/utils/auth';
import { Clock, CheckCircle2, ArrowRight, TrendingUp, Zap, Lightbulb, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userName = user?.name?.split(' ')[0] || 'Student';

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  // Fetch real data from database
  const [testAttempts, contentAreas, userProgress] = await Promise.all([
    prisma.testAttempt.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        createdAt: true,
        rawScore: true,
        totalQuestions: true,
        correctAnswers: true,
        startTime: true,
        endTime: true,
      },
    }),
    prisma.contentArea.findMany({
      select: { id: true },
    }),
    prisma.userContentAreaProgress.findMany({
      where: { userId: user.id },
      select: {
        contentAreaId: true,
        masteryScore: true,
        status: true,
      },
    }),
  ]);

  // Calculate study streak (consecutive days with at least one test)
  let studyStreak = 0;
  if (testAttempts.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const testDates = Array.from(
      new Set(
        testAttempts.map(t => {
          const date = new Date(t.createdAt);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      )
    ).sort((a, b) => b - a);

    for (let i = 0; i < testDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (testDates[i] === expectedDate.getTime()) {
        studyStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate weekly goal (tests completed in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyTests = testAttempts.filter(t => new Date(t.createdAt) >= sevenDaysAgo).length;
  const weeklyGoal = Math.min(100, (weeklyTests / 5) * 100); // Goal: 5 tests per week

  // Calculate overall progress (average mastery across all content areas)
  const overallProgress = userProgress.length > 0
    ? Math.round(userProgress.reduce((sum, p) => sum + p.masteryScore, 0) / userProgress.length)
    : 0;

  // Calculate modules completed (content areas with 75%+ mastery)
  const totalModules = contentAreas.length;
  const modulesCompleted = userProgress.filter(p => p.masteryScore >= 75).length;

  // Calculate readiness status
  const readinessStatus = overallProgress >= 75 ? 'Ready' : overallProgress >= 60 ? 'On Track' : 'Needs Work';

  // Get recent 7 test scores for performance chart
  const recentScores = testAttempts.slice(0, 7).reverse().map(t =>
    Math.round((t.correctAnswers / t.totalQuestions) * 100)
  );
  // Pad with zeros if less than 7 tests
  while (recentScores.length < 7) {
    recentScores.unshift(0);
  }

  // Calculate average score
  const averageScore = testAttempts.length > 0
    ? Math.round(testAttempts.reduce((sum, t) => sum + ((t.correctAnswers / t.totalQuestions) * 100), 0) / testAttempts.length)
    : 0;

  // Calculate total study time
  const totalStudyMinutes = testAttempts.reduce((sum, t) => {
    if (t.startTime && t.endTime) {
      return sum + (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / (1000 * 60);
    }
    return sum;
  }, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Calculate score trend (compare last 3 vs previous 3)
  const scoreTrend = testAttempts.length >= 6
    ? (() => {
      const recent3 = testAttempts.slice(0, 3).reduce((sum, t) => sum + t.rawScore, 0) / 3;
      const previous3 = testAttempts.slice(3, 6).reduce((sum, t) => sum + t.rawScore, 0) / 3;
      return Math.round(recent3 - previous3);
    })()
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section with Stats */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back, {userName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              You've completed <span className="font-bold text-blue-700">{modulesCompleted}/{totalModules} modules</span>.
              Your personalized learning path has identified 3 areas for optimization today to stay on track for your exam.
            </p>
          </div>
          <div className="flex gap-12 text-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Goal</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{weeklyGoal}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Study Streak</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{studyStreak} Days</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Readiness</p>
              <p className="text-2xl font-bold text-emerald-600">{readinessStatus}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/practice"
          className="bg-blue-700 hover:bg-blue-800 text-white p-6 rounded-xl shadow-lg transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Start Practice</h3>
            <p className="text-sm text-blue-100">Choose a content area</p>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <button
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-6 rounded-xl transition-all flex items-center gap-4 group"
          disabled
        >
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Full Exam</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">125 questions, 190 min</p>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full font-bold">Soon</span>
        </button>

        <button
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-6 rounded-xl transition-all flex items-center gap-4 group"
          disabled
        >
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Review Weak Areas</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">AI-suggested topics</p>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full font-bold">Soon</span>
        </button>
      </section>

      {/* Current Module Progress */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                In Progress
              </span>
              <span className="text-slate-300 text-xs">| Course ID: FM-2024</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Federal Mortgage Laws
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
              Module 4: Disclosure Requirements & Consumer Privacy Regulations
            </p>
            <div className="flex items-center gap-8 mb-10">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-slate-600">4h 25m remaining</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-slate-600">6 Lessons left</span>
              </div>
            </div>
            <button
              className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all flex items-center gap-3 shadow-lg"
              disabled
            >
              Continue learning
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Circular Progress */}
          <div className="flex-shrink-0 relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r="80"
                fill="transparent"
                stroke="#E0E7FF"
                strokeWidth="16"
              />
              <circle
                cx="128"
                cy="128"
                r="80"
                fill="transparent"
                stroke="#1E40AF"
                strokeWidth="16"
                strokeDasharray="502.65"
                strokeDashoffset={502.65 - (502.65 * overallProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{overallProgress}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* Performance and Focus Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Performance */}
        <article className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Performance</h3>
            {scoreTrend !== 0 && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${scoreTrend > 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
                }`}>
                <TrendingUp className={`w-4 h-4 ${scoreTrend < 0 ? 'rotate-180' : ''}`} />
                {scoreTrend > 0 ? '+' : ''}{scoreTrend}% {scoreTrend > 0 ? 'increase' : 'decrease'}
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-1 h-32 mb-8">
            {recentScores.map((score, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t-md transition-all ${index === 6 ? 'bg-blue-700' : 'bg-slate-200 hover:brightness-95'
                  }`}
                style={{ height: `${score}%` }}
                title={`${score}%`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{averageScore}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time on Site</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalStudyHours}h</p>
            </div>
          </div>
        </article>

        {/* AI-Driven Focus Areas */}
        <article className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI-Driven Focus Areas</h3>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Priority Topics</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  TILA Disclosures
                </span>
                <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  APR Calculation
                </span>
                <span className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full border border-slate-200">
                  Privacy Act
                </span>
                <span className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full border border-slate-200">
                  Escrow Rules
                </span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-indigo-900 mb-1">Learning Insight</p>
                  <p className="text-sm text-indigo-700 leading-snug">
                    You're struggling with "Timing requirements for Initial Disclosures".
                    Review Lesson 4.2 before your next mock exam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
