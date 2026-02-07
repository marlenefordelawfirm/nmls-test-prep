import { prisma } from '@/lib/db';

export class AchievementService {
  /**
   * Calculate and update all achievement progress for a user
   */
  static async updateUserAchievements(userId: string): Promise<void> {
    // Fetch all achievements and user data in parallel
    const [achievements, testAttempts, contentAreaProgress] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.testAttempt.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        include: {
          answers: {
            select: {
              isCorrect: true,
            },
          },
        },
      }),
      prisma.userContentAreaProgress.findMany({
        where: { userId },
      }),
    ]);

    // Calculate progress for each achievement
    for (const achievement of achievements) {
      const progress = this.calculateProgress(
        achievement.key,
        achievement.targetValue,
        { testAttempts, contentAreaProgress }
      );

      const isCompleted = progress >= achievement.targetValue;

      // Upsert user achievement
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        update: {
          progress,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        create: {
          userId,
          achievementId: achievement.id,
          progress,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    }
  }

  /**
   * Calculate progress for a specific achievement
   */
  private static calculateProgress(
    achievementKey: string,
    targetValue: number,
    data: {
      testAttempts: Array<{
        createdAt: Date;
        startTime: Date;
        endTime: Date | null;
        totalQuestions: number;
        correctAnswers: number;
        rawScore: number;
        answers: Array<{ isCorrect: boolean }>;
      }>;
      contentAreaProgress: Array<{
        masteryScore: number;
      }>;
    }
  ): number {
    const { testAttempts, contentAreaProgress } = data;

    switch (achievementKey) {
      case 'first_test':
        // Complete 1 test
        return Math.min(testAttempts.length, targetValue);

      case 'perfect_score':
        // Get 100% on any test
        const perfectScores = testAttempts.filter(
          (t) => t.correctAnswers === t.totalQuestions
        ).length;
        return Math.min(perfectScores, targetValue);

      case 'test_master':
        // Complete 10 tests
        return Math.min(testAttempts.length, targetValue);

      case 'week_warrior':
        // 7-day study streak
        return Math.min(this.calculateStudyStreak(testAttempts), targetValue);

      case 'consistency_champion':
        // 14-day study streak
        return Math.min(this.calculateStudyStreak(testAttempts), targetValue);

      case 'speed_learner':
        // Complete exam in under 2 hours
        const speedTests = testAttempts.filter((t) => {
          if (!t.startTime || !t.endTime) return false;
          const duration = (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / (1000 * 60);
          return duration < 120; // 120 minutes = 2 hours
        }).length;
        return Math.min(speedTests, targetValue);

      case 'knowledge_seeker':
        // Answer 500 questions correctly
        const totalCorrect = testAttempts.reduce(
          (sum, t) => sum + t.correctAnswers,
          0
        );
        return Math.min(totalCorrect, targetValue);

      case 'high_achiever':
        // Score 85% or higher on 5 tests
        const highScores = testAttempts.filter((t) => t.rawScore >= 85).length;
        return Math.min(highScores, targetValue);

      case 'dedicated_student':
        // Spend 20 hours (1200 minutes) studying
        const totalMinutes = testAttempts.reduce((sum, t) => {
          if (!t.startTime || !t.endTime) return sum;
          return sum + (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / (1000 * 60);
        }, 0);
        return Math.min(Math.floor(totalMinutes), targetValue);

      case 'mastery_expert':
        // Achieve 75% mastery in all content areas
        const masteredAreas = contentAreaProgress.filter(
          (p) => p.masteryScore >= 75
        ).length;
        // For this achievement, we need to check if ALL areas are mastered
        // We'll return 1 if complete, 0 if not
        const totalAreas = contentAreaProgress.length;
        return totalAreas > 0 && masteredAreas === totalAreas ? 1 : 0;

      default:
        return 0;
    }
  }

  /**
   * Calculate consecutive days of study activity
   */
  private static calculateStudyStreak(
    testAttempts: Array<{ createdAt: Date }>
  ): number {
    if (testAttempts.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique test dates
    const testDates = Array.from(
      new Set(
        testAttempts.map((t) => {
          const date = new Date(t.createdAt);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      )
    ).sort((a, b) => b - a);

    let streak = 0;
    for (let i = 0; i < testDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (testDates[i] === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
