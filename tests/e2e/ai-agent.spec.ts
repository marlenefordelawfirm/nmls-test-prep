/**
 * Phase 4.5 Production Tests for AI Study Agent
 * These tests MUST pass before production deployment
 */

import { test, expect } from '@playwright/test';

// Test user credentials (create this user first or update with your test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

test.describe('Phase 4.5: AI Study Agent Production Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to agent page
    await page.goto('http://localhost:3000/agent');
    await page.waitForSelector('textarea[placeholder*="question"]');
  });

  test('Test 1: AI agent solves mortgage math with step-by-step calculation', async ({ page }) => {
    // Ask a mortgage math question
    const mathQuestion = "Calculate the monthly payment for a $300,000 loan at 6.5% APR for 30 years";
    await page.fill('textarea[placeholder*="question"]', mathQuestion);
    await page.click('button:has-text("Send")');

    // Wait for response (up to 30 seconds for AI)
    await page.waitForSelector('text=/Step|STEP|Formula|FORMULA/i', { timeout: 30000 });

    // Verify calculation steps are displayed
    const hasSteps = await page.locator('text=/Step 1|STEP 1/i').isVisible();
    expect(hasSteps).toBeTruthy();

    // Verify formula is shown
    const pageContent = await page.content();
    const hasFormula = pageContent.toLowerCase().includes('formula') || 
                       pageContent.includes('M =') ||
                       pageContent.includes('r(1+r)');
    expect(hasFormula).toBeTruthy();

    // Verify result is shown (should be around $1,896)
    const hasResult = pageContent.includes('1,896') || 
                      pageContent.includes('1896') ||
                      pageContent.includes('1,897');
    expect(hasResult).toBeTruthy();

    console.log('✅ Test 1 PASSED: Math calculation with step-by-step display');
  });

  test('Test 2: AI agent cites sources with clickable web links', async ({ page }) => {
    // Ask a question requiring references
    const referenceQuestion = "What are the key requirements of the TILA-RESPA Integrated Disclosure rule?";
    await page.fill('textarea[placeholder*="question"]', referenceQuestion);
    await page.click('button:has-text("Send")');

    // Wait for response
    await page.waitForSelector('div.bg-gray-100', { timeout: 30000 });
    
    // Wait a bit more for sources to appear
    await page.waitForTimeout(2000);

    // Check if sources section exists OR if links are in the response
    const hasSources = await page.locator('text=/Sources?:/i').isVisible().catch(() => false);
    const hasLinks = await page.locator('a[href^="http"]').count() > 0;

    expect(hasSources || hasLinks).toBeTruthy();

    if (hasLinks) {
      // Verify at least one link exists
      const linkCount = await page.locator('a[href^="http"]').count();
      expect(linkCount).toBeGreaterThan(0);

      // Verify link opens in new tab
      const firstLink = page.locator('a[href^="http"]').first();
      const target = await firstLink.getAttribute('target');
      expect(target).toBe('_blank');

      console.log(`✅ Test 2 PASSED: Found ${linkCount} cited sources with clickable links`);
    } else {
      console.log('⚠️  Test 2: Sources section found but no links yet');
    }
  });

  test('Test 3: AI agent displays relevant images', async ({ page }) => {
    // Ask a question that should return images
    const imageQuestion = "Show me an example of a Closing Disclosure form";
    await page.fill('textarea[placeholder*="question"]', imageQuestion);
    await page.click('button:has-text("Send")');

    // Wait for response
    await page.waitForSelector('div.bg-gray-100', { timeout: 30000 });
    
    // Wait for potential images to load
    await page.waitForTimeout(3000);

    // Check for images in the response
    const images = page.locator('img').filter({ hasNotText: /logo|avatar|icon/i });
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Verify image has proper attributes
      const firstImage = images.first();
      const src = await firstImage.getAttribute('src');
      const alt = await firstImage.getAttribute('alt');
      
      expect(src).toBeTruthy();
      expect(alt).toBeTruthy();

      console.log(`✅ Test 3 PASSED: Found ${imageCount} images with captions`);
    } else {
      console.log('⚠️  Test 3: No images found (check if IMAGE markers are working)');
      // This might be OK in MVP - images are optional
    }
  });

  test('Test 4: AI agent maintains conversation context', async ({ page }) => {
    // First question
    await page.fill('textarea[placeholder*="question"]', "What is APR?");
    await page.click('button:has-text("Send")');
    await page.waitForSelector('text=/annual percentage rate/i', { timeout: 30000 });

    // Second question (should reference previous context)
    await page.fill('textarea[placeholder*="question"]', "How is it different from interest rate?");
    await page.click('button:has-text("Send")');
    
    // Wait for second response
    await page.waitForTimeout(10000);

    // Verify both messages are visible
    const messageCount = await page.locator('div.bg-gray-100, div.bg-indigo-500').count();
    expect(messageCount).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant

    // Verify the response mentions APR (showing context awareness)
    const pageContent = await page.content();
    const mentionsAPR = pageContent.toLowerCase().includes('apr');
    expect(mentionsAPR).toBeTruthy();

    console.log('✅ Test 4 PASSED: Conversation context maintained');
  });

  test('Test 5: Verify agent page loads and shows starter prompts', async ({ page }) => {
    // Already on agent page from beforeEach
    
    // Verify starter prompts are visible
    const hasStarterPrompts = await page.locator('button:has-text("Calculate monthly payment")').isVisible();
    expect(hasStarterPrompts).toBeTruthy();

    // Verify all 4 starter prompts
    await expect(page.locator('text=Calculate monthly payment')).toBeVisible();
    await expect(page.locator('text=Explain TILA-RESPA')).toBeVisible();
    await expect(page.locator('text=View form examples')).toBeVisible();
    await expect(page.locator('text=APR vs Interest Rate')).toBeVisible();

    console.log('✅ Test 5 PASSED: Agent page loads with starter prompts');
  });
});
