import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/utils/auth';
import { ExamInterface } from '@/components/exam/ExamInterface';
import { prisma } from '@/lib/db';

export default async function FullExamPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Get 125 questions for full exam (25 from each content area)
  const questions = await prisma.question.findMany({
    take: 125,
    include: {
      contentArea: true,
      subTopic: true
    },
    orderBy: [
      { contentArea: { id: 'asc' } },
      { difficulty: 'asc' }
    ]
  });

  if (questions.length < 125) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">
            Not Enough Questions
          </h2>
          <p className="text-amber-700">
            The full exam requires 125 questions, but only {questions.length} are available.
            Please add more questions to the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ExamInterface questions={questions} userId={user.id} />
    </div>
  );
}
