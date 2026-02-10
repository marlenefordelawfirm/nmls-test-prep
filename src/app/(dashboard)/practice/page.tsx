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
      <section className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Choose Your Practice Area
            </h1>
            <p className="text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl">
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
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {contentAreas.map((area) => {
          const questionCount = area.questions.length;
          const subTopicCount = area.subTopics.length;

          return (
            <article
              key={area.id}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 hover:shadow-lg hover:border-blue-300 transition-all group flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                {/* Icon and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <BookOpen className="w-6 h-6 text-blue-700" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-gray-300 text-xs font-bold rounded-full">
                    {area.percentageOfExam}% of Exam
                  </span>
                </div>

                {/* Title and Description - Fixed Height */}
                <div className="mb-4 flex-shrink-0">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-700 transition-colors min-h-[56px] flex items-center">
                    {area.name}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[40px]">
                    {area.description}
                  </p>
                </div>

                {/* Spacer to push content down */}
                <div className="flex-1" />

                {/* Stats */}
                <div className="flex items-center gap-4 pt-4 pb-4 border-t border-slate-100 dark:border-neutral-700 flex-shrink-0">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-gray-400">Questions</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{questionCount}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-gray-400">Sub-Topics</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{subTopicCount}</p>
                  </div>
                </div>

                {/* Action Button - Always at bottom */}
                <Link
                  href={`/practice/${area.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-all shadow-sm group-hover:shadow-md flex-shrink-0"
                >
                  Start Practice
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

    </div>
  );
}
