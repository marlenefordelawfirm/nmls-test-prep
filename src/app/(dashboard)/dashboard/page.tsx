import { getCurrentUser } from '@/lib/utils/auth';
import { Clock, CheckCircle2, ArrowRight, TrendingUp, Zap, Lightbulb } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userName = user?.name?.split(' ')[0] || 'Student';

  // Mock data - will be replaced with real data from database
  const overallProgress = 75;
  const weeklyGoal = 85;
  const studyStreak = 14;
  const readinessStatus = 'On Track';
  const modulesCompleted = 12;
  const totalModules = 18;

  return (
    <div className="space-y-8">
      {/* Welcome Section with Stats */}
      <section className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {userName}
            </h1>
            <p className="text-slate-500 leading-relaxed max-w-xl">
              You've completed <span className="font-bold text-blue-700">{modulesCompleted}/{totalModules} modules</span>.
              Your personalized learning path has identified 3 areas for optimization today to stay on track for your exam.
            </p>
          </div>
          <div className="flex gap-12 text-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Goal</p>
              <p className="text-2xl font-bold text-slate-800">{weeklyGoal}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Study Streak</p>
              <p className="text-2xl font-bold text-slate-800">{studyStreak} Days</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Readiness</p>
              <p className="text-2xl font-bold text-emerald-600">{readinessStatus}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Module Progress */}
      <section className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                In Progress
              </span>
              <span className="text-slate-300 text-xs">| Course ID: FM-2024</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Federal Mortgage Laws
            </h2>
            <p className="text-slate-500 text-lg mb-8">
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
              <span className="text-4xl font-black text-slate-800 tracking-tighter">{overallProgress}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* Performance and Focus Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Performance */}
        <article className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Recent Performance</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              +5% increase
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-1 h-32 mb-8">
            {[40, 55, 50, 65, 80, 75, 92].map((height, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t-md transition-all ${
                  index === 6 ? 'bg-blue-700' : 'bg-slate-200 hover:brightness-95'
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
              <p className="text-2xl font-bold text-slate-800">84%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time on Site</p>
              <p className="text-2xl font-bold text-slate-800">22.5h</p>
            </div>
          </div>
        </article>

        {/* AI-Driven Focus Areas */}
        <article className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">AI-Driven Focus Areas</h3>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Priority Topics</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  TILA Disclosures
                </span>
                <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  APR Calculation
                </span>
                <span className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-full border border-slate-200">
                  Privacy Act
                </span>
                <span className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-full border border-slate-200">
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
