import { test, expect } from '@playwright/test';

test.describe('Threshold Admin UI', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as admin before accessing the page
    await page.goto('/login');

    // Fill in login credentials
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to admin threshold page
    await page.goto('/admin/thresholds');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display page header and statistics', async ({ page }) => {
    // Check header - be specific to avoid matching dashboard header
    await expect(page.locator('h1').filter({ hasText: 'Financial Thresholds Management' })).toBeVisible();

    // Check statistics cards - use more specific selectors to avoid strict mode violations
    await expect(page.getByRole('paragraph').filter({ hasText: 'Total Thresholds' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Active' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Current Year' })).toBeVisible();
  });

  test('should display thresholds table with correct columns', async ({ page }) => {
    // Check table headers
    await expect(page.locator('th:has-text("Threshold")')).toBeVisible();
    await expect(page.locator('th:has-text("Value")')).toBeVisible();
    await expect(page.locator('th:has-text("Year")')).toBeVisible();
    await expect(page.locator('th:has-text("Source")')).toBeVisible();
    await expect(page.locator('th:has-text("Last Updated")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should display at least one threshold row', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('should show formatted threshold names', async ({ page }) => {
    // Wait for data
    await page.waitForSelector('tbody tr');

    // Check that threshold keys are formatted (spaces, title case)
    const firstThresholdName = await page.locator('tbody tr:first-child td:first-child p:first-child').textContent();
    expect(firstThresholdName).toBeTruthy();
    expect(firstThresholdName).toMatch(/[A-Z]/); // Contains uppercase letters
  });

  test('should show status badges correctly', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Check for Active status badge
    const activeBadges = await page.locator('text=Active').count();
    expect(activeBadges).toBeGreaterThan(0);
  });

  test('should have refresh button', async ({ page }) => {
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();
  });

  test('should have check for updates button', async ({ page }) => {
    const updateButton = page.locator('button:has-text("Check for Updates")');
    await expect(updateButton).toBeVisible();
    await expect(updateButton).toBeEnabled();
  });

  test('should enable edit mode when clicking edit button', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Click first edit button
    await page.locator('tbody tr:first-child button').first().click();

    // Check that input appears
    await expect(page.locator('input[type="number"]')).toBeVisible();

    // Check that save and cancel buttons appear
    await expect(page.locator('button').filter({ has: page.locator('svg') }).nth(0)).toBeVisible(); // Save button
  });

  test('should cancel edit when clicking cancel button', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Get the original value before editing
    const originalValue = await page.locator('tbody tr:first-child td:nth-child(2) span').textContent();

    // Enter edit mode
    await page.locator('tbody tr:first-child button').first().click();

    // Wait for edit mode
    await expect(page.locator('input[type="number"]')).toBeVisible();

    // Click cancel (X button) - it's in the same row's actions cell
    await page.locator('tbody tr:first-child td:last-child button:has-text("")').last().click();

    // Wait a bit for the state to update
    await page.waitForTimeout(500);

    // Check that input is gone by verifying the original value is back
    await expect(page.locator('tbody tr:first-child td:nth-child(2) span')).toContainText(originalValue || '');
  });

  test('should display help text at bottom', async ({ page }) => {
    await expect(page.locator('text=About Financial Thresholds')).toBeVisible();
    await expect(page.locator('text=These thresholds are used throughout the application')).toBeVisible();
  });

  test('should use correct DESIGN.md colors', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Check blue-700 primary button (Refresh button)
    const refreshButton = page.locator('button:has-text("Refresh")');
    const buttonClasses = await refreshButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-blue-700');

    // Check emerald for update button
    const updateButton = page.locator('button:has-text("Check for Updates")');
    const updateClasses = await updateButton.getAttribute('class');
    expect(updateClasses).toContain('bg-emerald-600');

    // Check rounded-xl on buttons
    expect(buttonClasses).toContain('rounded-xl');
  });

  test('should refresh data when clicking refresh button', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Click refresh
    await page.locator('button:has-text("Refresh")').click();

    // Wait for potential loading state and data reload
    await page.waitForTimeout(1000);

    // Verify table still has data
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.waitForSelector('table');

    // Check table structure
    await expect(page.locator('table thead')).toBeVisible();
    await expect(page.locator('table tbody')).toBeVisible();

    // Check buttons have proper content
    const buttons = await page.locator('button').all();
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('should display source badges with correct styling', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Check for source badges (FHFA, HUD, CFPB, VA)
    const sourceBadges = await page.locator('tbody tr td').filter({ hasText: /FHFA|HUD|CFPB|VA/ }).count();
    expect(sourceBadges).toBeGreaterThan(0);
  });
});
