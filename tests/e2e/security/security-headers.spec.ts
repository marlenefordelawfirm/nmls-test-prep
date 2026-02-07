import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('should include X-Frame-Options header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    expect(headers).toBeDefined();
    expect(headers?.['x-frame-options']).toBe('DENY');
  });

  test('should include X-Content-Type-Options header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    expect(headers).toBeDefined();
    expect(headers?.['x-content-type-options']).toBe('nosniff');
  });

  test('should include Referrer-Policy header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    expect(headers).toBeDefined();
    expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('should include X-XSS-Protection header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    expect(headers).toBeDefined();
    expect(headers?.['x-xss-protection']).toBe('1; mode=block');
  });

  test('should include Content-Security-Policy header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    expect(headers).toBeDefined();
    expect(headers?.['content-security-policy']).toBeDefined();

    const csp = headers?.['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  test('should include Permissions-Policy header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    expect(headers).toBeDefined();
    expect(headers?.['permissions-policy']).toBeDefined();

    const policy = headers?.['permissions-policy'];

    // Check that dangerous features are disabled
    expect(policy).toContain('camera=()');
    expect(policy).toContain('microphone=()');
    expect(policy).toContain('geolocation=()');
    expect(policy).toContain('payment=()');
  });

  test('should apply security headers to all routes', async ({ page }) => {
    const routes = [
      '/',
      '/login',
      '/register',
      '/dashboard',
      '/practice',
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      const headers = response?.headers();

      expect(headers?.['x-frame-options']).toBe('DENY');
      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['content-security-policy']).toBeDefined();
    }
  });

  test('should prevent clickjacking with X-Frame-Options', async ({ browser }) => {
    // Create a page that tries to iframe the app
    const context = await browser.newContext();
    const page = await context.newPage();

    // Attempt to load the app in an iframe
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <iframe id="target" src="${process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'}/"></iframe>
        </body>
      </html>
    `);

    // Wait a bit for the iframe to attempt to load
    await page.waitForTimeout(1000);

    // The iframe should be blocked or empty due to X-Frame-Options: DENY
    const iframe = page.frameLocator('#target');

    // Try to access iframe content - should fail or be empty
    let canAccessIframe = false;
    try {
      const body = await iframe.locator('body').textContent({ timeout: 2000 });
      canAccessIframe = body !== null && body.length > 0;
    } catch {
      canAccessIframe = false;
    }

    // If the security header works, we shouldn't be able to access the iframe
    // Note: This might not work in all test environments
    // The important thing is that the header is present
    expect(canAccessIframe).toBe(false);

    await context.close();
  });

  test('should include HSTS header in production', async ({ page }) => {
    // Note: This test only applies if NODE_ENV=production
    // In development, HSTS should not be set
    const response = await page.goto('/');
    const headers = response?.headers();

    if (process.env.NODE_ENV === 'production') {
      expect(headers?.['strict-transport-security']).toBeDefined();
      expect(headers?.['strict-transport-security']).toContain('max-age=');
      expect(headers?.['strict-transport-security']).toContain('includeSubDomains');
    } else {
      // In development, HSTS should not be present
      expect(headers?.['strict-transport-security']).toBeUndefined();
    }
  });

  test('should prevent MIME type sniffing', async ({ page, request }) => {
    // Test that responses have nosniff header
    const response = await request.get('/api/auth/register', {
      failOnStatusCode: false,
    });

    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');

    // Content type should be explicitly set
    expect(headers['content-type']).toBeDefined();
  });
});
