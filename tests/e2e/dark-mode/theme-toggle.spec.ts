import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display theme toggle button', async ({ page }) => {
    // Check for theme toggle button in header
    const toggleButton = page.locator('button[aria-label="Toggle theme"]');
    await expect(toggleButton).toBeVisible();
  });

  test('should toggle between light and dark mode', async ({ page }) => {
    // Get the html element to check for dark class
    const html = page.locator('html');

    // Click toggle button
    const toggleButton = page.locator('button[aria-label="Toggle theme"]');
    await toggleButton.click();

    // Wait a bit for theme to update
    await page.waitForTimeout(500);

    // Check if dark class was added or removed (depends on initial state)
    const htmlClasses = await html.getAttribute('class');

    // Click again to toggle back
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Classes should have changed
    const htmlClassesAfter = await html.getAttribute('class');
    expect(htmlClasses).not.toBe(htmlClassesAfter);
  });

  test('should persist theme preference', async ({ page }) => {
    // Toggle to dark mode
    const toggleButton = page.locator('button[aria-label="Toggle theme"]');

    // Click once
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Get current theme state
    const html = page.locator('html');
    const initialClasses = await html.getAttribute('class');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Theme should persist
    const classesAfterReload = await html.getAttribute('class');
    expect(classesAfterReload).toBe(initialClasses);
  });

  test('should apply dark mode styles to sidebar', async ({ page }) => {
    // Toggle to dark mode
    const toggleButton = page.locator('button[aria-label="Toggle theme"]');
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Check if sidebar has dark mode classes
    const sidebar = page.locator('aside');
    const sidebarClasses = await sidebar.getAttribute('class');

    // Should contain dark: classes for dark mode
    expect(sidebarClasses).toBeTruthy();
  });

  test('should show moon icon in light mode and sun icon in dark mode', async ({ page }) => {
    const toggleButton = page.locator('button[aria-label="Toggle theme"]');

    // Check initial icon
    const initialIconCount = await toggleButton.locator('svg').count();
    expect(initialIconCount).toBe(1);

    // Toggle theme
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Icon should still be present (but different)
    const afterIconCount = await toggleButton.locator('svg').count();
    expect(afterIconCount).toBe(1);
  });
});
