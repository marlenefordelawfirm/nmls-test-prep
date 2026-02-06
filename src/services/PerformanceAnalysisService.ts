import { prisma } from '@/lib/db';

export interface SubTopicPerformance {
  subTopicId: string;
  subTopicName: string;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  accuracy: number;
  masteryLevel: 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'MASTERED';
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  lastAttempt: Date | null;
  needsReview: boolean;
}

export interface ContentAreaPerformance {
  contentAreaId: string;
  contentAreaName: string;
  totalAttempts: number;
  averageScore: number;
  masteredSubTopics: number;
  totalSubTopics: number;
  overallProgress: number;
  strengths: string[];
  weaknesses: string[];
}

export class PerformanceAnalysisService {
  /**
   * Calculate mastery level based on accuracy and attempts
   */
  static calculateMasteryLevel(
    accuracy: number,
    attemptsCount: number
  ): 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'MASTERED' {
    if (attemptsCount === 0) return 'NOT_STARTED';
    if (attemptsCount < 3 || accuracy < 60) return 'LEARNING';
    if (accuracy < 80 || attemptsCount < 5) return 'PRACTICING';
    return 'MASTERED';
  }

  /**
   * Determine trend based on recent performance
   */
  static async calculateTrend(
    userId: string,
    subTopicId: string
  ): Promise<'IMPROVING' | 'DECLINING' | 'STABLE'> {
    const recentAnswers = await prisma.answer.findMany({
      where: {
        question: { subTopicId },
        testAttempt: { userId }
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { isCorrect: true, createdAt: true }
    });

    if (recentAnswers.length < 4) return 'STABLE';

    const recent = recentAnswers.slice(0, 3);
    const previous = recentAnswers.slice(3, 6);

    const recentAccuracy = recent.filter(a => a.isCorrect).length / recent.length;
    const previousAccuracy = previous.filter(a => a.isCorrect).length / previous.length;

    const difference = recentAccuracy - previousAccuracy;

    if (difference > 0.1) return 'IMPROVING';
    if (difference < -0.1) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Get comprehensive performance data for a sub-topic
   */
  static async getSubTopicPerformance(
    userId: string,
    subTopicId: string
  ): Promise<SubTopicPerformance | null> {
    const performance = await prisma.userSubTopicPerformance.findUnique({
      where: {
        userId_subTopicId: { userId, subTopicId }
      },
      include: {
        subTopic: { select: { name: true } }
      }
    });

    if (!performance) {
      const subTopic = await prisma.subTopic.findUnique({
        where: { id: subTopicId },
        select: { name: true }
      });

      if (!subTopic) return null;

      return {
        subTopicId,
        subTopicName: subTopic.name,
        totalAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalQuestions: 0,
        accuracy: 0,
        masteryLevel: 'NOT_STARTED',
        trend: 'STABLE',
        lastAttempt: null,
        needsReview: false
      };
    }

    const totalQuestions = performance.correctAnswers + performance.incorrectAnswers;
    const accuracy = totalQuestions > 0
      ? (performance.correctAnswers / totalQuestions) * 100
      : 0;

    const masteryLevel = this.calculateMasteryLevel(accuracy, performance.totalAttempts);
    const trend = await this.calculateTrend(userId, subTopicId);

    const daysSinceLastAttempt = performance.lastAttemptDate
      ? Math.floor((Date.now() - performance.lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24))
      : 9999;
    const needsReview = masteryLevel !== 'MASTERED' && daysSinceLastAttempt > 7;

    return {
      subTopicId,
      subTopicName: performance.subTopic.name,
      totalAttempts: performance.totalAttempts,
      correctAnswers: performance.correctAnswers,
      incorrectAnswers: performance.incorrectAnswers,
      totalQuestions,
      accuracy,
      masteryLevel,
      trend,
      lastAttempt: performance.lastAttemptDate,
      needsReview
    };
  }

  /**
   * Get performance data for all sub-topics in a content area
   */
  static async getContentAreaPerformance(
    userId: string,
    contentAreaId: string
  ): Promise<ContentAreaPerformance> {
    const contentArea = await prisma.contentArea.findUnique({
      where: { id: contentAreaId },
      include: {
        subTopics: {
          select: { id: true, name: true }
        }
      }
    });

    if (!contentArea) {
      throw new Error('Content area not found');
    }

    const performances = await Promise.all(
      contentArea.subTopics.map(st => this.getSubTopicPerformance(userId, st.id))
    );

    const validPerformances = performances.filter(p => p !== null) as SubTopicPerformance[];

    const totalAttempts = validPerformances.reduce((sum, p) => sum + p.totalAttempts, 0);
    const averageScore = validPerformances.length > 0
      ? validPerformances.reduce((sum, p) => sum + p.accuracy, 0) / validPerformances.length
      : 0;

    const masteredSubTopics = validPerformances.filter(p => p.masteryLevel === 'MASTERED').length;
    const totalSubTopics = contentArea.subTopics.length;
    const overallProgress = totalSubTopics > 0 ? (masteredSubTopics / totalSubTopics) * 100 : 0;

    const strengths = validPerformances
      .filter(p => p.accuracy >= 75)
      .map(p => p.subTopicName)
      .slice(0, 3);

    const weaknesses = validPerformances
      .filter(p => p.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .map(p => p.subTopicName)
      .slice(0, 3);

    return {
      contentAreaId,
      contentAreaName: contentArea.name,
      totalAttempts,
      averageScore,
      masteredSubTopics,
      totalSubTopics,
      overallProgress,
      strengths,
      weaknesses
    };
  }

  /**
   * Update user performance after completing a test
   */
  static async updatePerformance(
    userId: string,
    testAttemptId: string
  ): Promise<void> {
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: {
        answers: {
          include: {
            question: {
              select: { subTopicId: true }
            }
          }
        }
      }
    });

    if (!testAttempt) {
      throw new Error('Test attempt not found');
    }

    // Group answers by sub-topic
    const subTopicAnswers = new Map<string, { correct: number; incorrect: number }>();

    testAttempt.answers.forEach(answer => {
      const subTopicId = answer.question.subTopicId;
      if (!subTopicAnswers.has(subTopicId)) {
        subTopicAnswers.set(subTopicId, { correct: 0, incorrect: 0 });
      }
      const stats = subTopicAnswers.get(subTopicId)!;
      if (answer.isCorrect) {
        stats.correct++;
      } else {
        stats.incorrect++;
      }
    });

    // Update performance for each sub-topic
    for (const [subTopicId, stats] of subTopicAnswers.entries()) {
      // Get existing performance to calculate new mastery score
      const existing = await prisma.userSubTopicPerformance.findUnique({
        where: { userId_subTopicId: { userId, subTopicId } }
      });

      let newMasteryScore: number;
      if (existing) {
        const totalCorrect = existing.correctAnswers + stats.correct;
        const totalQuestions = existing.correctAnswers + existing.incorrectAnswers + stats.correct + stats.incorrect;
        newMasteryScore = (totalCorrect / totalQuestions) * 100;
      } else {
        newMasteryScore = (stats.correct / (stats.correct + stats.incorrect)) * 100;
      }

      await prisma.userSubTopicPerformance.upsert({
        where: {
          userId_subTopicId: { userId, subTopicId }
        },
        create: {
          userId,
          subTopicId,
          totalAttempts: 1,
          correctAnswers: stats.correct,
          incorrectAnswers: stats.incorrect,
          masteryScore: newMasteryScore,
          lastAttemptDate: new Date()
        },
        update: {
          totalAttempts: { increment: 1 },
          correctAnswers: { increment: stats.correct },
          incorrectAnswers: { increment: stats.incorrect },
          masteryScore: newMasteryScore,
          lastAttemptDate: new Date()
        }
      });
    }
  }

  /**
   * Get weak areas that need review
   */
  static async getWeakAreas(
    userId: string,
    contentAreaId?: string
  ): Promise<SubTopicPerformance[]> {
    const whereClause: any = { userId };
    if (contentAreaId) {
      whereClause.subTopic = { contentAreaId };
    }

    const performances = await prisma.userSubTopicPerformance.findMany({
      where: whereClause,
      include: {
        subTopic: { select: { id: true, name: true } }
      }
    });

    const analyzed = await Promise.all(
      performances.map(p => this.getSubTopicPerformance(userId, p.subTopicId))
    );

    return analyzed
      .filter(p => p !== null && (p.accuracy < 60 || p.trend === 'DECLINING'))
      .sort((a, b) => a!.accuracy - b!.accuracy) as SubTopicPerformance[];
  }
}
