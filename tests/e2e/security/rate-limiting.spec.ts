import { test, expect } from '@playwright/test';

test.describe('Rate Limiting', () => {
  test('should rate limit registration attempts', async ({ request }) => {
    // Make requests sequentially to test rate limiting properly
    // Use unique timestamp to avoid conflicts with other tests
    const baseEmail = `ratelimit${Date.now()}`;
    const responses = [];

    // Make 6 sequential requests
    for (let i = 0; i < 6; i++) {
      const response = await request.post('/api/auth/register', {
        data: {
          email: `${baseEmail}_${i}@test.com`,
          password: 'Test12345!@#$%',
          name: 'Rate Limit Test',
        },
      });
      responses.push(response);

      // If we hit rate limit, stop
      if (response.status() === 429) {
        break;
      }
    }

    // Should have hit rate limit by the 6th request
    const rateLimited = responses.find(r => r.status() === 429);
    expect(rateLimited).toBeDefined();

    if (rateLimited) {
      const errorBody = await rateLimited.json();
      expect(errorBody.error).toBe('Rate limit exceeded');
      expect(errorBody.retryAfter).toBeGreaterThan(0);
    }
  });

  test('should include rate limit headers in response', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        email: `headers${Date.now()}@test.com`,
        password: 'Test12345!@#$%',
        name: 'Headers Test',
      },
    });

    // Check for rate limit headers
    const headers = response.headers();
    expect(headers['x-ratelimit-limit']).toBeDefined();
    expect(headers['x-ratelimit-remaining']).toBeDefined();
    expect(headers['x-ratelimit-reset']).toBeDefined();

    // Validate header values
    const limit = parseInt(headers['x-ratelimit-limit']);
    const remaining = parseInt(headers['x-ratelimit-remaining']);

    expect(limit).toBe(5); // Auth preset is 5 requests per 15 minutes
    expect(remaining).toBeLessThanOrEqual(limit);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  test('should rate limit admin API endpoints', async ({ request }) => {
    // Try to access admin endpoint without auth (should still apply rate limiting)
    const requests = [];
    for (let i = 0; i < 25; i++) {
      requests.push(request.get('/api/admin/thresholds'));
    }

    const responses = await Promise.all(requests);

    // All should either be 401 (unauthorized) or 429 (rate limited)
    // Admin preset is 20 per minute, so last few should be rate limited
    const rateLimitedCount = responses.filter(r => r.status() === 429).length;
    expect(rateLimitedCount).toBeGreaterThan(0);
  });
});
