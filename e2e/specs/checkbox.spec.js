import { test, expect } from '@playwright/test';
import { PlayActPage } from '../pages/play.act.page.js';

test.describe('Checkbox Component', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/playact/i);
  });

  test('displays checkbox section', async () => {
    await playActPage.expectVisible(playActPage.checkboxSection);
    await playActPage.expectVisible(playActPage.checkboxHeading);
  });

  test('checkbox is initially unchecked', async () => {
    await playActPage.expectCheckboxUnchecked();
  });

  test('displays initial status as "Not Accepted"', async () => {
    await playActPage.expectCheckboxStatus('Not Accepted');
  });

  test('can check the checkbox', async () => {
    await playActPage.checkCheckbox();
    await playActPage.expectCheckboxChecked();
  });

  test('status updates to "Accepted" when checked', async () => {
    await playActPage.checkCheckbox();
    await playActPage.expectCheckboxStatus('Accepted');
  });

  test('can uncheck the checkbox', async () => {
    await playActPage.checkCheckbox();
    await playActPage.expectCheckboxChecked();

    await playActPage.uncheckCheckbox();
    await playActPage.expectCheckboxUnchecked();
  });

  test('status updates back to "Not Accepted" when unchecked', async () => {
    await playActPage.checkCheckbox();
    await playActPage.uncheckCheckbox();
    await playActPage.expectCheckboxStatus('Not Accepted');
  });

  test('can toggle checkbox multiple times', async () => {
    for (let i = 0; i < 3; i++) {
      await playActPage.checkCheckbox();
      await playActPage.expectCheckboxChecked();
      await playActPage.uncheckCheckbox();
      await playActPage.expectCheckboxUnchecked();
    }
  });

  test('checkbox is keyboard accessible', async () => {
    await playActPage.focusCheckbox();
    await playActPage.pressSpace();
    await playActPage.expectCheckboxChecked();
  });

  test('checkbox maintains state after multiple interactions', async () => {
    // Check the checkbox
    await playActPage.checkCheckbox();
    await playActPage.expectCheckboxChecked();
    await playActPage.expectCheckboxStatus('Accepted');

    // Click on heading (non-interactive element)
    await playActPage.checkboxHeading.click();

    // Verify state is maintained
    await playActPage.expectCheckboxChecked();
    await playActPage.expectCheckboxStatus('Accepted');
  });

  test('checkbox works on mobile viewport', async () => {
    await playActPage.setMobileViewport();
    await playActPage.goto();

    await expect(playActPage.checkbox).toBeVisible();
    await playActPage.checkCheckbox();
    await playActPage.expectCheckboxChecked();
  });

  test('checkbox works on tablet viewport', async () => {
    await playActPage.setTabletViewport();
    await playActPage.goto();

    await expect(playActPage.checkbox).toBeVisible();
    await playActPage.checkCheckbox();
    await playActPage.expectCheckboxChecked();
  });
});
