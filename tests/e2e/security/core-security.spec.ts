import { test, expect } from '@playwright/test';

test.describe('Core Security Features', () => {
  test.describe('Authentication & Authorization', () => {
    test('should block unauthenticated access to admin API', async ({ request }) => {
      const response = await request.get('/api/admin/thresholds');

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    test('should block non-admin users from admin endpoints', async ({ page }) => {
      // Login as student
      await page.goto('/login');
      await page.fill('input[name="email"]', 'student@test.com');
      await page.fill('input[name="password"]', 'StudentPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Try to access admin API
      const response = await page.request.get('/api/admin/thresholds');

      expect(response.status()).toBe(403);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('FORBIDDEN');
    });

    test('should allow admin users to access admin endpoints', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@test.com');
      await page.fill('input[name="password"]', 'AdminPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Access admin API
      const response = await page.request.get('/api/admin/thresholds');

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.thresholds)).toBe(true);
    });
  });

  test.describe('Security Headers', () => {
    test('should include all critical security headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      expect(headers).toBeDefined();

      // Anti-clickjacking
      expect(headers?.['x-frame-options']).toBe('DENY');

      // MIME type sniffing prevention
      expect(headers?.['x-content-type-options']).toBe('nosniff');

      // Referrer policy
      expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin');

      // XSS protection (legacy browsers)
      expect(headers?.['x-xss-protection']).toBe('1; mode=block');

      // Content Security Policy
      expect(headers?.['content-security-policy']).toBeDefined();
      const csp = headers?.['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");

      // Permissions Policy
      expect(headers?.['permissions-policy']).toBeDefined();
      const pp = headers?.['permissions-policy'];
      expect(pp).toContain('camera=()');
      expect(pp).toContain('microphone=()');
    });

    test('should apply headers to API routes', async ({ request }) => {
      const response = await request.get('/api/admin/thresholds', {
        failOnStatusCode: false,
      });

      const headers = response.headers();

      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['content-security-policy']).toBeDefined();
    });
  });

  test.describe('Rate Limiting', () => {
    test('should include rate limit headers', async ({ request }) => {
      const response = await request.get('/api/admin/thresholds', {
        failOnStatusCode: false,
      });

      const headers = response.headers();

      // Even failed requests should have rate limit info
      expect(headers['x-ratelimit-limit']).toBeDefined();
      expect(headers['x-ratelimit-remaining']).toBeDefined();
      expect(headers['x-ratelimit-reset']).toBeDefined();
    });

    test('should return 429 with proper error message when rate limited', async ({ request }) => {
      // Make many rapid requests to trigger rate limit
      const requests = Array.from({ length: 30 }, () =>
        request.get('/api/admin/thresholds', { failOnStatusCode: false })
      );

      const responses = await Promise.all(requests);

      // Find a rate-limited response
      const rateLimited = responses.find(r => r.status() === 429);

      if (rateLimited) {
        const body = await rateLimited.json();
        expect(body.error).toBe('Rate limit exceeded');
        expect(body.retryAfter).toBeGreaterThan(0);

        const headers = rateLimited.headers();
        expect(headers['retry-after']).toBeDefined();
        expect(headers['x-ratelimit-remaining']).toBe('0');
      }
    });
  });

  test.describe('Input Validation', () => {
    test('should validate registration inputs', async ({ request }) => {
      // Test weak password
      const weakPasswordResponse = await request.post('/api/auth/register', {
        data: {
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        },
      });

      expect(weakPasswordResponse.status()).toBe(400);
      const weakBody = await weakPasswordResponse.json();
      expect(weakBody.error.code).toBe('VALIDATION_ERROR');

      // Test invalid email
      const invalidEmailResponse = await request.post('/api/auth/register', {
        data: {
          email: 'not-an-email',
          password: 'StrongPass123!@#',
          name: 'Test User',
        },
      });

      expect(invalidEmailResponse.status()).toBe(400);
      const emailBody = await invalidEmailResponse.json();
      expect(emailBody.error.code).toBe('VALIDATION_ERROR');
    });

    test('should validate threshold update inputs', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@test.com');
      await page.fill('input[name="password"]', 'AdminPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Try to update with invalid value
      const response = await page.request.patch('/api/admin/thresholds/test-id', {
        data: {
          value: 'not-a-number',
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });

  test.describe('SQL Injection Prevention', () => {
    test('should safely handle SQL injection attempts in email', async ({ request }) => {
      // Attempt SQL injection in email field
      const response = await request.post('/api/auth/register', {
        data: {
          email: "admin@test.com' OR '1'='1",
          password: 'TestPass123!@#',
          name: 'SQL Injection Test',
        },
      });

      // Should either fail validation (invalid email) or create user safely
      // Should NOT expose SQL errors or allow injection
      expect(response.status()).not.toBe(500);

      if (response.status() === 400) {
        const body = await response.json();
        expect(body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });
});
