import { expect } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Page Object Model for PlayAct application
 * Extends BasePage to inherit common functionality
 */
export class PlayActPage extends BasePage {
  constructor(page) {
    super(page);

    // Page locators
    this.heading = page.getByRole('heading', { name: 'PlayAct - Material UI Testing Demo' });

    // Checkbox section locators
    this.checkboxSection = page.locator('#checkbox-section');
    this.checkboxHeading = page.locator('#checkbox-heading');
    this.checkbox = page.getByRole('checkbox', { name: /accept terms/i });
    this.checkboxById = page.locator('#accept-checkbox');
    this.checkboxLabel = page.locator('#accept-checkbox-label');
    this.checkboxStatus = page.locator('#checkbox-status');

    // TextField section locators
    this.textFieldSection = page.locator('#textfield-section');
    this.textFieldHeading = page.locator('#textfield-heading');
    this.textField = page.locator('#name-textfield');
    this.textInput = page.locator('#name-input');
    this.textFieldOutput = page.locator('#textfield-output');

    // Autocomplete section locators
    this.autocompleteSection = page.locator('#autocomplete-section');
    this.autocompleteHeading = page.locator('#autocomplete-heading');
    this.autocomplete = page.locator('#fruit-autocomplete');
    this.autocompleteInput = page.locator('#fruit-autocomplete-input');
    this.autocompleteOutput = page.locator('#autocomplete-output');
  }

  /**
   * Checkbox interactions
   */
  async checkCheckbox() {
    await this.checkbox.check();
  }

  async uncheckCheckbox() {
    await this.checkbox.uncheck();
  }

  async clickCheckbox() {
    await this.checkbox.click();
  }

  async getCheckboxStatus() {
    return await this.checkboxStatus.textContent();
  }

  async isCheckboxChecked() {
    return await this.checkbox.isChecked();
  }

  async focusCheckbox() {
    await this.checkbox.focus();
  }

  /**
   * TextField interactions
   */
  async fillTextField(text) {
    await this.textInput.fill(text);
  }

  async clearTextField() {
    await this.textInput.clear();
  }

  async getTextFieldValue() {
    return await this.textInput.inputValue();
  }

  async getTextFieldOutput() {
    return await this.textFieldOutput.textContent();
  }

  async isTextFieldOutputVisible() {
    return await this.textFieldOutput.isVisible();
  }

  async getCharacterCount() {
    const helperText = await this.page.locator('.MuiFormHelperText-root').textContent();
    const match = helperText.match(/Character count: (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Autocomplete interactions
   */
  async openAutocomplete() {
    await this.autocompleteInput.click();
  }

  async selectAutocompleteOption(optionText) {
    await this.page.getByRole('option', { name: optionText }).click();
  }

  async typeInAutocomplete(text) {
    await this.autocompleteInput.fill(text);
  }

  async getAutocompleteValue() {
    return await this.autocompleteInput.inputValue();
  }

  async getAutocompleteOutput() {
    return await this.autocompleteOutput.textContent();
  }

  async isAutocompleteOutputVisible() {
    return await this.autocompleteOutput.isVisible();
  }

  async isAutocompleteDropdownOpen() {
    return await this.page.getByRole('listbox').isVisible();
  }

  async getAutocompleteOptions() {
    await this.openAutocomplete();
    const options = await this.page.getByRole('option').all();
    return Promise.all(options.map(opt => opt.textContent()));
  }

  /**
   * Assertions helpers
   */
  async expectCheckboxChecked() {
    await expect(this.checkbox).toBeChecked();
  }

  async expectCheckboxUnchecked() {
    await expect(this.checkbox).not.toBeChecked();
  }

  async expectCheckboxStatus(status) {
    await expect(this.checkboxStatus).toHaveText(`Status: ${status}`);
  }

  async expectTextFieldValue(value) {
    await expect(this.textInput).toHaveValue(value);
  }

  async expectTextFieldOutputVisible() {
    await expect(this.textFieldOutput).toBeVisible();
  }

  async expectTextFieldOutputNotVisible() {
    await expect(this.textFieldOutput).not.toBeVisible();
  }

  async expectAutocompleteValue(value) {
    await expect(this.autocompleteInput).toHaveValue(value);
  }

  async expectAutocompleteOutputVisible() {
    await expect(this.autocompleteOutput).toBeVisible();
  }

  async expectAutocompleteOutputNotVisible() {
    await expect(this.autocompleteOutput).not.toBeVisible();
  }

  /**
   * Visibility checks
   */
  async expectAllSectionsVisible() {
    await expect(this.checkboxSection).toBeVisible();
    await expect(this.textFieldSection).toBeVisible();
    await expect(this.autocompleteSection).toBeVisible();
  }

  async expectComponentHeadingsVisible() {
    await expect(this.checkboxHeading).toBeVisible();
    await expect(this.textFieldHeading).toBeVisible();
    await expect(this.autocompleteHeading).toBeVisible();
  }
}
