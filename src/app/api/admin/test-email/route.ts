import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/utils/auth';

/**
 * GET /api/admin/test-email
 *
 * Test endpoint to preview email templates without sending
 * Returns sample email data that would be sent
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'practice';

    const emailData: Record<string, any> = {
      practice: {
        to: user.email,
        userName: user.name || 'Student',
        contentArea: 'Federal Mortgage-Related Laws',
        score: 17,
        totalQuestions: 20,
        passed: true,
        weakAreas: ['Truth in Lending Act (TILA)', 'Fair Housing Act']
      },
      exam: {
        to: user.email,
        userName: user.name || 'Student',
        rawScore: 82,
        adjustedScore: 85,
        passed: true,
        timeSpent: 9800,
        recommendations: [
          'Great job on Federal Laws!',
          'Review General Mortgage Knowledge - you scored 68%',
          'Practice more on Loan Origination Activities'
        ]
      },
      reminder: {
        to: user.email,
        userName: user.name || 'Student',
        daysSinceLastStudy: 3,
        totalQuestionsAnswered: 450
      },
      weekly: {
        to: user.email,
        userName: user.name || 'Student',
        weekStats: {
          practiceTestsTaken: 5,
          fullExamsTaken: 2,
          totalQuestions: 225,
          averageScore: 78,
          studyDays: 5,
          totalTimeMinutes: 380
        },
        topStrengths: ['Federal Laws (85%)', 'Ethics (82%)'],
        topWeaknesses: ['General Knowledge (68%)', 'Uniform State Content (71%)']
      }
    };

    return NextResponse.json({
      success: true,
      emailType: type,
      data: emailData[type] || emailData.practice,
      note: 'This is preview data. Set RESEND_API_KEY to actually send emails.'
    });

  } catch (error) {
    console.error('[API] Error testing email:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
