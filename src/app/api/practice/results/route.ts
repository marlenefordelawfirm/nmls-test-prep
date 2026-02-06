import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      );
    }

    // Get test attempt with answers
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        contentArea: {
          select: {
            id: true,
            name: true
          }
        },
        answers: {
          include: {
            question: {
              include: {
                subTopic: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      );
    }

    if (testAttempt.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate time spent
    const timeSpent = testAttempt.endTime
      ? Math.floor((testAttempt.endTime.getTime() - testAttempt.startTime.getTime()) / 1000)
      : 0;

    // Group performance by sub-topic
    const subTopicPerformance = new Map<string, { correct: number; total: number; name: string }>();

    testAttempt.answers.forEach(answer => {
      const subTopicId = answer.question.subTopicId;
      const subTopicName = answer.question.subTopic.name;

      if (!subTopicPerformance.has(subTopicId)) {
        subTopicPerformance.set(subTopicId, { correct: 0, total: 0, name: subTopicName });
      }

      const stats = subTopicPerformance.get(subTopicId)!;
      stats.total++;
      if (answer.isCorrect) {
        stats.correct++;
      }
    });

    // Identify strengths and areas for review
    const strengths: string[] = [];
    const areasForReview: string[] = [];

    subTopicPerformance.forEach((stats) => {
      const percentage = (stats.correct / stats.total) * 100;
      if (percentage >= 75) {
        strengths.push(stats.name);
      } else if (percentage < 60) {
        areasForReview.push(stats.name);
      }
    });

    return NextResponse.json({
      success: true,
      results: {
        attemptId,
        score: Math.round(testAttempt.rawScore),
        correctAnswers: testAttempt.correctAnswers,
        totalQuestions: testAttempt.totalQuestions,
        timeSpent,
        contentArea: testAttempt.contentArea,
        strengths,
        areasForReview,
        passed: testAttempt.rawScore >= 75
      }
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
