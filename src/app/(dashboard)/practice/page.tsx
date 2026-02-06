import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';
import Link from 'next/link';
import { BookOpen, ArrowRight, Target } from 'lucide-react';

export default async function PracticePage() {
  const user = await getCurrentUser();

  // Fetch all content areas with their sub-topics and question counts
  const contentAreas = await prisma.contentArea.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      subTopics: {
        select: { id: true }
      },
      questions: {
        select: { id: true }
      }
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Choose Your Practice Area
            </h1>
            <p className="text-slate-600 leading-relaxed max-w-2xl">
              Select a content area to start practicing. Each practice session includes 20 questions
              tailored to your skill level and performance history.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
            <Target className="w-5 h-5 text-blue-700" />
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Your Goal</p>
              <p className="text-sm font-bold text-slate-900">Pass NMLS Exam</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentAreas.map((area) => {
          const questionCount = area.questions.length;
          const subTopicCount = area.subTopics.length;

          return (
            <article
              key={area.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all group"
            >
              <div className="p-6 space-y-4">
                {/* Icon and Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <BookOpen className="w-6 h-6 text-blue-700" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                    {area.percentageOfExam}% of Exam
                  </span>
                </div>

                {/* Title and Description */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {area.name}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {area.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Questions</p>
                    <p className="text-lg font-bold text-slate-900">{questionCount}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-500">Sub-Topics</p>
                    <p className="text-lg font-bold text-slate-900">{subTopicCount}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/practice/${area.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-all shadow-sm group-hover:shadow-md"
                >
                  Start Practice
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      {/* Info Banner */}
      <section className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-900 mb-2">
              Adaptive Learning System
            </h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Our AI-powered system tracks your performance and adjusts question difficulty in real-time.
              Questions focus on areas where you need the most improvement, ensuring efficient study sessions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
