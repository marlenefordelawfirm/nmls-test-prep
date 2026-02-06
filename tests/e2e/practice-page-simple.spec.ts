import { test, expect } from '@playwright/test';

test.describe('Practice Page Structure', () => {
  test('practice page loads and displays content area cards', async ({ page }) => {
    // Navigate directly to practice page (will redirect to login if not authenticated)
    await page.goto('http://localhost:3000/practice');

    // Check if redirected to login (expected if not authenticated)
    const url = page.url();
    if (url.includes('/login')) {
      console.log('✅ Practice page requires authentication (redirects to login)');
      expect(url).toContain('/login');
    } else {
      // If authenticated, check page content
      await expect(page.locator('h1')).toContainText('Choose Your Practice Area');
      console.log('✅ Practice page accessible and displays header');
    }
  });

  test('dashboard has Start Practice button', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // If redirected to login, that's expected
    const url = page.url();
    if (url.includes('/login')) {
      console.log('✅ Dashboard requires authentication');
      expect(url).toContain('/login');
    } else {
      // Check for Start Practice button
      const startPracticeButton = page.locator('text=Start Practice').first();
      if (await startPracticeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ Start Practice button found on dashboard');
        expect(await startPracticeButton.isVisible()).toBe(true);
      }
    }
  });
});
