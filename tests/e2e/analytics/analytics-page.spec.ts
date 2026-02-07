import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display analytics page header', async ({ page }) => {
    await page.goto('/analytics');

    // Check page header
    await expect(page.locator('h1').filter({ hasText: 'Your Analytics' })).toBeVisible();
    await expect(page.locator('text=Track your progress and identify areas for improvement')).toBeVisible();
  });

  test('should display overview statistics', async ({ page }) => {
    await page.goto('/analytics');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for stats cards
    await expect(page.getByRole('paragraph').filter({ hasText: 'Practice Tests' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Full Exams' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Questions Answered' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Average Score' })).toBeVisible();
  });

  test('should display study time section', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Check for study time card
    await expect(page.locator('text=Total Study Time')).toBeVisible();
    await expect(page.locator('text=Study Consistency')).toBeVisible();
  });

  test('should display performance by content area', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Check for performance section
    await expect(page.locator('h2').filter({ hasText: 'Performance by Content Area' })).toBeVisible();
  });

  test('should display strengths and weaknesses sections', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Check for strengths/weaknesses cards
    await expect(page.locator('h2').filter({ hasText: 'Top Strengths' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Areas to Improve' })).toBeVisible();
  });

  test('should display recent activity section', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Check for recent activity card
    await expect(page.locator('h2').filter({ hasText: 'Recent Activity' })).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();
  });

  test('should refresh data when clicking refresh button', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Click refresh
    await page.locator('button:has-text("Refresh")').click();

    // Wait for potential loading state and data reload
    await page.waitForTimeout(1000);

    // Page should still be visible (not crashed)
    await expect(page.locator('h1').filter({ hasText: 'Your Analytics' })).toBeVisible();
  });

  test('should use correct DESIGN.md colors', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Check blue-700 primary button (Refresh button)
    const refreshButton = page.locator('button:has-text("Refresh")');
    const buttonClasses = await refreshButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-blue-700');

    // Check rounded-xl on buttons and cards
    expect(buttonClasses).toContain('rounded-xl');
  });

  test('should navigate to analytics from dashboard menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on Analytics link in sidebar
    await page.locator('nav a:has-text("Analytics")').click();

    // Should navigate to analytics page
    await expect(page).toHaveURL(/.*analytics/);
    await expect(page.locator('h1').filter({ hasText: 'Your Analytics' })).toBeVisible();
  });

  test('should handle empty data state gracefully', async ({ page }) => {
    // This test verifies the page doesn't crash with no data
    await page.goto('/analytics');

    await page.waitForLoadState('networkidle');

    // Page should load without errors
    await expect(page.locator('h1').filter({ hasText: 'Your Analytics' })).toBeVisible();

    // Should show 0 or empty states
    // (The actual values will depend on the test data in the database)
  });
});
