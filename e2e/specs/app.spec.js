import { test, expect } from '@playwright/test';
import { PlayActPage } from '../pages/play.act.page.js';

test.describe('PlayAct Application - POM', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
  });

  test('has correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/playact/i);
    await expect(playActPage.heading).toBeVisible();
  });

  test('displays all three component sections', async () => {
    await playActPage.expectAllSectionsVisible();
    await playActPage.expectComponentHeadingsVisible();
  });
});

test.describe('Checkbox Component - POM', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
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
});

test.describe('TextField Component - POM', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
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
});

test.describe('Autocomplete Component - POM', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
  });

  test('autocomplete is initially empty', async () => {
    await playActPage.expectAutocompleteValue('');
  });

  test('does not show selection message initially', async () => {
    await playActPage.expectAutocompleteOutputNotVisible();
  });

  test('opens dropdown when clicked', async () => {
    await playActPage.openAutocomplete();
    expect(await playActPage.isAutocompleteDropdownOpen()).toBe(true);
  });

  test('displays all fruit options when opened', async () => {
    const options = await playActPage.getAutocompleteOptions();
    const expectedFruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];
    expect(options).toEqual(expectedFruits);
  });

  test('can select an option by clicking', async () => {
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption('Banana');

    const output = await playActPage.getAutocompleteOutput();
    expect(output).toBe('You selected: Banana');
  });

  test('displays selected value in input', async () => {
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption('Cherry');
    await playActPage.expectAutocompleteValue('Cherry');
  });

  test('filters options when typing', async ({ page }) => {
    await playActPage.typeInAutocomplete('App');
    await expect(page.getByRole('option', { name: 'Apple' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Banana' })).not.toBeVisible();
  });

  test('can change selection', async () => {
    // First selection
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption('Apple');
    expect(await playActPage.getAutocompleteOutput()).toBe('You selected: Apple');

    // Change selection
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption('Grape');
    expect(await playActPage.getAutocompleteOutput()).toBe('You selected: Grape');
  });

  test('handles case-insensitive filtering', async ({ page }) => {
    await playActPage.typeInAutocomplete('banana');
    await expect(page.getByRole('option', { name: 'Banana' })).toBeVisible();
  });

  test('shows no options for non-matching input', async ({ page }) => {
    await playActPage.typeInAutocomplete('xyz');
    await expect(page.getByText('No options')).toBeVisible();
  });

  test('can navigate options with keyboard', async () => {
    await playActPage.openAutocomplete();
    await playActPage.pressArrowDown();
    await playActPage.pressArrowDown();
    await playActPage.pressEnter();

    const output = await playActPage.getAutocompleteOutput();
    expect(output).toBe('You selected: Banana');
  });

  test('closes dropdown on escape key', async ({ page }) => {
    await playActPage.openAutocomplete();
    await expect(page.getByRole('listbox')).toBeVisible();

    await playActPage.pressEscape();
    await expect(page.getByRole('listbox')).not.toBeVisible();
  });
});

test.describe('Integration Tests - POM', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
  });

  test('all components work independently and simultaneously', async () => {
    // Interact with checkbox
    await playActPage.checkCheckbox();
    await playActPage.expectCheckboxChecked();

    // Interact with textfield
    await playActPage.fillTextField('Integration Test');
    const textOutput = await playActPage.getTextFieldOutput();
    expect(textOutput).toBe('Hello, Integration Test!');

    // Interact with autocomplete
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption('Fig');
    const autocompleteOutput = await playActPage.getAutocompleteOutput();
    expect(autocompleteOutput).toBe('You selected: Fig');

    // Verify all states are maintained
    await playActPage.expectCheckboxChecked();
    await playActPage.expectTextFieldValue('Integration Test');
    expect(await playActPage.getAutocompleteOutput()).toBe('You selected: Fig');
  });

  test('components maintain state after interactions', async ({ page }) => {
    // Set all components
    await playActPage.checkCheckbox();
    await playActPage.fillTextField('State Test');
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption('Date');

    // Interact with other elements
    await playActPage.checkboxHeading.click();
    await playActPage.textFieldHeading.click();

    // Verify states are maintained
    await playActPage.expectCheckboxChecked();
    await playActPage.expectTextFieldValue('State Test');
    expect(await playActPage.getAutocompleteOutput()).toBe('You selected: Date');
  });
});

test.describe('Accessibility Tests - POM', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);

    const h5 = page.getByRole('heading', { level: 5 });
    await expect(h5).toHaveCount(3);
  });

  test('form elements have accessible labels', async ({ page }) => {
    await expect(playActPage.checkbox).toBeVisible();
    await expect(page.getByText('Enter your name').first()).toBeVisible();
    await expect(page.getByText('Select a fruit').first()).toBeVisible();
  });
});

test.describe('Responsive Design - POM', () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
  });

  test('works on mobile viewport', async () => {
    await playActPage.setMobileViewport();
    await playActPage.goto();

    await expect(playActPage.heading).toBeVisible();
    await expect(playActPage.checkbox).toBeVisible();
    await expect(playActPage.textInput).toBeVisible();
    await expect(playActPage.autocompleteInput).toBeVisible();
  });

  test('works on tablet viewport', async () => {
    await playActPage.setTabletViewport();
    await playActPage.goto();

    await expect(playActPage.heading).toBeVisible();
    await expect(playActPage.checkbox).toBeVisible();
    await expect(playActPage.textInput).toBeVisible();
    await expect(playActPage.autocompleteInput).toBeVisible();
  });
});
