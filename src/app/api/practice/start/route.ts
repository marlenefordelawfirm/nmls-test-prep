import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/utils/auth';
import { AdaptiveQuestionSelectionService } from '@/services/AdaptiveQuestionSelectionService';

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
    const { contentAreaId } = body;

    if (!contentAreaId) {
      return NextResponse.json(
        { error: 'Content area ID is required' },
        { status: 400 }
      );
    }

    // Verify content area exists
    const contentArea = await prisma.contentArea.findUnique({
      where: { id: contentAreaId }
    });

    if (!contentArea) {
      return NextResponse.json(
        { error: 'Content area not found' },
        { status: 404 }
      );
    }

    // Use adaptive question selection based on user performance
    const selectedQuestions = await AdaptiveQuestionSelectionService.selectQuestions({
      userId: user.id,
      contentAreaId,
      count: 20
    });

    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for this content area' },
        { status: 404 }
      );
    }

    // Create a test attempt
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId: user.id,
        type: 'SECTION_PRACTICE',
        contentAreaId,
        totalQuestions: selectedQuestions.length,
        scoredQuestions: selectedQuestions.length,
        correctAnswers: 0, // Will be calculated on submission
        rawScore: 0, // Will be calculated on submission
        status: 'IN_PROGRESS'
      }
    });

    // Format questions for response (hide correct answers)
    const formattedQuestions = selectedQuestions.map((q, index) => ({
      id: q.id,
      questionNumber: index + 1,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      difficulty: q.difficulty,
      subTopic: q.subTopic.name
    }));

    return NextResponse.json({
      success: true,
      attemptId: testAttempt.id,
      contentArea: {
        id: contentArea.id,
        name: contentArea.name
      },
      questions: formattedQuestions,
      totalQuestions: selectedQuestions.length
    });

  } catch (error) {
    console.error('Error starting practice test:', error);
    return NextResponse.json(
      { error: 'Failed to start practice test' },
      { status: 500 }
    );
  }
}
