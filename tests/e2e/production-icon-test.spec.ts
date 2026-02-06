import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://nmls-test-prep-rfenajfmn-marlene-fordes-projects.vercel.app';

test.describe('Production Icon Verification', () => {
  test('production homepage has no emojis and renders SVG icons', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Check for SVG icons
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    console.log(`Production homepage: ${svgCount} SVG icons`);
    expect(svgCount).toBeGreaterThan(5);

    // Verify no emojis in page
    const bodyText = await page.locator('body').textContent();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = bodyText?.match(emojiRegex) || [];

    expect(emojis.length).toBe(0);
    console.log('✅ Production homepage: No emojis found');
  });

  test('production login page has no emojis and renders SVG icons', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/login`);

    // Check for SVG icons
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    console.log(`Production login: ${svgCount} SVG icons`);
    expect(svgCount).toBeGreaterThan(0);

    // Verify no emojis
    const bodyText = await page.locator('body').textContent();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = bodyText?.match(emojiRegex) || [];

    expect(emojis.length).toBe(0);
    console.log('✅ Production login: No emojis found');
  });

  test('production register page has no emojis and renders SVG icons', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/register`);

    // Check for SVG icons
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    console.log(`Production register: ${svgCount} SVG icons`);
    expect(svgCount).toBeGreaterThan(2);

    // Verify no emojis
    const bodyText = await page.locator('body').textContent();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = bodyText?.match(emojiRegex) || [];

    expect(emojis.length).toBe(0);
    console.log('✅ Production register: No emojis found');
  });

  test('production dashboard has no emojis when authenticated', async ({ page }) => {
    // Login first
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Check for SVG icons
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    console.log(`Production dashboard: ${svgCount} SVG icons`);
    expect(svgCount).toBeGreaterThan(5);

    // Verify no emojis
    const bodyText = await page.locator('body').textContent();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = bodyText?.match(emojiRegex) || [];

    expect(emojis.length).toBe(0);
    console.log('✅ Production dashboard: No emojis found');
  });
});
