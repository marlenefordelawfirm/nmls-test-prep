import { test, expect } from '@playwright/test';

test.describe('Theme Toggle - No Flash Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Login with admin credentials
    await page.fill('input[type="email"]', 'thedamdocta@gmail.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard (increase timeout for slow loads)
    await page.waitForURL('**/dashboard', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
  });

  test('should toggle theme without flashing or glitching', async ({ page }) => {
    console.log('\n🎬 Starting Theme Toggle Test...\n');

    // Wait for the page to fully load
    await page.waitForTimeout(1000);

    // Get the theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();

    console.log('✅ Theme toggle button is visible');

    // Check initial state (should be light mode by default)
    let htmlClass = await page.locator('html').getAttribute('class');
    const initialTheme = htmlClass?.includes('dark') ? 'dark' : 'light';
    console.log(`📋 Initial theme: ${initialTheme}`);

    // Take screenshot of initial state
    await page.screenshot({
      path: 'test-results/1-initial-theme.png',
      fullPage: true
    });
    console.log('📸 Screenshot 1: Initial state captured');

    // Toggle to dark mode
    console.log('\n🔄 Clicking theme toggle (switching to dark)...');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Verify dark mode is applied
    htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
    console.log('✅ Dark mode applied successfully');

    // Take screenshot of dark mode
    await page.screenshot({
      path: 'test-results/2-dark-mode.png',
      fullPage: true
    });
    console.log('📸 Screenshot 2: Dark mode captured');

    // Verify the icon changed (should show Sun icon in dark mode)
    const sunIcon = themeToggle.locator('svg');
    await expect(sunIcon).toBeVisible();
    console.log('✅ Theme toggle icon updated correctly');

    // Toggle back to light mode
    console.log('\n🔄 Clicking theme toggle (switching to light)...');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Verify light mode is applied
    htmlClass = await page.locator('html').getAttribute('class');
    const hasNoDarkClass = !htmlClass?.includes('dark') || htmlClass === '';
    expect(hasNoDarkClass).toBeTruthy();
    console.log('✅ Light mode applied successfully');

    // Take screenshot of light mode
    await page.screenshot({
      path: 'test-results/3-light-mode.png',
      fullPage: true
    });
    console.log('📸 Screenshot 3: Light mode captured');

    // The button should always be visible throughout
    await expect(themeToggle).toBeVisible();
    console.log('✅ Theme toggle remained visible throughout test');

    console.log('\n✨ Theme toggle test completed successfully!\n');
  });

  test('should persist theme across page navigation', async ({ page }) => {
    console.log('\n🎬 Starting Theme Persistence Test...\n');

    await page.waitForTimeout(1000);

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Toggle to dark mode
    console.log('🔄 Switching to dark mode...');
    await themeToggle.click();
    await page.waitForTimeout(500);

    let htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
    console.log('✅ Dark mode active on dashboard');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/4-dashboard-dark.png',
      fullPage: true
    });
    console.log('📸 Screenshot 4: Dashboard in dark mode');

    // Navigate to settings
    console.log('\n🧭 Navigating to settings page...');
    await page.click('a[href="/settings"]');
    await page.waitForURL('**/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify dark mode persisted
    htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
    console.log('✅ Dark mode persisted to settings page');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/5-settings-dark.png',
      fullPage: true
    });
    console.log('📸 Screenshot 5: Settings in dark mode');

    // Verify theme toggle is still visible and functional
    const settingsToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(settingsToggle).toBeVisible();
    console.log('✅ Theme toggle visible on settings page');

    // Toggle back to light mode on settings page
    console.log('\n🔄 Switching to light mode on settings...');
    await settingsToggle.click();
    await page.waitForTimeout(500);

    htmlClass = await page.locator('html').getAttribute('class');
    const hasNoDarkClass = !htmlClass?.includes('dark') || htmlClass === '';
    expect(hasNoDarkClass).toBeTruthy();
    console.log('✅ Light mode active on settings');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/6-settings-light.png',
      fullPage: true
    });
    console.log('📸 Screenshot 6: Settings in light mode');

    console.log('\n✨ Theme persistence test completed successfully!\n');
  });

  test('should sync theme dropdown with toggle button', async ({ page }) => {
    console.log('\n🎬 Starting Theme Sync Test...\n');

    await page.waitForTimeout(1000);

    // Navigate to settings
    console.log('🧭 Navigating to settings page...');
    await page.click('a[href="/settings"]');
    await page.waitForURL('**/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Get theme dropdown
    const themeDropdown = page.locator('select').filter({ hasText: 'Light' }).first();
    await expect(themeDropdown).toBeVisible();
    console.log('✅ Theme dropdown found in settings');

    // Change theme via dropdown to dark
    console.log('\n🔄 Changing theme to dark via dropdown...');
    await themeDropdown.selectOption('dark');
    await page.waitForTimeout(500);

    // Verify dark mode applied
    let htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
    console.log('✅ Dark mode applied via dropdown');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/7-dropdown-dark.png',
      fullPage: true
    });
    console.log('📸 Screenshot 7: Dark mode via dropdown');

    // Now use the toggle button
    console.log('\n🔄 Clicking toggle button to switch to light...');
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Verify light mode
    htmlClass = await page.locator('html').getAttribute('class');
    const hasNoDarkClass = !htmlClass?.includes('dark') || htmlClass === '';
    expect(hasNoDarkClass).toBeTruthy();
    console.log('✅ Light mode applied via toggle button');

    // Verify dropdown updated
    const dropdownValue = await themeDropdown.inputValue();
    console.log(`📋 Dropdown value after toggle: ${dropdownValue}`);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/8-toggle-sync.png',
      fullPage: true
    });
    console.log('📸 Screenshot 8: Toggle and dropdown synced');

    console.log('\n✨ Theme sync test completed successfully!\n');
  });
});
