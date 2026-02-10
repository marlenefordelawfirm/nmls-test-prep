import { prisma } from '@/lib/db';
import { PerformanceAnalysisService } from './PerformanceAnalysisService';

export interface QuestionSelectionOptions {
  contentAreaId: string;
  userId: string;
  count: number;
  phase?: 1 | 2 | 3;
  includeReview?: boolean;
}

export interface SelectedQuestion {
  id: string;
  contentAreaId: string;
  subTopicId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
  bloomsLevel: string;
  subTopic: {
    id: string;
    name: string;
  };
}

export class AdaptiveQuestionSelectionService {
  /**
   * Select questions adaptively based on user performance
   */
  static async selectQuestions(
    options: QuestionSelectionOptions
  ): Promise<SelectedQuestion[]> {
    const { userId, contentAreaId, count } = options;

    // Get user performance for this content area
    const performance = await PerformanceAnalysisService.getContentAreaPerformance(
      userId,
      contentAreaId
    );

    // Determine phase based on attempts and progress
    let phase = options.phase;
    if (!phase) {
      if (performance.totalAttempts < 2) {
        phase = 1;
      } else if (performance.overallProgress < 50) {
        phase = 2;
      } else {
        phase = 3;
      }
    }

    switch (phase) {
      case 1:
        return this.selectPhase1Questions(userId, contentAreaId, count);
      case 2:
        return this.selectPhase2Questions(userId, contentAreaId, count);
      case 3:
        return this.selectPhase3Questions(userId, contentAreaId, count);
      default:
        return this.selectBalancedQuestions(contentAreaId, count);
    }
  }

  /**
   * Phase 1: Balanced introduction to all sub-topics
   */
  private static async selectPhase1Questions(
    userId: string,
    contentAreaId: string,
    count: number
  ): Promise<SelectedQuestion[]> {
    const subTopics = await prisma.subTopic.findMany({
      where: { contentAreaId },
      include: {
        questions: {
          select: { id: true, difficulty: true }
        }
      }
    });

    const performances = await Promise.all(
      subTopics.map(st => PerformanceAnalysisService.getSubTopicPerformance(userId, st.id))
    );

    const notStarted = performances.filter(p => p?.masteryLevel === 'NOT_STARTED');
    const learning = performances.filter(p => p?.masteryLevel === 'LEARNING');
    const practicing = performances.filter(p => p?.masteryLevel === 'PRACTICING');

    const notStartedCount = Math.floor(count * 0.4);
    const learningCount = Math.floor(count * 0.3);
    const practicingCount = count - notStartedCount - learningCount;

    const selectedQuestions: SelectedQuestion[] = [];

    if (notStarted.length > 0) {
      const questions = await this.selectFromSubTopics(
        notStarted.map(p => p!.subTopicId),
        notStartedCount,
        ['EASY', 'MEDIUM']
      );
      selectedQuestions.push(...questions);
    }

    if (learning.length > 0) {
      const questions = await this.selectFromSubTopics(
        learning.map(p => p!.subTopicId),
        learningCount,
        ['EASY', 'MEDIUM', 'HARD']
      );
      selectedQuestions.push(...questions);
    }

    if (practicing.length > 0) {
      const questions = await this.selectFromSubTopics(
        practicing.map(p => p!.subTopicId),
        practicingCount,
        ['MEDIUM', 'HARD']
      );
      selectedQuestions.push(...questions);
    }

    if (selectedQuestions.length < count) {
      const remaining = await this.selectBalancedQuestions(
        contentAreaId,
        count - selectedQuestions.length
      );
      selectedQuestions.push(...remaining);
    }

    return this.shuffleArray(selectedQuestions).slice(0, count);
  }

