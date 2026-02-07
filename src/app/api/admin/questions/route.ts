import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return authResult.error;
  }

  try {
    // Fetch all content areas with question counts
    const contentAreas = await prisma.contentArea.findMany({
      select: {
        id: true,
        name: true,
        sortOrder: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Fetch all questions with their sub-topics
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        questionText: true,
        difficulty: true,
        approvalStatus: true,
        createdBy: true,
        contentAreaId: true,
        subTopic: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { approvalStatus: 'asc' }, // APPROVED first, then PENDING, then REJECTED
        { createdAt: 'desc' },
      ],
    });

    // Group questions by content area
    const questionsByArea: { [key: string]: any[] } = {};
    questions.forEach((question) => {
      if (!questionsByArea[question.contentAreaId]) {
        questionsByArea[question.contentAreaId] = [];
      }
      questionsByArea[question.contentAreaId].push(question);
    });

    return NextResponse.json({
      success: true,
      contentAreas,
      questionsByArea,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
