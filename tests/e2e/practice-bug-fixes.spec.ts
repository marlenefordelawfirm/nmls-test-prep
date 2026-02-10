import { test, expect } from '@playwright/test';

test.describe('Practice Test Bug Fixes', () => {
  test.setTimeout(60000);

  test('Step 1: Fix corrupted correctAnswer values in database', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✅ Logged in as admin');

    // Call the fix endpoint via page navigation (avoids request context issues)
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/fix-correct-answers', { method: 'POST' });
      return res.json();
    });
    console.log('📦 Fix response:', JSON.stringify(response, null, 2));

    expect(response.success).toBe(true);
    console.log(`✅ Fixed ${response.fixed} corrupted correctAnswer values`);
    if (response.examples) {
      console.log('   Examples:', response.examples);
    }
  });

  test('Step 2: Take quiz and verify grading is correct', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✅ Logged in');

    // Navigate to practice
    await page.goto('http://localhost:3000/practice');
    await page.waitForSelector('text=Start Practice', { timeout: 5000 });
    await page.locator('text=Start Practice').first().click();
    await page.waitForURL(/practice\//, { timeout: 10000 });
    console.log('✅ Quiz started');

    // Answer all questions by selecting option A for each
    let questionNum = 1;
    while (true) {
      // Wait for question to load
      await page.waitForSelector('input[type="radio"]', { timeout: 5000 });

      // Select option A
      await page.locator('input[type="radio"][value="A"]').click();
      console.log(`✅ Question ${questionNum}: Selected A`);

      // Check if Submit button is visible (last question)
      const submitVisible = await page.locator('button:has-text("Submit Test")').isVisible();
      if (submitVisible) {
        // Handle confirmation dialog for partial answers
        page.once('dialog', async dialog => {
          console.log(`   Dialog: ${dialog.message()}`);
          await dialog.accept();
        });

        await page.locator('button:has-text("Submit Test")').click();
        console.log('✅ Submitted test');
        break;
      }

      // Click Next
      await page.locator('button:has-text("Next Question")').click();
      await page.waitForTimeout(300);
      questionNum++;
    }

    // Wait for results page
    await page.waitForURL(/results/, { timeout: 15000 });
    console.log('✅ Results page loaded');

    // Get the score
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    console.log(`📊 Score: ${scoreText}`);

    // Verify score is NOT 0% (since we answered all questions with A, some should be correct)
    const scoreNum = parseInt(scoreText || '0');
    console.log(`📊 Parsed score: ${scoreNum}%`);

    // The score should be > 0 since at least some questions have A as the correct answer
    expect(scoreNum).toBeGreaterThan(0);
    console.log('✅ GRADING IS WORKING - Score is greater than 0%');
  });

  test('Step 3: Verify review page works', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✅ Logged in');

    // Start and complete a quick quiz
    await page.goto('http://localhost:3000/practice');
    await page.waitForSelector('text=Start Practice', { timeout: 5000 });
    await page.locator('text=Start Practice').first().click();
    await page.waitForURL(/practice\//, { timeout: 10000 });

    // Answer all questions
    while (true) {
      await page.waitForSelector('input[type="radio"]', { timeout: 5000 });
      await page.locator('input[type="radio"][value="A"]').click();

      const submitVisible = await page.locator('button:has-text("Submit Test")').isVisible();
      if (submitVisible) {
        page.once('dialog', async dialog => await dialog.accept());
        await page.locator('button:has-text("Submit Test")').click();
        break;
      }
      await page.locator('button:has-text("Next Question")').click();
      await page.waitForTimeout(300);
    }

    await page.waitForURL(/results/, { timeout: 15000 });
    console.log('✅ Quiz completed, on results page');

    // Click Review Answers
    await page.locator('button:has-text("Review Answers")').click();
    await page.waitForURL(/review/, { timeout: 10000 });
    console.log('✅ Review page loaded');

    // Verify review page elements
    await expect(page.locator('h1:has-text("Review Your Answers")')).toBeVisible();
    console.log('✅ Header visible');

    // Verify filter buttons (use getByRole for exact matching)
    await expect(page.getByRole('button', { name: /^All/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Correct/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Incorrect/ })).toBeVisible();
    console.log('✅ Filter buttons visible');

    // Verify questions are displayed
    const questionCount = await page.locator('text=/Question \\d+/').count();
    expect(questionCount).toBeGreaterThan(0);
    console.log(`✅ ${questionCount} questions displayed`);

    // Verify correct answer shows as "A", "B", "C", or "D" (NOT "optionA")
    const correctAnswerElements = page.locator('text=/Correct Answer:/');
    const firstCorrectAnswer = await correctAnswerElements.first().locator('..').textContent();
    console.log(`📋 First correct answer display: "${firstCorrectAnswer}"`);
    expect(firstCorrectAnswer).not.toContain('option');
    console.log('✅ Correct answers display properly (no "optionX" format)');

    // Test filter buttons
    await page.getByRole('button', { name: /^Correct/ }).click();
    await page.waitForTimeout(500);
    const correctCount = await page.locator('text=/Question \\d+/').count();
    console.log(`✅ Correct filter: ${correctCount} questions`);

    await page.getByRole('button', { name: /^Incorrect/ }).click();
    await page.waitForTimeout(500);
    const incorrectCount = await page.locator('text=/Question \\d+/').count();
    console.log(`✅ Incorrect filter: ${incorrectCount} questions`);

    await page.getByRole('button', { name: /^All/ }).click();
    await page.waitForTimeout(500);
    console.log('✅ All filter works');

    // Verify Back to Results works
    await page.locator('button:has-text("Back to Results")').first().click();
    await page.waitForURL(/results/, { timeout: 5000 });
    console.log('✅ Back to Results navigation works');

    console.log('\n🎉 REVIEW PAGE TEST PASSED!');
  });

  test('Step 4: Verify Study Mode toggle works', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✅ Logged in');

    // Navigate to practice and start a test
    await page.goto('http://localhost:3000/practice');
    await page.waitForSelector('text=Start Practice', { timeout: 5000 });
    await page.locator('text=Start Practice').first().click();
    await page.waitForURL(/practice\//, { timeout: 10000 });
    console.log('✅ Quiz started');

    // Verify Study Mode toggle exists and is OFF by default
    const studyModeToggle = page.locator('text=Study Mode').first();
    await expect(studyModeToggle).toBeVisible();
    console.log('✅ Study Mode toggle visible');

    // Enable Study Mode
    await studyModeToggle.click();
    console.log('✅ Study Mode enabled');

    // Wait for radio buttons to load
    await page.waitForSelector('input[type="radio"]', { timeout: 5000 });

    // Select an answer - it should lock and show feedback
    await page.locator('input[type="radio"][value="A"]').click();
    await page.waitForTimeout(500);

    // Verify feedback is shown (either "Correct!" or "Incorrect.")
    const feedbackVisible = await page.getByText(/^(Correct!|Incorrect\.)/).isVisible();
    expect(feedbackVisible).toBe(true);
    console.log('✅ Study Mode feedback shown after answer selection');

    // Verify the answer is locked (radio should be disabled)
    const radioDisabled = await page.locator('input[type="radio"][value="A"]').isDisabled();
    expect(radioDisabled).toBe(true);
    console.log('✅ Answer is locked after selection');

    // Move to next question
    await page.locator('button:has-text("Next Question")').click();
    await page.waitForTimeout(300);

    // Answer second question
    await page.waitForSelector('input[type="radio"]', { timeout: 5000 });
    await page.locator('input[type="radio"][value="B"]').click();
    await page.waitForTimeout(500);

    // Verify feedback shows for second question too
    const feedback2Visible = await page.getByText(/^(Correct!|Incorrect\.)/).isVisible();
    expect(feedback2Visible).toBe(true);
    console.log('✅ Study Mode feedback shown for second question');

    // Navigate back to question 1 and verify feedback persists
    await page.locator('button:has-text("Previous")').click();
    await page.waitForTimeout(500);

    const feedbackStillVisible = await page.getByText(/^(Correct!|Incorrect\.)/).isVisible();
    expect(feedbackStillVisible).toBe(true);
    console.log('✅ Feedback persists when navigating back');

    // Verify radio is still disabled on previous question
    const stillDisabled = await page.locator('input[type="radio"][value="A"]').isDisabled();
    expect(stillDisabled).toBe(true);
    console.log('✅ Answer still locked on previous question');

    // Disable Study Mode
    await studyModeToggle.click();
    console.log('✅ Study Mode disabled');

    // Navigate to an unanswered question (go forward past Q2)
    await page.locator('button:has-text("Next Question")').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Next Question")').click();
    await page.waitForTimeout(300);

    // Answer without study mode - no feedback should appear
    await page.waitForSelector('input[type="radio"]', { timeout: 5000 });
    await page.locator('input[type="radio"][value="C"]').click();
    await page.waitForTimeout(500);

    // Feedback should NOT appear when study mode is off
    const noFeedback = await page.getByText(/^(Correct!|Incorrect\.)/).isVisible();
    expect(noFeedback).toBe(false);
    console.log('✅ No feedback when Study Mode is off');

    // Radio should NOT be disabled
    const notDisabled = await page.locator('input[type="radio"][value="C"]').isDisabled();
    expect(notDisabled).toBe(false);
    console.log('✅ Answer not locked when Study Mode is off');

    console.log('\n🎉 STUDY MODE TEST PASSED!');
  });

  test('Step 5: Verify no CSP violations', async ({ page }) => {
    const cspErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Content Security Policy') && text.includes('blob:')) {
        cspErrors.push(text);
      }
      if (text.includes('Lockdown failed')) {
        cspErrors.push(text);
      }
    });

    // Login and navigate
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for Sentry to initialize
    console.log('✅ Dashboard loaded');

    await page.goto('http://localhost:3000/practice');
    await page.waitForTimeout(2000);
    console.log('✅ Practice page loaded');

    console.log(`📋 CSP errors found: ${cspErrors.length}`);
    if (cspErrors.length > 0) {
      cspErrors.forEach(e => console.log(`   ❌ ${e.substring(0, 100)}...`));
    } else {
      console.log('✅ No CSP/Sentry blob errors');
    }

    expect(cspErrors.length).toBe(0);
    console.log('\n🎉 CSP TEST PASSED!');
  });
});
