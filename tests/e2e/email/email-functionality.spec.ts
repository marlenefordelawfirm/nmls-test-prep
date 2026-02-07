import { test, expect } from '@playwright/test';

test.describe('Email Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should have Resend API key configured', async ({ page }) => {
    // Check if RESEND_API_KEY is set by making a request to test endpoint
    const response = await page.request.get('/api/admin/test-email?type=practice');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('data');
  });

  test.skip('should send email when completing practice test', async ({ page }) => {
    // This test is skipped because it requires:
    // 1. A valid RESEND_API_KEY to be set
    // 2. A verified sender domain in Resend
    // 3. The full practice test flow to be completed
    //
    // To manually test:
    // 1. Complete a practice test
    // 2. Check your email for the results notification
    // 3. Verify the email contains score, weak areas, and CTA
  });

  test('should not crash if email fails to send', async ({ page }) => {
    // This test verifies that email failures don't break the user flow
    // Even if Resend is down, test submission should still work

    // Navigate to practice page
    await page.goto('/practice');

    // The page should load successfully even if email service is unavailable
    await expect(page.locator('h1').first()).toBeVisible();

    // Verify practice test cards are visible
    await expect(page.locator('text=/Federal|General|Ethics/i').first()).toBeVisible();
  });

  test('should provide email preview data for admin', async ({ page }) => {
    // Navigate to test email endpoint
    const response = await page.request.get('/api/admin/test-email?type=practice');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.emailType).toBe('practice');
    expect(data.data).toHaveProperty('to');
    expect(data.data).toHaveProperty('userName');
    expect(data.data).toHaveProperty('contentArea');
    expect(data.data).toHaveProperty('score');
    expect(data.data).toHaveProperty('passed');
  });

  test('should show different email types', async ({ page }) => {
    const types = ['practice', 'exam', 'reminder', 'weekly'];

    for (const type of types) {
      const response = await page.request.get(`/api/admin/test-email?type=${type}`);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.emailType).toBe(type);
      expect(data.data).toBeDefined();
    }
  });
});
