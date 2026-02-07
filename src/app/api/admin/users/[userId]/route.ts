import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return authResult.error;
  }

  const { userId } = await params;

  try {
    // Fetch user with all related data
    const [user, testAttempts, contentAreaProgress, achievements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionTier: true,
          createdAt: true,
        },
      }),
      prisma.testAttempt.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          type: true,
          rawScore: true,
          totalQuestions: true,
          correctAnswers: true,
          createdAt: true,
          startTime: true,
          endTime: true,
          contentArea: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.userContentAreaProgress.findMany({
        where: { userId },
        select: {
          id: true,
          masteryScore: true,
          status: true,
          totalAttempts: true,
          bestScore: true,
          contentArea: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          masteryScore: 'desc',
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
        orderBy: {
          achievement: {
            sortOrder: 'asc',
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalTests = testAttempts.length;
    const averageScore = totalTests > 0
      ? Math.round(testAttempts.reduce((sum, t) => sum + t.rawScore, 0) / totalTests)
      : 0;

    const studyHours = testAttempts.reduce((sum, t) => {
      if (t.startTime && t.endTime) {
        return sum + (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    const completedAchievements = achievements.filter(a => a.isCompleted).length;

    return NextResponse.json({
      success: true,
      data: {
        user,
        testAttempts,
        contentAreaProgress,
        achievements,
        stats: {
          totalTests,
          averageScore,
          studyHours: parseFloat(studyHours.toFixed(1)),
          completedAchievements,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}
