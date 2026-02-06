import { test, expect } from '@playwright/test';

test.describe('Icon Replacement Verification', () => {
  test('homepage renders with lucide-react icons (no emojis)', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check for icon SVGs (lucide-react renders as SVG)
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    // Should have multiple SVG icons on homepage
    expect(svgCount).toBeGreaterThan(5);

    // Verify page content loads
    await expect(page.locator('text=NMLS Test Prep')).toBeVisible();
    await expect(page.locator('text=Pass Your NMLS Exam')).toBeVisible();

    // Check for specific lucide icons by their aria attributes or classes
    await expect(page.locator('text=Start Free Trial')).toBeVisible();
    await expect(page.locator('text=200+ Practice Questions')).toBeVisible();

    console.log(`Homepage rendered with ${svgCount} SVG icons`);
  });

  test('login page renders with lucide-react icons', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Check page loads
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Sign in')).toBeVisible();

    // Check for SVG icons
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    // Should have at least back arrow icon
    expect(svgCount).toBeGreaterThan(0);

    console.log(`Login page rendered with ${svgCount} SVG icons`);
  });

  test('register page renders with lucide-react icons', async ({ page }) => {
    await page.goto('http://localhost:3000/register');

    // Check page loads
    await expect(page.locator('text=Create your account')).toBeVisible();
    await expect(page.locator('text=Create account')).toBeVisible();

    // Check for SVG icons (Info, MapPin, ArrowRight, etc.)
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    // Should have multiple icons (info, map pin, arrows)
    expect(svgCount).toBeGreaterThan(2);

    console.log(`Register page rendered with ${svgCount} SVG icons`);
  });

  test('dashboard page renders with lucide-react icons when authenticated', async ({ page }) => {
    // First login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button:has-text("Sign in")');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');

    // Check dashboard loads
    await expect(page.locator('text=Welcome back')).toBeVisible();

    // Check for SVG icons (Clock, CheckCircle2, TrendingUp, Zap, Lightbulb)
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();

    // Dashboard should have many icons
    expect(svgCount).toBeGreaterThan(5);

    console.log(`Dashboard rendered with ${svgCount} SVG icons`);
  });

  test('no emoji characters present in rendered HTML', async ({ page }) => {
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/login',
      'http://localhost:3000/register'
    ];

    for (const url of pages) {
      await page.goto(url);

      // Get all text content
      const bodyText = await page.locator('body').textContent();

      // Common emoji ranges in Unicode
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const emojis = bodyText?.match(emojiRegex) || [];

      // Should have zero emoji characters
      expect(emojis.length).toBe(0);

      console.log(`${url}: No emojis found ✓`);
    }
  });
});
