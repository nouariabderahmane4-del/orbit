import { test, expect } from '@playwright/test';

// Make sure your local server (e.g., live-server or http-server) is running on port 8080!
const LOCAL_URL = 'http://localhost:8081';

test.describe('Orbit Solar System E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Go to the app before every test
    await page.goto(LOCAL_URL);
  });

  test('1. Canvas and Core UI should load without console errors', async ({ page }) => {
    // Listen for any angry red errors in the browser console
    page.on('pageerror', error => {
      expect(error.message).toBeNull(); // Fails the test if the app crashed
    });

    // Check if the Three.js canvas mounted
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check if the top bar buttons exist
    await expect(page.locator('#gamemode-btn')).toBeVisible();
    await expect(page.locator('#customize-btn')).toBeVisible();
  });

  test('2. Search functionality should find Earth and open HUD', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const infoPanel = page.locator('#info-panel');
    const planetName = page.locator('#planet-name');

    // Make sure panel is hidden initially
    await expect(infoPanel).not.toHaveClass(/active/);

    // Type 'Earth' and press Enter
    await searchInput.fill('Earth');
    await searchInput.press('Enter');

    // The panel should slide out and display Earth
    await expect(infoPanel).toHaveClass(/active/);
    await expect(planetName).toHaveText('Earth');

    // Check if the details populated (Gravity for Earth should be 9.8 m/s²)
    const gravity = page.locator('#planet-gravity');
    await expect(gravity).toContainText('9.8');
  });

  test('3. Spaceship Game Mode should toggle correctly', async ({ page }) => {
    const gamemodeBtn = page.locator('#gamemode-btn');
    const customizeBtn = page.locator('#customize-btn');

    // Enter Spaceship Mode
    await gamemodeBtn.click();

    // The button text should change, and customize button should hide
    await expect(gamemodeBtn).toHaveText('EXIT SPACESHIP');
    await expect(customizeBtn).toBeHidden();

    // Exit Spaceship Mode
    await gamemodeBtn.click();
    await expect(gamemodeBtn).toHaveText('ENTER SPACESHIP');
    await expect(customizeBtn).toBeVisible();
  });

  test('4. Spaceship Hangar Modal should open on click', async ({ page }) => {
    const customizeBtn = page.locator('#customize-btn');
    const shipModal = page.locator('#ship-modal');

    await customizeBtn.click();
    await expect(shipModal).toHaveClass(/open/);

    // Check if the three ships are rendered
    await expect(page.locator('.ship-card.rocket')).toBeVisible();
    await expect(page.locator('.ship-card.speeder')).toBeVisible();
    await expect(page.locator('.ship-card.ufo')).toBeVisible();
  });

});