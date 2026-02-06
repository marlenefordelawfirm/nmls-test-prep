import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all test attempts for the user
    const testAttempts = await prisma.testAttempt.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED'
      },
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
      },
      orderBy: {
        endTime: 'desc'
      }
    });

    // Calculate overview stats
    const totalPracticeTests = testAttempts.filter(t => t.type as string === 'PRACTICE').length;
    const totalFullExams = testAttempts.filter(t => t.type as string === 'FULL_EXAM').length;
    const totalQuestions = testAttempts.reduce((sum, t) => sum + t.totalQuestions, 0);
    const averageScore = testAttempts.length > 0
      ? testAttempts.reduce((sum, t) => sum + t.rawScore, 0) / testAttempts.length
      : 0;

    // Calculate total study time (based on test duration)
    let totalStudyTimeMinutes = 0;
    const studyDates = new Set<string>();

    testAttempts.forEach(attempt => {
      if (attempt.startTime && attempt.endTime) {
        const duration = Math.floor((attempt.endTime.getTime() - attempt.startTime.getTime()) / 60000);
        totalStudyTimeMinutes += duration;

        // Track unique study days
        const dateKey = attempt.startTime.toISOString().split('T')[0];
        studyDates.add(dateKey);
      }
    });

    // Performance by content area
    const performanceByArea: Record<string, {
      contentAreaId: string;
      contentAreaName: string;
      questionsAnswered: number;
      correctAnswers: number;
    }> = {};

    testAttempts.forEach(attempt => {
      if (attempt.contentAreaId) {
        if (!performanceByArea[attempt.contentAreaId]) {
          performanceByArea[attempt.contentAreaId] = {
            contentAreaId: attempt.contentAreaId,
            contentAreaName: attempt.contentArea?.name || 'Unknown',
            questionsAnswered: 0,
            correctAnswers: 0
          };
        }

        performanceByArea[attempt.contentAreaId].questionsAnswered += attempt.totalQuestions;
        performanceByArea[attempt.contentAreaId].correctAnswers += attempt.correctAnswers;
      }
    });

    const performanceByAreaArray = Object.values(performanceByArea).map(area => ({
      ...area,
      averageScore: area.questionsAnswered > 0
        ? (area.correctAnswers / area.questionsAnswered) * 100
        : 0
    }));

    // Sub-topic performance (for strengths and weaknesses)
    const subTopicPerformance: Record<string, {
      subTopicId: string;
      subTopicName: string;
      correct: number;
      total: number;
    }> = {};

    testAttempts.forEach(attempt => {
      attempt.answers.forEach(answer => {
        const subTopicId = answer.question.subTopic.id;
        const subTopicName = answer.question.subTopic.name;

        if (!subTopicPerformance[subTopicId]) {
          subTopicPerformance[subTopicId] = {
            subTopicId,
            subTopicName,
            correct: 0,
            total: 0
          };
        }

        subTopicPerformance[subTopicId].total++;
        if (answer.isCorrect) {
          subTopicPerformance[subTopicId].correct++;
        }
      });
    });

    // Identify strengths (>= 80%, at least 5 questions)
    const strengths = Object.values(subTopicPerformance)
      .filter(st => st.total >= 5)
      .map(st => ({
        subTopicName: st.subTopicName,
        accuracy: (st.correct / st.total) * 100,
        questionsAnswered: st.total
      }))
      .filter(st => st.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // Identify weak areas (< 60%, at least 3 questions)
    const weakAreas = Object.values(subTopicPerformance)
      .filter(st => st.total >= 3)
      .map(st => ({
        subTopicName: st.subTopicName,
        accuracy: (st.correct / st.total) * 100,
        questionsAnswered: st.total
      }))
      .filter(st => st.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Recent activity (last 10 tests)
    const recentActivity = testAttempts.slice(0, 10).map(attempt => ({
      date: attempt.endTime?.toISOString() || attempt.startTime.toISOString(),
      type: attempt.type,
      contentArea: attempt.contentArea?.name,
      score: attempt.rawScore,
      timeSpent: attempt.startTime && attempt.endTime
        ? Math.floor((attempt.endTime.getTime() - attempt.startTime.getTime()) / 1000)
        : 0
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalPracticeTests,
          totalFullExams,
          totalQuestions,
          averageScore,
          totalStudyTimeMinutes,
          studyDays: studyDates.size
        },
        performanceByArea: performanceByAreaArray,
        recentActivity,
        weakAreas,
        strengths
      }
    });

  } catch (error) {
    console.error('[API] Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
