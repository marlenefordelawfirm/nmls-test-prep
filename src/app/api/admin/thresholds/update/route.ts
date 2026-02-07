import { NextRequest, NextResponse } from 'next/server';
import { updateFinancialThresholds } from '@/services/ThresholdUpdateService';
import { requireAdmin } from '@/lib/auth-helpers';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

/**
 * POST /api/admin/thresholds/update
 *
 * Manually trigger threshold update check.
 * This endpoint can also be called by a cron job (Vercel Cron, GitHub Actions, etc.)
 *
 * Authentication: TODO - Add admin authentication check
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimitPresets.admin);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    console.log('[API] Threshold update triggered');

    const result = await updateFinancialThresholds();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.updatesApplied > 0
          ? `Successfully applied ${result.updatesApplied} threshold updates`
          : 'No updates needed - all thresholds are current',
        updatesFound: result.updatesFound,
        updatesApplied: result.updatesApplied,
        updates: result.updates,
        errors: result.errors
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Threshold update check failed',
        errors: result.errors
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Error in threshold update:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/thresholds/update
 *
 * Check if updates are needed (dry run - doesn't apply changes)
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimitPresets.admin);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { shouldCheckForUpdates, getLastUpdateTime } = await import('@/services/ThresholdUpdateService');

    const lastUpdate = await getLastUpdateTime();
    const shouldCheck = shouldCheckForUpdates();

    return NextResponse.json({
      success: true,
      lastUpdate: lastUpdate?.toISOString() || null,
      shouldCheckToday: shouldCheck,
      recommendedSchedule: shouldCheck
        ? 'Daily check recommended (November/December or 1st of month)'
        : 'Monthly check on 1st of month',
      message: shouldCheck
        ? 'This is a good time to check for updates'
        : 'No scheduled check today - updates typically occur in Nov/Dec'
    });
  } catch (error) {
    console.error('[API] Error checking update status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
