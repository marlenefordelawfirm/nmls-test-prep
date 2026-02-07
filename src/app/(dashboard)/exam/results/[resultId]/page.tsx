import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/utils/auth';
import { prisma } from '@/lib/db';
import { ExamResults } from '@/components/exam/ExamResults';

interface PageProps {
  params: {
    resultId: string;
  };
}

export default async function ExamResultsPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const result = await prisma.testAttempt.findUnique({
    where: {
      id: params.resultId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      answers: {
        include: {
          question: {
            include: {
              contentArea: true
            }
          }
        }
      }
    }
  });

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Results Not Found
          </h2>
          <p className="text-red-700">
            The requested exam results could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Verify the result belongs to the current user
  if (result.userId !== user.id) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Access Denied
          </h2>
          <p className="text-red-700">
            You do not have permission to view these results.
          </p>
        </div>
      </div>
    );
  }

  // Calculate breakdown by content area with time tracking
  const breakdownMap = new Map<string, {
    contentAreaId: string;
    contentAreaName: string;
    correct: number;
    total: number;
    percentage: number;
    totalTimeSpent: number;
    avgTimePerQuestion: number;
  }>();

  result.answers.forEach(answer => {
    const areaId = answer.question.contentArea.id;
    const areaName = answer.question.contentArea.name;

    if (!breakdownMap.has(areaId)) {
      breakdownMap.set(areaId, {
        contentAreaId: areaId,
        contentAreaName: areaName,
        correct: 0,
        total: 0,
        percentage: 0,
        totalTimeSpent: 0,
        avgTimePerQuestion: 0
      });
    }

    const stats = breakdownMap.get(areaId)!;
    stats.total++;
    stats.totalTimeSpent += answer.timeSpent;
    if (answer.isCorrect) {
      stats.correct++;
    }
  });

  // Calculate percentages and average time
  const breakdown = Array.from(breakdownMap.values()).map(stat => ({
    ...stat,
    percentage: Math.round((stat.correct / stat.total) * 100),
    avgTimePerQuestion: Math.round(stat.totalTimeSpent / stat.total)
  }));

  // Find slowest questions (top 10)
  const slowestQuestions = result.answers
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 10)
    .map(answer => ({
      questionText: answer.question.questionText,
      timeSpent: answer.timeSpent,
      contentArea: answer.question.contentArea.name,
      isCorrect: answer.isCorrect
    }));

  // Generate recommendations based on wrong answers and time spent
  const recommendations: string[] = [];

  // Find areas with low accuracy
  const weakAreas = breakdown.filter(b => b.percentage < 75);
  if (weakAreas.length > 0) {
    recommendations.push(
      `📚 Focus on improving: ${weakAreas.map(a => a.contentAreaName).join(', ')} (below 75% accuracy)`
    );
  }

  // Find areas that took the longest time
  const slowestAreas = [...breakdown].sort((a, b) => b.avgTimePerQuestion - a.avgTimePerQuestion).slice(0, 2);
  if (slowestAreas[0].avgTimePerQuestion > 90) { // More than 1.5 minutes average
    recommendations.push(
      `⏱️ Work on speed for: ${slowestAreas.map(a => a.contentAreaName).join(', ')} (taking ${Math.round(slowestAreas[0].avgTimePerQuestion / 60)}+ min per question)`
    );
  }

  // Analyze incorrect answers that took a long time
  const slowIncorrect = result.answers.filter(a => !a.isCorrect && a.timeSpent > 120).length;
  if (slowIncorrect > 5) {
    recommendations.push(
      `⚠️ You spent significant time on ${slowIncorrect} questions and still got them wrong. Consider reviewing these topics more carefully.`
    );
  }

  // Positive feedback
  const fastCorrect = result.answers.filter(a => a.isCorrect && a.timeSpent < 60).length;
  if (fastCorrect > result.totalQuestions * 0.3) {
    recommendations.push(
      `✅ Great job! You answered ${fastCorrect} questions correctly and quickly - you have strong foundational knowledge.`
    );
  }

  return (
    <ExamResults
      result={result}
      breakdown={breakdown}
      slowestQuestions={slowestQuestions}
      recommendations={recommendations}
    />
  );
}
