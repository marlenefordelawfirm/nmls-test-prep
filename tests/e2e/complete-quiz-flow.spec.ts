import { test, expect } from '@playwright/test';

test.describe('Complete Quiz Flow with Admin Account', () => {
  test('admin can complete full quiz flow from login to results', async ({ page }) => {
    // Step 1: Login with admin account
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Welcome back')).toBeVisible();
    console.log('✅ Admin logged in successfully');

    // Step 2: Navigate to practice page
    await page.click('text=Start Practice >> nth=0');
    await page.waitForURL(/practice$/, { timeout: 5000 });
    await expect(page.locator('h1:has-text("Choose Your Practice Area")')).toBeVisible();
    console.log('✅ Practice page loaded');

    // Verify all 5 content areas are displayed
    const contentAreaCards = page.locator('article');
    const cardCount = await contentAreaCards.count();
    expect(cardCount).toBe(5);
    console.log(`✅ All ${cardCount} content areas displayed`);

    // Step 3: Select first content area (Federal Laws)
    await page.click('text=Start Practice >> nth=0');
    await page.waitForURL(/practice\/federal-laws/, { timeout: 10000 });
    console.log('✅ Quiz interface loaded');

    // Verify quiz interface elements
    await expect(page.locator('text=Question 1 of')).toBeVisible();
    await expect(page.locator('text=Federal')).toBeVisible(); // Content area name

    // Check for timer
    const timerLocator = page.locator('text=/\\d+:\\d{2}/');
    await expect(timerLocator).toBeVisible();
    console.log('✅ Quiz interface elements visible');

    // Check for radio buttons
    const radioButtons = page.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    expect(radioCount).toBeGreaterThanOrEqual(4); // At least 4 options (A, B, C, D)
    console.log(`✅ ${radioCount} answer options available`);

    // Step 4: Answer multiple questions
    const questionsToAnswer = Math.min(3, 10); // Answer first 3 questions or all if less

    for (let i = 0; i < questionsToAnswer; i++) {
      // Select first option (A)
      await page.click('input[type="radio"]  >> nth=0');

      // Check if answer is selected
      const selectedRadio = page.locator('input[type="radio"]:checked');
      await expect(selectedRadio).toBeVisible();

      console.log(`✅ Question ${i + 1} answered`);

      // Click next (or submit if last question)
      const isLastQuestion = await page.locator('button:has-text("Submit Test")').isVisible().catch(() => false);

      if (isLastQuestion) {
        await page.click('button:has-text("Submit Test")');
        console.log('✅ Clicked Submit Test button');
        break;
      } else {
        await page.click('button:has-text("Next Question")');
        // Wait for next question to load
        await page.waitForTimeout(500);
      }
    }

    // Step 5: Verify results page
    await page.waitForURL(/results/, { timeout: 15000 });
    console.log('✅ Navigated to results page');

    // Check for results elements
    await expect(page.locator('text=/\\d+%/')).toBeVisible(); // Score percentage
    await expect(page.locator('text=/\\d+\\/\\d+/')).toBeVisible(); // Correct answers (X/Y format)

    // Check for either success or improvement message
    const hasSuccessMessage = await page.locator('text=Section Mastered').isVisible().catch(() => false);
    const hasImprovementMessage = await page.locator('text=Keep Practicing').isVisible().catch(() => false);

    expect(hasSuccessMessage || hasImprovementMessage).toBe(true);
    console.log('✅ Results page displays score and feedback');

    // Check for action buttons
    await expect(page.locator('text=Continue to Next Section')).toBeVisible();
    await expect(page.locator('text=Review Answers')).toBeVisible();
    console.log('✅ Action buttons present on results page');

    // Step 6: Navigate back to practice
    await page.click('text=Continue to Next Section');
    await page.waitForURL(/practice$/, { timeout: 5000 });
    await expect(page.locator('h1:has-text("Choose Your Practice Area")')).toBeVisible();
    console.log('✅ Successfully returned to practice page');

    console.log('\n🎉 COMPLETE QUIZ FLOW TEST PASSED!');
  });

  test('quiz interface has working question navigator', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Navigate to quiz
    await page.goto('http://localhost:3000/practice');
    await page.click('text=Start Practice >> nth=0');
    await page.waitForURL(/practice\/federal-laws/);

    // Check question navigator exists
    await expect(page.locator('text=Question Navigator')).toBeVisible();

    // Count navigator buttons
    const navigatorButtons = page.locator('text=Question Navigator').locator('..').locator('button');
    const buttonCount = await navigatorButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    console.log(`✅ Question navigator with ${buttonCount} buttons present`);

    // Answer first question
    await page.click('input[type="radio"] >> nth=0');

    // Click on question 2 in navigator (if it exists)
    if (buttonCount >= 2) {
      const secondQuestionButton = navigatorButtons.nth(1);
      await secondQuestionButton.click();

      // Verify we're on question 2
      await expect(page.locator('text=Question 2 of')).toBeVisible();
      console.log('✅ Question navigator navigation works');
    }
  });

  test('quiz interface shows progress bar', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Navigate to quiz
    await page.goto('http://localhost:3000/practice');
    await page.click('text=Start Practice >> nth=0');
    await page.waitForURL(/practice\/federal-laws/);

    // Check for progress bar (it's rendered as a styled div)
    const progressBar = page.locator('div.bg-blue-700.transition-all');
    await expect(progressBar).toBeVisible();

    // Get progress bar width
    const progressWidth = await progressBar.evaluate(el => el.style.width);
    console.log(`✅ Progress bar visible with width: ${progressWidth}`);

    // Progress should be > 0% since we're on question 1
    expect(progressWidth).toBeTruthy();
  });
});
