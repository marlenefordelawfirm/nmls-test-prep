import { test, expect } from '@playwright/test';

test.describe('Phase 1: Authentication Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  };

  test('should complete register → login → dashboard flow', async ({ page }) => {
    // Step 1: Navigate to register page
    await page.goto('/register');
    await expect(page).toHaveURL('/register');

    // Step 2: Fill out registration form
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // Step 3: Submit registration
    await page.click('button[type="submit"]');

    // Step 4: Should auto-login and redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Step 5: Verify dashboard content
    await expect(page.locator('h1')).toContainText('Welcome');
    await expect(page.locator('h1')).toContainText(testUser.name);

    // Step 6: Verify all 5 content area cards are visible
    await expect(page.locator('text=Federal Mortgage-Related Laws')).toBeVisible();
    await expect(page.locator('text=General Mortgage Knowledge')).toBeVisible();
    await expect(page.locator('text=Mortgage Loan Origination')).toBeVisible();
    await expect(page.locator('text=Ethics')).toBeVisible();
    await expect(page.locator('text=Uniform State Content')).toBeVisible();

    // Step 7: Verify progress section exists
    await expect(page.locator('text=Overall Progress')).toBeVisible();
    await expect(page.locator('text=0% Complete').first()).toBeVisible();

    // Step 8: Verify quick stats are visible
    await expect(page.locator('text=Tests Taken')).toBeVisible();
    await expect(page.locator('text=Questions Answered')).toBeVisible();
    await expect(page.locator('text=Average Score')).toBeVisible();

    // Step 9: Verify user name or email in nav bar
    await expect(page.locator('nav').locator(`text=${testUser.name}`)).toBeVisible();
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register');

    // Try to submit with weak password
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.bg-red-50[role="alert"]')).toBeVisible();
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    // First registration
    const duplicateEmail = `duplicate-${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="name"]', 'First User');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Sign out
    await page.click('text=Sign out');

    // Try to register with same email
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Second User');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('.bg-red-50[role="alert"]')).toContainText('already exists');
  });

  test('should allow login after registration', async ({ page }) => {
    // Register a user
    const loginTestUser = {
      email: `login-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Login Test User'
    };

    await page.goto('/register');
    await page.fill('input[name="name"]', loginTestUser.name);
    await page.fill('input[name="email"]', loginTestUser.email);
    await page.fill('input[name="password"]', loginTestUser.password);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Sign out
    await page.click('text=Sign out');

    // Wait for sign out to complete
    await page.waitForURL('/login', { timeout: 10000 });

    // Login with same credentials
    await page.fill('input[type="email"]', loginTestUser.email);
    await page.fill('input[type="password"]', loginTestUser.password);

    // Submit and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);

    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.bg-red-50[role="alert"]')).toContainText('Invalid email or password');
  });

  test('should require authentication for dashboard', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
