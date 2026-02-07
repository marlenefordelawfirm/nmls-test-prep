import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

export async function PATCH(request: Request) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { questionId, approvalStatus } = body;

    if (!questionId || !approvalStatus) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate approval status
    const validStatuses = ['APPROVED', 'PENDING', 'REJECTED'];
    if (!validStatuses.includes(approvalStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid approval status' },
        { status: 400 }
      );
    }

    // Update the question
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { approvalStatus },
      select: {
        id: true,
        approvalStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      question,
      message: `Question ${approvalStatus.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Error updating question status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update question status' },
      { status: 500 }
    );
  }
}
