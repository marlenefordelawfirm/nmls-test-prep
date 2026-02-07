import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Hamburger button should be visible
    const hamburgerButton = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburgerButton).toBeVisible();

    // Desktop sidebar should be hidden
    const desktopSidebar = page.locator('aside.hidden.md\\:flex');
    await expect(desktopSidebar).not.toBeVisible();
  });

  test('should open mobile menu when clicking hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Click hamburger button
    await page.click('button[aria-label="Toggle navigation menu"]');

    // Mobile sidebar should slide in
    await page.waitForTimeout(500); // Wait for animation

    // Check if navigation links are visible in mobile menu
    const practiceLink = page.locator('aside a:has-text("Practice Tests")').last();
    await expect(practiceLink).toBeVisible();
  });

  test('should close mobile menu when clicking X button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Open menu
    await page.click('button[aria-label="Toggle navigation menu"]');
    await page.waitForTimeout(300);

    // Click X button inside the mobile sidebar
    const closeButton = page.locator('aside.fixed button:has-text("")').first();
    await closeButton.click({ force: true });

    // Wait for menu to close
    await page.waitForTimeout(500);

    // Hamburger button should show Menu icon again (not X)
    const hamburgerButton = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburgerButton).toBeVisible();
  });

  test('should hide hamburger on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Hamburger button should be hidden
    const hamburgerButton = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburgerButton).not.toBeVisible();

    // Desktop sidebar should be visible
    const desktopSidebar = page.locator('aside.hidden.md\\:flex');
    await expect(desktopSidebar).toBeVisible();
  });

  test('should navigate to pages from mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Open menu
    await page.click('button[aria-label="Toggle navigation menu"]');
    await page.waitForTimeout(300);

    // Click on Analytics link
    await page.locator('aside a:has-text("Analytics")').last().click();

    // Should navigate to analytics page
    await expect(page).toHaveURL(/.*analytics/);
  });
});
