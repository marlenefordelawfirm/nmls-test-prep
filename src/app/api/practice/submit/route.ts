import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';

interface SubmittedAnswer {
  questionId: string;
  selectedAnswer: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { attemptId, answers } = body as { attemptId: string; answers: SubmittedAnswer[] };

    if (!attemptId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Attempt ID and answers are required' },
        { status: 400 }
      );
    }

    // Verify test attempt exists and belongs to user
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId }
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

    if (testAttempt.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Test already completed' },
        { status: 400 }
      );
    }

    // Get all questions for this test to check correct answers
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds }
      },
      select: {
        id: true,
        correctAnswer: true,
        difficulty: true,
        subTopicId: true
      }
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Grade answers
    let correctCount = 0;
    const gradedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      const isCorrect = question ? question.correctAnswer === answer.selectedAnswer : false;

      if (isCorrect) {
        correctCount++;
      }

      return {
        testAttemptId: attemptId,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: 0 // TODO: Track time per question in future
      };
    });

    // Calculate scores
    const totalQuestions = answers.length;
    const rawScore = (correctCount / totalQuestions) * 100;

    // Save answers to database
    await prisma.answer.createMany({
      data: gradedAnswers
    });

    // Update test attempt
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        correctAnswers: correctCount,
        rawScore,
        status: 'COMPLETED',
        endTime: new Date()
      },
      include: {
        contentArea: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Calculate performance breakdown
    const answersByQuestion = await prisma.answer.findMany({
      where: { testAttemptId: attemptId },
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
    });

    // Group by sub-topic
    const subTopicPerformance = new Map<string, { correct: number; total: number; name: string }>();

    answersByQuestion.forEach(answer => {
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

    // Identify strengths (>= 75%) and areas for review (< 60%)
    const strengths: string[] = [];
    const areasForReview: string[] = [];

    subTopicPerformance.forEach((stats, subTopicId) => {
      const percentage = (stats.correct / stats.total) * 100;
      if (percentage >= 75) {
        strengths.push(stats.name);
      } else if (percentage < 60) {
        areasForReview.push(stats.name);
      }
    });

    // Calculate time spent
    const timeSpent = testAttempt.endTime && updatedAttempt.endTime
      ? Math.floor((updatedAttempt.endTime.getTime() - testAttempt.startTime.getTime()) / 1000)
      : 0;

    return NextResponse.json({
      success: true,
      results: {
        attemptId,
        score: Math.round(rawScore),
        correctAnswers: correctCount,
        totalQuestions,
        timeSpent,
        contentArea: updatedAttempt.contentArea,
        strengths,
        areasForReview,
        passed: rawScore >= 75 // 75% passing score
      }
    });

  } catch (error) {
    console.error('Error submitting practice test:', error);
    return NextResponse.json(
      { error: 'Failed to submit practice test' },
      { status: 500 }
    );
  }
}
