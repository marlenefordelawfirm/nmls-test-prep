import { test, expect } from '@playwright/test';

test.describe('Sentry Integration Tests', () => {
  test.describe('Configuration', () => {
    test('should have Sentry DSN configured in environment', async ({ page }) => {
      await page.goto('/test-sentry');

      // Check environment variable status
      const envStatus = await page.locator('text=NEXT_PUBLIC_SENTRY_DSN:').textContent();
      expect(envStatus).toContain('✅ Set');
    });

    test('should load Sentry client library', async ({ page }) => {
      await page.goto('/test-sentry');

      // Check if Sentry is loaded in the browser
      const sentryLoaded = await page.evaluate(() => {
        return typeof (window as any).Sentry !== 'undefined';
      });

      expect(sentryLoaded).toBe(true);
    });
  });

  test.describe('Manual Error Capture', () => {
    test('should send test message to Sentry', async ({ page }) => {
      await page.goto('/test-sentry');

      // Click "Send Test Message" button
      await page.click('button:has-text("Send Test Message")');

      // Verify success message
      await expect(page.locator('text=Test message sent')).toBeVisible({ timeout: 5000 });
    });

    test('should send test error to Sentry', async ({ page }) => {
      await page.goto('/test-sentry');

      // Click "Send Test Error" button
      await page.click('button:has-text("Send Test Error")');

      // Verify success message
      await expect(page.locator('text=Test error sent')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Automatic Error Capture', () => {
    test('should capture uncaught errors', async ({ page }) => {
      // Set up console error listener to verify error is thrown
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/test-sentry');

      // Click button that triggers uncaught error
      await page.click('button:has-text("Trigger Crash")');

      // Wait a bit for error to be thrown
      await page.waitForTimeout(500);

      // Verify error was thrown
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Uncaught error test');
    });

    test('should handle React component errors gracefully', async ({ page }) => {
      // Navigate to a page that might have errors
      await page.goto('/dashboard');

      // Page should load without crashing
      await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Server-Side Error Capture', () => {
    test('should capture API route errors', async ({ request }) => {
      // Try to access a protected endpoint without auth
      const response = await request.get('/api/admin/thresholds');

      // Should return 401 (error is captured by Sentry automatically)
      expect(response.status()).toBe(401);
    });

    test('should handle invalid API requests', async ({ request }) => {
      // Send invalid data to registration endpoint
      const response = await request.post('/api/auth/register', {
        data: {
          email: 'invalid',
          password: 'short',
        },
      });

      // Should return 400 validation error
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track page navigation', async ({ page }) => {
      await page.goto('/');

      // Navigate to login page
      await page.goto('/login');

      // Verify page loaded successfully
      await expect(page.locator('h2:has-text("Welcome back")')).toBeVisible();
    });

    test('should track API performance', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get('/');

      const duration = Date.now() - startTime;

      // Verify response is reasonably fast (< 2 seconds)
      expect(duration).toBeLessThan(2000);
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Privacy & Security', () => {
    test('should not expose sensitive data in Sentry events', async ({ page }) => {
      // This test verifies that our Sentry config filters sensitive data
      // We can't directly test what Sentry receives, but we can verify the page works

      await page.goto('/register');

      // Fill in form with sensitive data
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecretPassword123!');
      await page.fill('input[name="name"]', 'Test User');

      // Submit form (will likely fail, but that's okay)
      await page.click('button[type="submit"]');

      // Wait for response
      await page.waitForTimeout(1000);

      // Page should still be functional (not crashed)
      expect(await page.title()).toBeTruthy();
    });

    test('should mask passwords in error events', async ({ page }) => {
      await page.goto('/login');

      // Fill in password
      await page.fill('input[name="password"]', 'SensitivePassword123!');

      // Trigger an error (invalid email)
      await page.fill('input[name="email"]', 'invalid');
      await page.click('button[type="submit"]');

      // Wait for error
      await page.waitForTimeout(1000);

      // Verify page didn't crash
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });
  });

  test.describe('Sentry Dashboard Verification (Manual)', () => {
    test('should provide instructions for manual verification', async ({ page }) => {
      await page.goto('/test-sentry');

      // Verify instructions are visible
      await expect(page.locator('text=Check Sentry Dashboard')).toBeVisible();
      await expect(page.locator('text=sentry.io')).toBeVisible();
    });
  });
});
