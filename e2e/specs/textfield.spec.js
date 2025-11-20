import { test, expect } from '@playwright/test';
import { PlayActPage } from '../pages/play.act.page.js';

test.describe('TextField Component', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/playact/i);
  });

  test('displays textfield section', async () => {
    await playActPage.expectVisible(playActPage.textFieldSection);
    await playActPage.expectVisible(playActPage.textFieldHeading);
  });

  test('textfield is initially empty', async () => {
    await playActPage.expectTextFieldValue('');
  });

  test('displays character count of 0 initially', async () => {
    const count = await playActPage.getCharacterCount();
    expect(count).toBe(0);
  });

  test('does not show greeting initially', async () => {
    await playActPage.expectTextFieldOutputNotVisible();
  });

  test('can type in the textfield', async () => {
    await playActPage.fillTextField('John Doe');
    await playActPage.expectTextFieldValue('John Doe');
  });

  test('displays correct character count when typing', async () => {
    await playActPage.fillTextField('Alice');
    const count = await playActPage.getCharacterCount();
    expect(count).toBe(5);
  });

  test('shows greeting message with entered name', async () => {
    await playActPage.fillTextField('Bob');
    const output = await playActPage.getTextFieldOutput();
    expect(output).toBe('Hello, Bob!');
  });

  test('updates character count in real-time', async () => {
    await playActPage.fillTextField('T');
    expect(await playActPage.getCharacterCount()).toBe(1);

    await playActPage.fillTextField('Te');
    expect(await playActPage.getCharacterCount()).toBe(2);

    await playActPage.fillTextField('Test');
    expect(await playActPage.getCharacterCount()).toBe(4);
  });

  test('handles clearing the textfield', async () => {
    await playActPage.fillTextField('Test');
    await playActPage.expectTextFieldOutputVisible();

    await playActPage.clearTextField();
    await playActPage.expectTextFieldValue('');
    await playActPage.expectTextFieldOutputNotVisible();
  });

  test('handles special characters', async () => {
    await playActPage.fillTextField('Test@123!#$');
    await playActPage.expectTextFieldValue('Test@123!#$');
    const output = await playActPage.getTextFieldOutput();
    expect(output).toBe('Hello, Test@123!#$!');
  });

  test('handles long text input', async () => {
    const longText = 'A'.repeat(100);
    await playActPage.fillTextField(longText);
    await playActPage.expectTextFieldValue(longText);
    expect(await playActPage.getCharacterCount()).toBe(100);
  });

  test('handles unicode characters', async () => {
    await playActPage.fillTextField('Hello 世界 🌍');
    await playActPage.expectTextFieldValue('Hello 世界 🌍');
  });

  test('textfield maintains state after interactions', async () => {
    // Fill the textfield
    await playActPage.fillTextField('State Test');
    await playActPage.expectTextFieldValue('State Test');
    expect(await playActPage.getTextFieldOutput()).toBe('Hello, State Test!');

    // Click on heading (non-interactive element)
    await playActPage.textFieldHeading.click();

    // Verify state is maintained
    await playActPage.expectTextFieldValue('State Test');
    expect(await playActPage.getTextFieldOutput()).toBe('Hello, State Test!');
  });

  test('character count updates correctly when clearing', async () => {
    await playActPage.fillTextField('Testing');
    expect(await playActPage.getCharacterCount()).toBe(7);

    await playActPage.clearTextField();
    expect(await playActPage.getCharacterCount()).toBe(0);
  });

  test('textfield works on mobile viewport', async () => {
    await playActPage.setMobileViewport();
    await playActPage.goto();

    await expect(playActPage.textInput).toBeVisible();
    await playActPage.fillTextField('Mobile Test');
    await playActPage.expectTextFieldValue('Mobile Test');
  });

  test('textfield works on tablet viewport', async () => {
    await playActPage.setTabletViewport();
    await playActPage.goto();

    await expect(playActPage.textInput).toBeVisible();
    await playActPage.fillTextField('Tablet Test');
    await playActPage.expectTextFieldValue('Tablet Test');
  });

  test('has accessible label', async ({ page }) => {
    await expect(page.getByText('Enter your name').first()).toBeVisible();
  });
});
