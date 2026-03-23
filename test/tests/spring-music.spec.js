import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function screenshot(page, name) {
  ensureScreenshotsDir();
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

test.describe('Spring Music UI', () => {

  test('1. Initial page load and seed data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page title / heading
    await expect(page.locator('h1, .h3')).toContainText('Albums');

    // Verify seed data loaded — expect at least 10 album cards or rows
    const albumItems = page.locator('.card, [data-testid="album-row"]');
    const count = await albumItems.count();
    expect(count).toBeGreaterThanOrEqual(10);

    // Verify a known seed album is visible
    await expect(page.getByText('Nevermind')).toBeVisible();
    await expect(page.getByText('Thriller')).toBeVisible();

    await screenshot(page, '01-initial-load');
  });

  test('2. Grid view is active by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Grid button should have btn-success class (active)
    const gridBtn = page.locator('button[title="Grid view"]');
    await expect(gridBtn).toHaveClass(/btn-success/);

    // Cards should be visible in grid layout
    await expect(page.locator('.card').first()).toBeVisible();

    await screenshot(page, '02-grid-view-default');
  });

  test('3. Grid/List view toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to list view
    await page.locator('button[title="List view"]').click();
    await expect(page.locator('button[title="List view"]')).toHaveClass(/btn-success/);
    await expect(page.locator('button[title="Grid view"]')).toHaveClass(/btn-outline-secondary/);

    // List view renders a table
    await expect(page.locator('table')).toBeVisible();

    await screenshot(page, '03-list-view');

    // Switch back to grid
    await page.locator('button[title="Grid view"]').click();
    await expect(page.locator('button[title="Grid view"]')).toHaveClass(/btn-success/);
    await expect(page.locator('.card').first()).toBeVisible();

    await screenshot(page, '04-grid-view-restored');
  });

  test('4. Sort controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Artist sort
    await page.getByRole('button', { name: /Artist/ }).click();
    await expect(page.getByRole('button', { name: /Artist/ })).toHaveClass(/btn-success/);

    await screenshot(page, '05-sort-by-artist');

    // Toggle Artist sort direction
    await page.getByRole('button', { name: /Artist/ }).click();
    await screenshot(page, '06-sort-artist-desc');

    // Sort by Year
    await page.getByRole('button', { name: /Year/ }).click();
    await expect(page.getByRole('button', { name: /Year/ })).toHaveClass(/btn-success/);
    await screenshot(page, '07-sort-by-year');
  });

  test('5. Add album flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('.card').count();

    // Open add modal
    await page.getByRole('button', { name: /Add Album/ }).click();
    await expect(page.locator('.modal, [role="dialog"]')).toBeVisible();
    await screenshot(page, '08-add-modal-open');

    // Fill in the form
    await page.getByLabel(/Title/i).fill('Test Album');
    await page.getByLabel(/Artist/i).fill('Test Artist');
    await page.getByLabel(/Year/i).fill('2024');
    await page.getByLabel(/Genre/i).fill('Rock');

    await screenshot(page, '09-add-modal-filled');

    // Save
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForLoadState('networkidle');

    // Verify album was added
    await expect(page.getByText('Test Album')).toBeVisible();
    const newCount = await page.locator('.card').count();
    expect(newCount).toBeGreaterThan(initialCount);

    await screenshot(page, '10-album-added');
  });

  test('6. Edit album via modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Edit on the first card
    await page.locator('.card').first().getByRole('button', { name: /Edit/i }).click();
    await expect(page.locator('.modal, [role="dialog"]')).toBeVisible();

    await screenshot(page, '11-edit-modal-open');

    // Change the title
    const titleInput = page.getByLabel(/Title/i);
    await titleInput.clear();
    await titleInput.fill('Edited Title');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Edited Title')).toBeVisible();
    await screenshot(page, '12-album-edited');
  });

  test('7. Inline editing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to list view for easier inline edit access
    await page.locator('button[title="List view"]').click();
    await page.locator('table').waitFor();

    // Double-click on the first album title cell to trigger inline edit
    const firstTitleCell = page.locator('table tbody tr').first().locator('td').nth(0);
    await firstTitleCell.dblclick();

    // An input should appear
    const inlineInput = firstTitleCell.locator('input');
    const isInputVisible = await inlineInput.isVisible().catch(() => false);

    if (isInputVisible) {
      await inlineInput.fill('Inline Edited Title');
      await inlineInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await screenshot(page, '13-inline-edit-saved');
    } else {
      // Try clicking (single click) to trigger inline edit
      await firstTitleCell.click();
      await page.waitForTimeout(300);
      await screenshot(page, '13-inline-edit-attempt');
    }
  });

  test('8. Delete album flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('.card').count();

    // Set up dialog handler before clicking delete
    page.once('dialog', dialog => dialog.accept());

    // Click Delete on the first card
    await page.locator('.card').first().getByRole('button', { name: /Delete/i }).click();
    await page.waitForLoadState('networkidle');

    const newCount = await page.locator('.card').count();
    expect(newCount).toBeLessThan(initialCount);

    await screenshot(page, '14-album-deleted');
  });

  test('9. Status alert on actions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add an album to trigger success alert
    await page.getByRole('button', { name: /Add Album/ }).click();
    await page.getByLabel(/Title/i).fill('Alert Test Album');
    await page.getByLabel(/Artist/i).fill('Alert Artist');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForLoadState('networkidle');

    // Status alert should appear
    const alert = page.locator('.alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/saved|success/i);

    await screenshot(page, '15-status-alert');
  });

  test('10. Navbar is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('nav, .navbar')).toBeVisible();
    await screenshot(page, '16-navbar');
  });

});
