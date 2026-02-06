import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

type AuthResult =
  | { error: NextResponse; session?: never }
  | { session: Session; error?: never };

/**
 * Get the current session
 *
 * @returns Session object or null if not authenticated
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication for an API endpoint
 *
 * @returns User session or error response
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      ),
    };
  }

  return { session };
}

/**
 * Require admin role for an API endpoint
 *
 * @returns User session or error response
 */
export async function requireAdmin(): Promise<AuthResult> {
  const authResult = await requireAuth();

  if (authResult.error) {
    return authResult;
  }

  const { session } = authResult;

  if (session.user.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
          },
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}

/**
 * Require specific subscription tier
 *
 * @param minTier - Minimum subscription tier required
 * @returns User session or error response
 */
export async function requireSubscription(
  minTier: 'FREE' | 'MONTHLY' | 'ANNUAL' = 'MONTHLY'
): Promise<AuthResult> {
  const authResult = await requireAuth();

  if (authResult.error) {
    return authResult;
  }

  const { session } = authResult;

  const tierLevels = {
    FREE: 0,
    MONTHLY: 1,
    ANNUAL: 2,
  };

  const currentTier = (session.user as any).subscriptionTier || 'FREE';
  const userTierLevel = tierLevels[currentTier as keyof typeof tierLevels] || 0;
  const requiredTierLevel = tierLevels[minTier];

  if (userTierLevel < requiredTierLevel) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'SUBSCRIPTION_REQUIRED',
            message: `${minTier} subscription required`,
            requiredTier: minTier,
            currentTier,
          },
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}