  /**
   * Phase 2: Target weak areas for improvement
   */
  private static async selectPhase2Questions(
    userId: string,
    contentAreaId: string,
    count: number
  ): Promise<SelectedQuestion[]> {
    const weakAreas = await PerformanceAnalysisService.getWeakAreas(userId, contentAreaId);

    const weakCount = Math.floor(count * 0.6);
    const practicingCount = Math.floor(count * 0.2);
    const reviewCount = count - weakCount - practicingCount;

    const selectedQuestions: SelectedQuestion[] = [];

    if (weakAreas.length > 0) {
      const questions = await this.selectFromSubTopics(
        weakAreas.map(w => w.subTopicId),
        weakCount,
        ['EASY', 'MEDIUM', 'HARD']
      );
      selectedQuestions.push(...questions);
    }

    const practicing = await prisma.userSubTopicPerformance.findMany({
      where: {
        userId,
        subTopic: { contentAreaId }
      }
    });

    const practicingIds = practicing
      .filter(p => {
        const totalQuestions = p.correctAnswers + p.incorrectAnswers;
        const accuracy = totalQuestions > 0 ? (p.correctAnswers / totalQuestions) * 100 : 0;
        return accuracy >= 60 && accuracy < 80;
      })
      .map(p => p.subTopicId);

    if (practicingIds.length > 0) {
      const questions = await this.selectFromSubTopics(
        practicingIds,
        practicingCount,
        ['MEDIUM', 'HARD']
      );
      selectedQuestions.push(...questions);
    }

    if (selectedQuestions.length < count) {
      const remaining = await this.selectBalancedQuestions(
        contentAreaId,
        count - selectedQuestions.length
      );
      selectedQuestions.push(...remaining);
    }

    return this.shuffleArray(selectedQuestions).slice(0, count);
  }

  /**
   * Phase 3: Maintain mastery with spaced repetition
   */
  private static async selectPhase3Questions(
    userId: string,
    contentAreaId: string,
    count: number
  ): Promise<SelectedQuestion[]> {
    const reviewCount = Math.floor(count * 0.5);
    const weakCount = Math.floor(count * 0.3);
    const randomCount = count - reviewCount - weakCount;

    const selectedQuestions: SelectedQuestion[] = [];

    const performances = await prisma.userSubTopicPerformance.findMany({
      where: {
        userId,
        subTopic: { contentAreaId }
      }
    });

    const needsReview = performances.filter(p => {
      if (!p.lastAttemptDate) return false;
      const daysSinceLastAttempt = Math.floor(
        (Date.now() - p.lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastAttempt > 7;
    }).map(p => p.subTopicId);

    if (needsReview.length > 0) {
      const questions = await this.selectFromSubTopics(
        needsReview,
        reviewCount,
        ['MEDIUM', 'HARD']
      );
      selectedQuestions.push(...questions);
    }

    const weakAreas = await PerformanceAnalysisService.getWeakAreas(userId, contentAreaId);
    if (weakAreas.length > 0) {
      const questions = await this.selectFromSubTopics(
        weakAreas.map(w => w.subTopicId),
        weakCount,
        ['EASY', 'MEDIUM', 'HARD']
      );
      selectedQuestions.push(...questions);
    }

    if (selectedQuestions.length < count) {
      const remaining = await this.selectBalancedQuestions(
        contentAreaId,
        count - selectedQuestions.length
      );
      selectedQuestions.push(...remaining);
    }

    return this.shuffleArray(selectedQuestions).slice(0, count);
  }

  /**
   * Select questions from specific sub-topics with difficulty filtering
   */
  private static async selectFromSubTopics(
    subTopicIds: string[],
    count: number,
    difficulties: ('EASY' | 'MEDIUM' | 'HARD')[]
  ): Promise<SelectedQuestion[]> {
    if (subTopicIds.length === 0) return [];

    const questions = await prisma.question.findMany({
      where: {
        subTopicId: { in: subTopicIds },
        difficulty: { in: difficulties as any },
        // approvalStatus: 'APPROVED'
      },
      include: {
        subTopic: {
          select: { id: true, name: true }
        }
      }
    });

    return this.shuffleArray(questions).slice(0, count);
  }

  /**
   * Fallback: Select balanced questions
   */
  private static async selectBalancedQuestions(
    contentAreaId: string,
    count: number
  ): Promise<SelectedQuestion[]> {
    const easyCount = Math.floor(count * 0.3);
    const mediumCount = Math.floor(count * 0.5);
    const hardCount = count - easyCount - mediumCount;

    const questions = await Promise.all([
      this.selectByDifficulty(contentAreaId, 'EASY', easyCount),
      this.selectByDifficulty(contentAreaId, 'MEDIUM', mediumCount),
      this.selectByDifficulty(contentAreaId, 'HARD', hardCount)
    ]);

    return this.shuffleArray(questions.flat());
  }

  /**
   * Select questions by difficulty
   */
  private static async selectByDifficulty(
    contentAreaId: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    count: number
  ): Promise<SelectedQuestion[]> {
    const questions = await prisma.question.findMany({
      where: {
        contentAreaId,
        difficulty: difficulty as any,
        // approvalStatus: 'APPROVED'
      },
      include: {
        subTopic: {
          select: { id: true, name: true }
        }
      }
    });

    return this.shuffleArray(questions).slice(0, count);
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
