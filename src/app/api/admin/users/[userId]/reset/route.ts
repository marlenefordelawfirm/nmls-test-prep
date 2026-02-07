import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return authResult.error;
  }

  const { userId } = await params;

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all user progress in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete test attempt answers first (foreign key constraint)
      await tx.answer.deleteMany({
        where: {
          testAttempt: {
            userId,
          },
        },
      });

      // Delete test attempts
      await tx.testAttempt.deleteMany({
        where: { userId },
      });

      // Delete content area progress
      await tx.userContentAreaProgress.deleteMany({
        where: { userId },
      });

      // Delete subtopic performance
      await tx.userSubTopicPerformance.deleteMany({
        where: { userId },
      });

      // Delete achievement progress
      await tx.userAchievement.deleteMany({
        where: { userId },
      });

      // Delete questions seen (spaced repetition)
      await tx.questionSeen.deleteMany({
        where: { userId },
      });

      // Delete study aids
      await tx.studyAid.deleteMany({
        where: { userId },
      });

      // Delete flashcards
      await tx.userFlashcard.deleteMany({
        where: { userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `All progress for user ${user.email} has been reset`,
    });
  } catch (error) {
    console.error('Error resetting user progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset user progress' },
      { status: 500 }
    );
  }
}
