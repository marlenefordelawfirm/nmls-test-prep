import { prisma } from '@/lib/db';

export interface ReviewSchedule {
  subTopicId: string;
  subTopicName: string;
  nextReviewDate: Date;
  daysSinceLastReview: number;
  reviewCount: number;
  isOverdue: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class SpacedRepetitionService {
  private static readonly INTERVALS = [1, 3, 7, 14, 30, 60];

  /**
   * Calculate next review date based on current performance
   */
  static calculateNextReviewDate(
    lastReviewDate: Date,
    reviewCount: number,
    accuracy: number
  ): Date {
    let intervalDays: number;

    if (accuracy < 60) {
      intervalDays = this.INTERVALS[0];
    } else if (accuracy >= 80) {
      const intervalIndex = Math.min(reviewCount, this.INTERVALS.length - 1);
      intervalDays = this.INTERVALS[intervalIndex];
    } else {
      const intervalIndex = Math.max(0, Math.min(reviewCount - 1, this.INTERVALS.length - 1));
      intervalDays = this.INTERVALS[intervalIndex];
    }

    const nextDate = new Date(lastReviewDate);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    return nextDate;
  }

  /**
   * Get review schedule for all sub-topics in a content area
   */
  static async getReviewSchedule(
    userId: string,
    contentAreaId: string
  ): Promise<ReviewSchedule[]> {
    const performances = await prisma.userSubTopicPerformance.findMany({
      where: {
        userId,
        subTopic: { contentAreaId }
      },
      include: {
        subTopic: {
          select: { id: true, name: true }
        }
      }
    });

    const now = new Date();
    const schedules: ReviewSchedule[] = [];

    for (const perf of performances) {
      if (!perf.lastAttemptDate) continue;

      const totalQuestions = perf.correctAnswers + perf.incorrectAnswers;
      const accuracy = totalQuestions > 0 ? (perf.correctAnswers / totalQuestions) * 100 : 0;

      const nextReviewDate = this.calculateNextReviewDate(
        perf.lastAttemptDate,
        perf.totalAttempts,
        accuracy
      );

      const daysSinceLastReview = Math.floor(
        (now.getTime() - perf.lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isOverdue = now > nextReviewDate;

      let priority: 'HIGH' | 'MEDIUM' | 'LOW';
      if (isOverdue && accuracy < 60) {
        priority = 'HIGH';
      } else if (isOverdue || accuracy < 70) {
        priority = 'MEDIUM';
      } else {
        priority = 'LOW';
      }

      schedules.push({
        subTopicId: perf.subTopic.id,
        subTopicName: perf.subTopic.name,
        nextReviewDate,
        daysSinceLastReview,
        reviewCount: perf.totalAttempts,
        isOverdue,
        priority
      });
    }

    return schedules.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
    });
  }

  /**
   * Get sub-topics that are due for review
   */
  static async getDueForReview(
    userId: string,
    contentAreaId?: string
  ): Promise<ReviewSchedule[]> {
    const whereClause: any = { userId };
    if (contentAreaId) {
      whereClause.subTopic = { contentAreaId };
    }

    const performances = await prisma.userSubTopicPerformance.findMany({
      where: whereClause,
      include: {
        subTopic: {
          select: { id: true, name: true, contentAreaId: true }
        }
      }
    });

    const now = new Date();
    const dueForReview: ReviewSchedule[] = [];

    for (const perf of performances) {
      if (!perf.lastAttemptDate) continue;

      const totalQuestions = perf.correctAnswers + perf.incorrectAnswers;
      const accuracy = totalQuestions > 0 ? (perf.correctAnswers / totalQuestions) * 100 : 0;

      const nextReviewDate = this.calculateNextReviewDate(
        perf.lastAttemptDate,
        perf.totalAttempts,
        accuracy
      );

      if (now >= nextReviewDate) {
        const daysSinceLastReview = Math.floor(
          (now.getTime() - perf.lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let priority: 'HIGH' | 'MEDIUM' | 'LOW';
        if (accuracy < 60) {
          priority = 'HIGH';
        } else if (accuracy < 70) {
          priority = 'MEDIUM';
        } else {
          priority = 'LOW';
        }

        dueForReview.push({
          subTopicId: perf.subTopic.id,
          subTopicName: perf.subTopic.name,
          nextReviewDate,
          daysSinceLastReview,
          reviewCount: perf.totalAttempts,
          isOverdue: true,
          priority
        });
      }
    }

    return dueForReview.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get upcoming reviews (due within next 7 days)
   */
  static async getUpcomingReviews(
    userId: string,
    contentAreaId?: string,
    daysAhead: number = 7
  ): Promise<ReviewSchedule[]> {
    const schedule = contentAreaId
      ? await this.getReviewSchedule(userId, contentAreaId)
      : await this.getAllReviewSchedules(userId);

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return schedule.filter(s =>
      s.nextReviewDate >= now && s.nextReviewDate <= futureDate
    );
  }

  /**
   * Get review schedules for all content areas
   */
  private static async getAllReviewSchedules(
    userId: string
  ): Promise<ReviewSchedule[]> {
    const performances = await prisma.userSubTopicPerformance.findMany({
      where: { userId },
      include: {
        subTopic: {
          select: { id: true, name: true }
        }
      }
    });

    const now = new Date();
    const schedules: ReviewSchedule[] = [];

    for (const perf of performances) {
      if (!perf.lastAttemptDate) continue;

      const totalQuestions = perf.correctAnswers + perf.incorrectAnswers;
      const accuracy = totalQuestions > 0 ? (perf.correctAnswers / totalQuestions) * 100 : 0;

      const nextReviewDate = this.calculateNextReviewDate(
        perf.lastAttemptDate,
        perf.totalAttempts,
        accuracy
      );

      const daysSinceLastReview = Math.floor(
        (now.getTime() - perf.lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isOverdue = now > nextReviewDate;

      let priority: 'HIGH' | 'MEDIUM' | 'LOW';
      if (isOverdue && accuracy < 60) {
        priority = 'HIGH';
      } else if (isOverdue || accuracy < 70) {
        priority = 'MEDIUM';
      } else {
        priority = 'LOW';
      }

      schedules.push({
        subTopicId: perf.subTopic.id,
        subTopicName: perf.subTopic.name,
        nextReviewDate,
        daysSinceLastReview,
        reviewCount: perf.totalAttempts,
        isOverdue,
        priority
      });
    }

    return schedules;
  }

  /**
   * Update review schedule after completing a practice session
   */
  static async updateReviewSchedule(
    userId: string,
    subTopicId: string,
    accuracy: number
  ): Promise<Date> {
    const performance = await prisma.userSubTopicPerformance.findUnique({
      where: {
        userId_subTopicId: { userId, subTopicId }
      }
    });

    if (!performance || !performance.lastAttemptDate) {
      throw new Error('Performance record not found');
    }

    const nextReviewDate = this.calculateNextReviewDate(
      performance.lastAttemptDate,
      performance.totalAttempts,
      accuracy
    );

    await prisma.userSubTopicPerformance.update({
      where: {
        userId_subTopicId: { userId, subTopicId }
      },
      data: {
        lastAttemptDate: new Date()
      }
    });

    return nextReviewDate;
  }
}
