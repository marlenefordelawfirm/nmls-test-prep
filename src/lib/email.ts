import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
export const EMAIL_FROM = process.env.EMAIL_FROM || 'NMLS Test Prep <noreply@nmlstestprep.com>';

// Email service for sending various types of emails
export const emailService = {
  /**
   * Send a test to verify Resend configuration
   */
  async sendTestEmail(to: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: 'NMLS Test Prep - Test Email',
        html: '<p>This is a test email from NMLS Test Prep. If you received this, email is configured correctly!</p>'
      });

      return { success: true, data };
    } catch (error) {
      console.error('[Email] Test email failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Send practice test completion email
   */
  async sendPracticeTestResult(params: {
    to: string;
    userName: string;
    contentArea: string;
    score: number;
    totalQuestions: number;
    passed: boolean;
    weakAreas: string[];
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set, skipping practice test result email');
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const { to, userName, contentArea, score, totalQuestions, passed, weakAreas } = params;
    const percentage = Math.round((score / totalQuestions) * 100);

    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: passed
          ? `✅ You passed your ${contentArea} practice test!`
          : `📊 Your ${contentArea} practice test results`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        ${passed ? '🎉 Congratulations!' : '📊 Practice Test Results'}
      </h1>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        Hi ${userName},
      </p>

      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        ${passed
          ? `Great job! You've successfully completed your <strong>${contentArea}</strong> practice test.`
          : `You've completed your <strong>${contentArea}</strong> practice test. Keep practicing to improve your score!`
        }
      </p>

      <!-- Score Box -->
      <div style="background: ${passed ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${passed ? '#86efac' : '#fca5a5'}; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 48px; font-weight: 700; color: ${passed ? '#16a34a' : '#dc2626'}; margin-bottom: 8px;">
          ${percentage}%
        </div>
        <div style="font-size: 14px; color: #64748b; font-weight: 600;">
          ${score} out of ${totalQuestions} correct
        </div>
      </div>

      ${weakAreas.length > 0 ? `
      <!-- Weak Areas -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; color: #1e293b; margin-bottom: 12px;">
          📚 Areas to Focus On
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${weakAreas.map(area => `
            <li style="padding: 8px 12px; background: #f1f5f9; border-radius: 8px; margin-bottom: 8px; font-size: 14px; color: #475569;">
              ${area}
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/practice"
           style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Continue Practicing
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p>NMLS Test Prep - Master Your Mortgage Licensing Exam</p>
      <p>This email was sent because you completed a practice test.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      return { success: true, data };
    } catch (error) {
      console.error('[Email] Practice test result email failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Send full exam completion email
   */
  async sendFullExamResult(params: {
    to: string;
    userName: string;
    rawScore: number;
    adjustedScore: number;
    passed: boolean;
    timeSpent: number;
    recommendations: string[];
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set, skipping full exam result email');
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const { to, userName, rawScore, adjustedScore, passed, timeSpent, recommendations } = params;
    const minutes = Math.floor(timeSpent / 60);

    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: passed
          ? '🏆 Congratulations! You passed your NMLS practice exam!'
          : '📊 Your NMLS practice exam results',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        ${passed ? '🏆 Exam Passed!' : '📊 Exam Completed'}
      </h1>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        Hi ${userName},
      </p>

      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        ${passed
          ? 'Congratulations! You\'ve successfully passed your NMLS practice exam. You\'re well on your way to exam day success!'
          : 'You\'ve completed your NMLS practice exam. Keep studying - you\'re making progress!'
        }
      </p>

      <!-- Score Boxes -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div style="background: ${passed ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${passed ? '#86efac' : '#fca5a5'}; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
            Adjusted Score
          </div>
          <div style="font-size: 32px; font-weight: 700; color: ${passed ? '#16a34a' : '#dc2626'};">
            ${adjustedScore}%
          </div>
        </div>
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
            Time Spent
          </div>
          <div style="font-size: 32px; font-weight: 700; color: #475569;">
            ${minutes}m
          </div>
        </div>
      </div>

      ${recommendations.length > 0 ? `
      <!-- Recommendations -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; color: #1e293b; margin-bottom: 12px;">
          📚 Personalized Study Plan
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${recommendations.map(rec => `
            <li style="padding: 12px; background: #f1f5f9; border-radius: 8px; margin-bottom: 8px; font-size: 14px; color: #475569;">
              ${rec}
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/exam"
           style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          ${passed ? 'Take Another Exam' : 'Try Again'}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p>NMLS Test Prep - Master Your Mortgage Licensing Exam</p>
      <p>This email was sent because you completed a full practice exam.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      return { success: true, data };
    } catch (error) {
      console.error('[Email] Full exam result email failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Send study reminder email
   */
  async sendStudyReminder(params: {
    to: string;
    userName: string;
    daysSinceLastStudy: number;
    totalQuestionsAnswered: number;
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set, skipping study reminder email');
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const { to, userName, daysSinceLastStudy, totalQuestionsAnswered } = params;

    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: '📚 Time to study! Your NMLS exam awaits',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        📚 Keep Up the Momentum!
      </h1>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        Hi ${userName},
      </p>

      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        It's been <strong>${daysSinceLastStudy} ${daysSinceLastStudy === 1 ? 'day' : 'days'}</strong> since your last study session.
        Consistent practice is key to exam success!
      </p>

      <!-- Stats Box -->
      <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="font-size: 14px; color: #64748b; font-weight: 600;">
            Questions Answered So Far
          </div>
          <div style="font-size: 36px; font-weight: 700; color: #1e40af; margin-top: 4px;">
            ${totalQuestionsAnswered}
          </div>
        </div>
        <p style="text-align: center; color: #64748b; font-size: 14px; margin: 0;">
          Every question brings you closer to passing!
        </p>
      </div>

      <!-- Tips -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; color: #1e293b; margin-bottom: 12px;">
          💡 Study Tip of the Day
        </h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; background: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #fbbf24;">
          Aim for at least 20 questions per day. Short, frequent study sessions are more effective than long, infrequent ones!
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/practice"
           style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Start Studying Now
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p>NMLS Test Prep - Master Your Mortgage Licensing Exam</p>
      <p>Don't want these reminders? <a href="#" style="color: #3b82f6;">Update preferences</a></p>
    </div>
  </div>
</body>
</html>
        `
      });

      return { success: true, data };
    } catch (error) {
      console.error('[Email] Study reminder email failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Send weekly progress report email
   */
  async sendWeeklyProgress(params: {
    to: string;
    userName: string;
    weekStats: {
      practiceTestsTaken: number;
      fullExamsTaken: number;
      totalQuestions: number;
      averageScore: number;
      studyDays: number;
      totalTimeMinutes: number;
    };
    topStrengths: string[];
    topWeaknesses: string[];
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set, skipping weekly progress email');
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const { to, userName, weekStats, topStrengths, topWeaknesses } = params;
    const hours = Math.floor(weekStats.totalTimeMinutes / 60);
    const minutes = weekStats.totalTimeMinutes % 60;

    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: '📊 Your weekly study progress report is ready!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        📊 Your Weekly Progress
      </h1>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        Hi ${userName},
      </p>

      <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
        Here's a summary of your study activity from the past week. Keep up the great work!
      </p>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f0fdf4; border: 2px solid #86efac; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
            Practice Tests
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #16a34a;">
            ${weekStats.practiceTestsTaken}
          </div>
        </div>
        <div style="background: #fef2f2; border: 2px solid #fca5a5; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
            Full Exams
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #dc2626;">
            ${weekStats.fullExamsTaken}
          </div>
        </div>
        <div style="background: #eff6ff; border: 2px solid #93c5fd; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
            Questions Answered
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #1e40af;">
            ${weekStats.totalQuestions}
          </div>
        </div>
        <div style="background: #fefce8; border: 2px solid #fde047; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
            Average Score
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #ca8a04;">
            ${weekStats.averageScore}%
          </div>
        </div>
      </div>

      <!-- Time Tracking -->
      <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 8px;">
          Total Study Time
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af;">
          ${hours}h ${minutes}m
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
          Across ${weekStats.studyDays} ${weekStats.studyDays === 1 ? 'day' : 'days'} this week
        </div>
      </div>

      ${topStrengths.length > 0 ? `
      <!-- Strengths -->
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 16px; color: #16a34a; margin-bottom: 8px;">
          💪 Top Strengths
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${topStrengths.map(strength => `
            <li style="padding: 8px 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 6px; font-size: 13px; color: #166534;">
              ✓ ${strength}
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${topWeaknesses.length > 0 ? `
      <!-- Weaknesses -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; color: #dc2626; margin-bottom: 8px;">
          📚 Focus Areas
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${topWeaknesses.map(weakness => `
            <li style="padding: 8px 12px; background: #fef2f2; border-radius: 8px; margin-bottom: 6px; font-size: 13px; color: #991b1b;">
              → ${weakness}
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/practice"
           style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Continue Your Progress
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p>NMLS Test Prep - Master Your Mortgage Licensing Exam</p>
      <p>This is your weekly progress summary. <a href="#" style="color: #3b82f6;">Update preferences</a></p>
    </div>
  </div>
</body>
</html>
        `
      });

      return { success: true, data };
    } catch (error) {
      console.error('[Email] Weekly progress email failed:', error);
      return { success: false, error };
    }
  }
};
