import { test, expect } from '@playwright/test';

// Use production URL or local dev
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Production Quiz Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login with admin account
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test('Regular Practice Quiz - 20 Questions', async ({ page }) => {
    console.log('Testing regular 20-question practice quiz...');

    // Navigate to practice tests page
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('a:has-text("Practice Tests")');
    await page.waitForLoadState('networkidle');

    // Click on a content area (e.g., Ethics)
    await page.click('text=Ethics');
    await page.waitForLoadState('networkidle');

    // Verify we're on the practice page
    await expect(page).toHaveURL(/\/practice\//);

    // Start the practice test
    await page.click('button:has-text("Start Practice")');
    await page.waitForLoadState('networkidle');

    // Verify quiz interface loaded
    await expect(page.locator('text=Question 1')).toBeVisible({ timeout: 10000 });

    // Count total questions available
    const questionText = await page.textContent('text=/Question \\d+ of \\d+/');
    console.log(`Quiz started: ${questionText}`);

    // Answer all 20 questions
    for (let i = 0; i < 20; i++) {
      // Wait for question to load
      await expect(page.locator('input[type="radio"]').first()).toBeVisible({ timeout: 5000 });

      // Select first option
      await page.click('input[type="radio"]', { position: { x: 5, y: 5 } });

      // Click Next or Submit
      if (i < 19) {
        await page.click('button:has-text("Next")');
      } else {
        await page.click('button:has-text("Submit")');
      }

      await page.waitForTimeout(500);
    }

    // Verify results page
    await expect(page.locator('text=/score|result/i')).toBeVisible({ timeout: 10000 });
    console.log('✅ Regular 20-question quiz completed successfully');

    // Take screenshot of results
    await page.screenshot({ path: 'test-results/regular-quiz-results.png', fullPage: true });
  });

  test('Full Exam - 120+ Questions', async ({ page }) => {
    console.log('Testing full 120-question exam...');

    // Navigate to exam section
    await page.goto(`${BASE_URL}/exam`);
    await page.waitForLoadState('networkidle');

    // Start the full exam
    await page.click('button:has-text("Start")');
    await page.waitForLoadState('networkidle');

    // Verify exam interface loaded
    await expect(page.locator('text=Question 1')).toBeVisible({ timeout: 10000 });

    // Check if this is a full exam (should have 120+ questions)
    const questionText = await page.textContent('text=/Question \\d+ of \\d+/');
    console.log(`Exam started: ${questionText}`);

    const match = questionText?.match(/of (\d+)/);
    const totalQuestions = match ? parseInt(match[1]) : 0;

    expect(totalQuestions).toBeGreaterThanOrEqual(120);
    console.log(`✅ Full exam has ${totalQuestions} questions`);

    // Answer first 10 questions as a sample
    for (let i = 0; i < 10; i++) {
      // Wait for question to load
      await expect(page.locator('input[type="radio"]').first()).toBeVisible({ timeout: 5000 });

      // Select first option
      await page.click('input[type="radio"]', { position: { x: 5, y: 5 } });

      // Click Next
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);
    }

    console.log('✅ Full exam interface working (tested first 10 questions)');

    // Take screenshot
    await page.screenshot({ path: 'test-results/full-exam-interface.png', fullPage: true });

    // Note: Not completing all 120 questions to save time
    console.log('✅ Full exam test complete (sampled 10/120+ questions)');
  });

  test('Quiz Question Quality Check', async ({ page }) => {
    console.log('Testing question quality...');

    // Navigate to practice tests page then to ethics
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('a:has-text("Practice Tests")');
    await page.waitForLoadState('networkidle');
    await page.click('text=Ethics');
    await page.waitForLoadState('networkidle');

    // Start the practice test
    await page.click('button:has-text("Start Practice")');
    await page.waitForLoadState('networkidle');

    // Verify question structure
    await expect(page.locator('text=Question 1')).toBeVisible({ timeout: 10000 });

    // Check for 4 options
    const radioButtons = page.locator('input[type="radio"]');
    const count = await radioButtons.count();
    expect(count).toBe(4);
    console.log('✅ Question has 4 options');

    // Verify option labels exist
    await expect(page.locator('text=A)')).toBeVisible();
    await expect(page.locator('text=B)')).toBeVisible();
    await expect(page.locator('text=C)')).toBeVisible();
    await expect(page.locator('text=D)')).toBeVisible();
    console.log('✅ All 4 options labeled correctly');

    // Take screenshot
    await page.screenshot({ path: 'test-results/question-quality-check.png', fullPage: true });
  });

  test('Quiz Navigation', async ({ page }) => {
    console.log('Testing quiz navigation...');

    // Navigate to practice tests page then to ethics
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('a:has-text("Practice Tests")');
    await page.waitForLoadState('networkidle');
    await page.click('text=Ethics');
    await page.waitForLoadState('networkidle');

    // Start the practice test
    await page.click('button:has-text("Start Practice")');
    await page.waitForLoadState('networkidle');

    // Answer first question
    await page.click('input[type="radio"]', { position: { x: 5, y: 5 } });
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Verify we're on question 2
    await expect(page.locator('text=Question 2')).toBeVisible();
    console.log('✅ Navigation to next question works');

    // Check if Previous button exists (if implemented)
    const prevButton = page.locator('button:has-text("Previous")');
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Question 1')).toBeVisible();
      console.log('✅ Navigation to previous question works');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/quiz-navigation.png', fullPage: true });
  });
});
