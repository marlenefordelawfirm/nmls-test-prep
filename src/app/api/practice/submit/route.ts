import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';
import { PerformanceAnalysisService } from '@/services/PerformanceAnalysisService';
import { emailService } from '@/lib/email';

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

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers must be an array' },
        { status: 400 }
      );
    }

    // Log warning for empty submissions but allow them (0% score)
    if (answers.length === 0) {
      console.warn(`[SUBMIT] User submitted test with no answers: ${attemptId}`);
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

    // Log received data for debugging
    console.log('[SUBMIT] Received data:', {
      attemptId,
      answerCount: answers.length,
      answers: answers.map((a, i) => ({
        index: i,
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        type: typeof a.selectedAnswer,
        length: a.selectedAnswer?.length
      }))
    });

    // Validate all questions exist
    const missingQuestions = answers.filter(a => !questionMap.has(a.questionId));
    if (missingQuestions.length > 0) {
      console.error('[GRADING ERROR] Missing questions:', missingQuestions);
      return NextResponse.json(
        { error: 'Invalid questions submitted' },
        { status: 400 }
      );
    }

    // Grade answers with robust comparison
    let correctCount = 0;
    const gradedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        console.error(`[GRADING ERROR] Question not found: ${answer.questionId}`);
        return {
          testAttemptId: attemptId,
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: false,
          timeSpent: 0
        };
      }

      // Normalize correctAnswer: handle "optionA" -> "A" format as well as plain "A"
      let rawCorrect = (question.correctAnswer || '').trim();
      if (rawCorrect.toLowerCase().startsWith('option')) {
        rawCorrect = rawCorrect.replace(/^option/i, '');
      }
      const correctAnswer = rawCorrect.toUpperCase();
      const selectedAnswer = (answer.selectedAnswer || '').trim().toUpperCase();

      const isCorrect = correctAnswer === selectedAnswer;

      console.log(`[GRADING] Q:${answer.questionId} Normalized Correct:"${correctAnswer}" Normalized Selected:"${selectedAnswer}" Match:${isCorrect}`);

      if (isCorrect) {
        correctCount++;
      }

      return {
        testAttemptId: attemptId,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer, // Store original
        isCorrect,
        timeSpent: 0 // TODO: Track time per question in future
      };
    });

    // Calculate scores
    const totalQuestions = answers.length;
    const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

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

    // Update user performance tracking for adaptive learning
    await PerformanceAnalysisService.updatePerformance(user.id, attemptId);

    // Send email notification (async, don't block response)
    const passed = rawScore >= 75;
    emailService.sendPracticeTestResult({
      to: user.email || '',
      userName: user.name || 'Student',
      contentArea: updatedAttempt.contentArea?.name || 'Practice Test',
      score: correctCount,
      totalQuestions,
      passed,
      weakAreas: areasForReview
    }).catch(err => console.error('[Email] Failed to send practice test result:', err));

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
