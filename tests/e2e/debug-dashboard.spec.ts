import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Debug: Check dashboard content', async ({ page }) => {
  // Login with admin
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });

  // Take screenshot
  await page.screenshot({ path: 'test-results/dashboard-screenshot.png', fullPage: true });

  // Log all buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const text = await buttons[i].textContent();
    console.log(`Button ${i + 1}: "${text}"`);
  }

  // Log all links
  const links = await page.locator('a').all();
  console.log(`\nFound ${links.length} links`);
  for (let i = 0; i < Math.min(links.length, 10); i++) {
    const text = await links[i].textContent();
    console.log(`Link ${i + 1}: "${text}"`);
  }

  // Check for content area cards
  const cards = await page.locator('[class*="card"], [class*="Card"]').all();
  console.log(`\nFound ${cards.length} cards`);

  // Get page HTML
  const html = await page.content();
  console.log(`\nPage HTML length: ${html.length} characters`);
  console.log('Looking for "Ethics" in HTML:', html.includes('Ethics'));
  console.log('Looking for "Start" in HTML:', html.includes('Start'));
});
