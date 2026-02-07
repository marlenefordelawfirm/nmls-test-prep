import { test, expect } from '@playwright/test';

test.describe('Admin Authorization', () => {
  test('should block unauthenticated access to admin endpoints', async ({ request }) => {
    // Try to access admin endpoints without authentication
    const endpoints = [
      '/api/admin/thresholds',
      '/api/admin/thresholds/update',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);

      // Should return 401 Unauthorized
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toBe('Authentication required');
    }
  });

  test('should block non-admin users from admin endpoints', async ({ page, request }) => {
    // First, create and login as a regular student user
    const studentEmail = `student${Date.now()}@test.com`;
    const studentPassword = 'StudentPass123!@#';

    // Register student
    await request.post('/api/auth/register', {
      data: {
        email: studentEmail,
        password: studentPassword,
        name: 'Student User',
      },
    });

    // Login as student
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Get the session cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'));

    // Try to access admin endpoint with student credentials
    const response = await request.get('/api/admin/thresholds', {
      headers: {
        Cookie: sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
      },
    });

    // Should return 403 Forbidden (authenticated but not authorized)
    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toBe('Admin access required');
  });

  test('should allow admin users to access admin endpoints', async ({ page, request }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Get the session cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'));

    // Access admin endpoint with admin credentials
    const response = await request.get('/api/admin/thresholds', {
      headers: {
        Cookie: sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
      },
    });

    // Should succeed
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.thresholds).toBeDefined();
    expect(Array.isArray(body.thresholds)).toBe(true);
  });

  test('should prevent privilege escalation attempts', async ({ page, request }) => {
    // Create regular user
    const userEmail = `privesc${Date.now()}@test.com`;
    const userPassword = 'UserPass123!@#';

    await request.post('/api/auth/register', {
      data: {
        email: userEmail,
        password: userPassword,
        name: 'Regular User',
      },
    });

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', userPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'));

    // Try to access admin-only mutation endpoints
    const patchResponse = await request.patch('/api/admin/thresholds/some-id', {
      headers: {
        Cookie: sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
        'Content-Type': 'application/json',
      },
      data: {
        value: 999999,
      },
    });

    // Should be forbidden
    expect(patchResponse.status()).toBe(403);

    const postResponse = await request.post('/api/admin/thresholds/update', {
      headers: {
        Cookie: sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
      },
    });

    // Should be forbidden
    expect(postResponse.status()).toBe(403);
  });

  test('should protect admin UI routes', async ({ page }) => {
    // Try to access admin page without being logged in
    await page.goto('/admin/thresholds');

    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 5000 });

    // Login as non-admin student
    const studentEmail = `student-ui${Date.now()}@test.com`;
    await page.goto('/register');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', 'StudentPass123!@#');
    await page.fill('input[name="name"]', 'Student User');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Try to access admin page
    await page.goto('/admin/thresholds');

    // Should show access denied or redirect away from admin page
    // (Exact behavior depends on your middleware implementation)
    const url = page.url();
    const hasAccessDenied = await page.locator('text=/access denied|forbidden|not authorized/i').count() > 0;
    const redirectedAway = !url.includes('/admin/');

    expect(hasAccessDenied || redirectedAway).toBe(true);
  });
});
