import { test, expect } from '@playwright/test';

test.describe('Practice Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('displays all 5 content areas from database', async ({ page }) => {
    // Navigate to practice page
    await page.goto('http://localhost:3000/practice');

    // Check page header
    await expect(page.locator('h1')).toContainText('Choose Your Practice Area');

    // Check that all 5 content areas are displayed
    const contentAreaCards = page.locator('article');
    const cardCount = await contentAreaCards.count();
    expect(cardCount).toBe(5);

    // Verify content area names are present
    await expect(page.locator('text=Federal Mortgage')).toBeVisible();
    await expect(page.locator('text=General Mortgage Knowledge')).toBeVisible();
    await expect(page.locator('text=Mortgage Loan Origination')).toBeVisible();
    await expect(page.locator('text=Ethics')).toBeVisible();
    await expect(page.locator('text=Uniform State Content')).toBeVisible();

    console.log('✅ All 5 content areas displayed');
  });

  test('displays question and sub-topic counts', async ({ page }) => {
    await page.goto('http://localhost:3000/practice');

    // Check that each card has question and sub-topic counts
    const firstCard = page.locator('article').first();

    await expect(firstCard.locator('text=Questions')).toBeVisible();
    await expect(firstCard.locator('text=Sub-Topics')).toBeVisible();

    // Verify there are numeric values displayed
    const questionCount = await firstCard.locator('text=Questions').locator('..').locator('p.text-lg').textContent();
    expect(parseInt(questionCount || '0')).toBeGreaterThan(0);

    console.log('✅ Question and sub-topic counts displayed');
  });

  test('displays percentage of exam for each area', async ({ page }) => {
    await page.goto('http://localhost:3000/practice');

    // Check that percentages are displayed
    await expect(page.locator('text=% of Exam').first()).toBeVisible();

    // Verify Federal Laws shows 23%
    const federalLawsCard = page.locator('article:has-text("Federal Mortgage")');
    await expect(federalLawsCard.locator('text=23% of Exam')).toBeVisible();

    console.log('✅ Exam percentages displayed correctly');
  });

  test('each content area has a Start Practice button', async ({ page }) => {
    await page.goto('http://localhost:3000/practice');

    // Check all cards have Start Practice button
    const startButtons = page.locator('text=Start Practice');
    const buttonCount = await startButtons.count();
    expect(buttonCount).toBe(5);

    console.log('✅ All Start Practice buttons present');
  });

  test('can navigate to practice page from dashboard', async ({ page }) => {
    // Should be on dashboard after login
    await expect(page).toHaveURL(/dashboard/);

    // Click Start Practice button
    await page.click('text=Start Practice >> nth=0');

    // Should navigate to practice page
    await expect(page).toHaveURL(/practice/);
    await expect(page.locator('h1')).toContainText('Choose Your Practice Area');

    console.log('✅ Navigation from dashboard to practice works');
  });

  test('content areas display without emojis (icons only)', async ({ page }) => {
    await page.goto('http://localhost:3000/practice');

    // Check for SVG icons (lucide-react)
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();
    expect(svgCount).toBeGreaterThan(5); // Should have multiple icons

    // Verify no emojis in page content
    const bodyText = await page.locator('body').textContent();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = bodyText?.match(emojiRegex) || [];
    expect(emojis.length).toBe(0);

    console.log('✅ Practice page uses icons, no emojis');
  });
});
