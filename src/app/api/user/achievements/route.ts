import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';
import { AchievementService } from '@/services/AchievementService';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update achievements before fetching
    await AchievementService.updateUserAchievements(user.id);

    // Fetch user achievements with achievement details
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        achievement: true,
      },
      orderBy: {
        achievement: {
          sortOrder: 'asc',
        },
      },
    });

    // Fetch stats for the achievements page
    const [testAttempts, contentAreaProgress] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
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
      prisma.userContentAreaProgress.findMany({
        where: { userId: user.id },
        select: {
          masteryScore: true,
        },
      }),
    ]);

    // Calculate stats
    const totalAchievements = userAchievements.length;
    const completedAchievements = userAchievements.filter((a) => a.isCompleted).length;

    const perfectScores = testAttempts.filter(
      (t) => t.correctAnswers === t.totalQuestions
    ).length;

    // Calculate study streak
    let studyStreak = 0;
    if (testAttempts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const testDates = Array.from(
        new Set(
          testAttempts.map((t) => {
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

    const testsCompleted = testAttempts.length;

    // Calculate total study hours
    const totalStudyMinutes = testAttempts.reduce((sum, t) => {
      if (t.startTime && t.endTime) {
        return sum + (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);
    const totalStudyHours = Math.floor(totalStudyMinutes / 60);

    // Format achievements for response
    const achievements = userAchievements.map((ua) => ({
      id: ua.achievement.id,
      title: ua.achievement.title,
      description: ua.achievement.description,
      category: ua.achievement.category,
      icon: ua.achievement.icon,
      progress: ua.progress,
      target: ua.achievement.targetValue,
      isCompleted: ua.isCompleted,
      completedAt: ua.completedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        stats: {
          totalAchievements,
          completedAchievements,
          perfectScores,
          studyStreak,
          testsCompleted,
          totalStudyHours,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
