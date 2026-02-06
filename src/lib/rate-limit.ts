import { NextRequest } from 'next/server';

/**
 * Rate Limiting Utility
 *
 * Uses in-memory Map for development/demo.
 * For production with multiple instances, replace with Redis:
 * - Use @upstash/redis or ioredis
 * - Store requests in Redis with TTL
 * - Use atomic INCR commands
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  limit: number; // Max requests per interval
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for multi-instance deployments)
const store = new Map<string, RateLimitStore>();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit a request based on IP address
 *
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns Object with success status and optional error response
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  response?: Response;
}> {
  // Get client IP (supports various deployment scenarios)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'anonymous';

  const key = `ratelimit:${ip}`;
  const now = Date.now();

  let record = store.get(key);

  // Initialize or reset if window expired
  if (!record || record.resetTime < now) {
    record = {
      count: 1,
      resetTime: now + config.interval,
    };
    store.set(key, record);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: record.resetTime,
    };
  }

  // Increment counter
  record.count++;

  // Check if limit exceeded
  if (record.count > config.limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: record.resetTime,
      response: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': record.resetTime.toString(),
          },
        }
      ),
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - record.count,
    reset: record.resetTime,
  };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict - for auth endpoints (5 requests per 15 minutes)
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    limit: 5,
  },

  // Strict - for admin endpoints (20 requests per minute)
  admin: {
    interval: 60 * 1000, // 1 minute
    limit: 20,
  },

  // Standard - for general API endpoints (100 requests per minute)
  api: {
    interval: 60 * 1000, // 1 minute
    limit: 100,
  },

  // Generous - for reading data (200 requests per minute)
  read: {
    interval: 60 * 1000, // 1 minute
    limit: 200,
  },
} as const;

/**
 * Helper to add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: Response,
  result: Awaited<ReturnType<typeof rateLimit>>
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.reset.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
