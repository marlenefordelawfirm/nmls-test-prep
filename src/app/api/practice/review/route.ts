import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID required' },
        { status: 400 }
      );
    }

    // Fetch test attempt with answers and question details
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
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
              select: {
                id: true,
                questionText: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
                explanation: true,
                difficulty: true,
                subTopic: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    if (testAttempt.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (testAttempt.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Test not completed' },
        { status: 400 }
      );
    }

    // Normalize helper: "optionA" -> "A", "A" -> "A"
    const normalizeAnswer = (val: string) => {
      let normalized = (val || '').trim();
      if (normalized.toLowerCase().startsWith('option')) {
        normalized = normalized.replace(/^option/i, '');
      }
      return normalized.toUpperCase();
    };

    // Recalculate isCorrect using normalized comparison
    // (old grading may have stored incorrect isCorrect values)
    let recalcCorrectCount = 0;
    const questions = testAttempt.answers.map((answer, index) => {
      const isCorrect = normalizeAnswer(answer.question.correctAnswer) === normalizeAnswer(answer.selectedAnswer);
      if (isCorrect) recalcCorrectCount++;

      return {
        questionNumber: index + 1,
        id: answer.question.id,
        questionText: answer.question.questionText,
        optionA: answer.question.optionA,
        optionB: answer.question.optionB,
        optionC: answer.question.optionC,
        optionD: answer.question.optionD,
        correctAnswer: answer.question.correctAnswer,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        explanation: answer.question.explanation,
        difficulty: answer.question.difficulty,
        subTopic: answer.question.subTopic?.name
      };
    });

    const recalcScore = questions.length > 0
      ? Math.round((recalcCorrectCount / questions.length) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      review: {
        attemptId,
        contentArea: testAttempt.contentArea,
        score: recalcScore,
        correctAnswers: recalcCorrectCount,
        totalQuestions: testAttempt.totalQuestions,
        questions
      }
    });

  } catch (error) {
    console.error('Error fetching review data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review data' },
      { status: 500 }
    );
  }
}
