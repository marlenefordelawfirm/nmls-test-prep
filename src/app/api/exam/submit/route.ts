import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';
import { emailService } from '@/lib/email';

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
    const { answers, timeSpent, answersWithTime } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Get all 125 exam questions (same query as exam page)
    const questions = await prisma.question.findMany({
      take: 125,
      include: {
        contentArea: true,
        subTopic: true
      },
      orderBy: [
        { contentArea: { id: 'asc' } },
        { difficulty: 'asc' }
      ]
    });

    if (questions.length < 125) {
      return NextResponse.json(
        { error: 'Not enough questions available for full exam' },
        { status: 400 }
      );
    }

    // Calculate score
    let correctAnswers = 0;
    const breakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((question, index) => {
      const questionId = question.id;
      const userAnswer = answers[index.toString()]; // Answers keyed by question index
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctAnswers++;
      }

      // Track by content area
      const areaId = question.contentArea.id;
      if (!breakdown[areaId]) {
        breakdown[areaId] = { correct: 0, total: 0 };
      }
      breakdown[areaId].total++;
      if (isCorrect) {
        breakdown[areaId].correct++;
      }
    });

    const rawScore = (correctAnswers / questions.length) * 100;
    const passed = rawScore >= 75;

    // Create test attempt record
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId: user.id,
        type: 'FULL_EXAM',
        totalQuestions: questions.length,
        scoredQuestions: questions.length,
        correctAnswers,
        rawScore,
        loftAdjustedScore: rawScore, // No LOFT adjustment for now
        status: 'COMPLETED',
        endTime: new Date()
      }
    });

    // Save individual answers with time tracking
    await prisma.answer.createMany({
      data: questions.map((question, index) => {
        const answerWithTime = answersWithTime?.find((a: any) => a.questionIndex === index);
        return {
          testAttemptId: testAttempt.id,
          questionId: question.id,
          selectedAnswer: answers[index.toString()] || '',
          isCorrect: answers[index.toString()] === question.correctAnswer,
          timeSpent: answerWithTime?.timeSpent || 0,
          wasRepeat: false
        };
      })
    });

    // Generate recommendations based on content area performance
    const recommendations: string[] = [];
    const contentAreas = await prisma.contentArea.findMany();

    for (const area of contentAreas) {
      const areaBreakdown = breakdown[area.id];
      if (areaBreakdown) {
        const percentage = (areaBreakdown.correct / areaBreakdown.total) * 100;
        if (percentage < 75) {
          recommendations.push(`Review ${area.name} - you scored ${Math.round(percentage)}%`);
        }
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep practicing to maintain your skills');
    }

    // Send email notification (async, don't block response)
    emailService.sendFullExamResult({
      to: user.email || '',
      userName: user.name || 'Student',
      rawScore,
      adjustedScore: rawScore,
      passed,
      timeSpent: timeSpent || 0,
      recommendations
    }).catch(err => console.error('[Email] Failed to send full exam result:', err));

    return NextResponse.json({
      success: true,
      resultId: testAttempt.id,
      score: rawScore,
      correctAnswers,
      totalQuestions: questions.length,
      passed,
      breakdown
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}
