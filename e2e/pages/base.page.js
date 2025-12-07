import { expect } from "@playwright/test";

/**
 * Base Page Object Model
 * Contains common methods and utilities shared across all page objects
 */
export class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigation methods
   */
  async goto(url = "/") {
    await this.page.goto(url);
  }

  async reload() {
    await this.page.reload();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }

  /**
   * Keyboard interaction methods
   */
  async pressTab() {
    await this.page.keyboard.press("Tab");
  }

  async pressEnter() {
    await this.page.keyboard.press("Enter");
  }

  async pressEscape() {
    await this.page.keyboard.press("Escape");
  }

  async pressSpace() {
    await this.page.keyboard.press("Space");
  }

  async pressArrowDown() {
    await this.page.keyboard.press("ArrowDown");
  }

  async pressArrowUp() {
    await this.page.keyboard.press("ArrowUp");
  }

  async pressArrowLeft() {
    await this.page.keyboard.press("ArrowLeft");
  }

  async pressArrowRight() {
    await this.page.keyboard.press("ArrowRight");
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  async typeText(text) {
    await this.page.keyboard.type(text);
  }

  /**
   * Viewport/responsive methods
   */
  async setViewportSize(width, height) {
    await this.page.setViewportSize({ width, height });
  }

  async setMobileViewport() {
    await this.setViewportSize(375, 667);
  }

  async setTabletViewport() {
    await this.setViewportSize(768, 1024);
  }

  async setDesktopViewport() {
    await this.setViewportSize(1920, 1080);
  }

  async setLargeDesktopViewport() {
    await this.setViewportSize(2560, 1440);
  }

  /**
   * Wait methods
   */
  async waitForTimeout(milliseconds) {
    await this.page.waitForTimeout(milliseconds);
  }

  async waitForNavigation() {
    await this.page.waitForNavigation();
  }

  async waitForLoadState(state = "load") {
    await this.page.waitForLoadState(state);
  }

  async waitForSelector(selector, options = {}) {
    await this.page.waitForSelector(selector, options);
  }

  /**
   * Element interaction methods
   */
  async click(selector) {
    await this.page.click(selector);
  }

  async doubleClick(selector) {
    await this.page.dblclick(selector);
  }

  async hover(selector) {
    await this.page.hover(selector);
  }

  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  async check(selector) {
    await this.page.check(selector);
  }

  async uncheck(selector) {
    await this.page.uncheck(selector);
  }

  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Get element methods
   */
  getByRole(role, options) {
    return this.page.getByRole(role, options);
  }

  getByText(text, options) {
    return this.page.getByText(text, options);
  }

  getByLabel(label, options) {
    return this.page.getByLabel(label, options);
  }

  getByPlaceholder(placeholder, options) {
    return this.page.getByPlaceholder(placeholder, options);
  }

  getByTestId(testId) {
    return this.page.getByTestId(testId);
  }

  locator(selector) {
    return this.page.locator(selector);
  }

  /**
   * Assertion helper methods
   */
  async expectVisible(locator) {
    await expect(locator).toBeVisible();
  }

  async expectHidden(locator) {
    await expect(locator).toBeHidden();
  }

  async expectEnabled(locator) {
    await expect(locator).toBeEnabled();
  }

  async expectDisabled(locator) {
    await expect(locator).toBeDisabled();
  }

  async expectChecked(locator) {
    await expect(locator).toBeChecked();
  }

  async expectUnchecked(locator) {
    await expect(locator).not.toBeChecked();
  }

  async expectText(locator, text) {
    await expect(locator).toHaveText(text);
  }

  async expectContainText(locator, text) {
    await expect(locator).toContainText(text);
  }

  async expectValue(locator, value) {
    await expect(locator).toHaveValue(value);
  }

  async expectCount(locator, count) {
    await expect(locator).toHaveCount(count);
  }

  async expectAttribute(locator, name, value) {
    await expect(locator).toHaveAttribute(name, value);
  }

  async expectURL(pattern) {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectTitle(pattern) {
    await expect(this.page).toHaveTitle(pattern);
  }

  async expectFocused(locator) {
    await expect(locator).toBeFocused();
  }

  /**
   * Screenshot methods
   */
  async takeScreenshot(options = {}) {
    return await this.page.screenshot(options);
  }

  async takeFullPageScreenshot() {
    return await this.page.screenshot({ fullPage: true });
  }

  async takeElementScreenshot(selector) {
    const element = await this.page.locator(selector);
    return await element.screenshot();
  }

  /**
   * Utility methods
   */
  async getTitle() {
    return await this.page.title();
  }

  async getURL() {
    return this.page.url();
  }

  async getText(selector) {
    return await this.page.locator(selector).textContent();
  }

  async getValue(selector) {
    return await this.page.locator(selector).inputValue();
  }

  async isVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  async isHidden(selector) {
    return await this.page.locator(selector).isHidden();
  }

  async isEnabled(selector) {
    return await this.page.locator(selector).isEnabled();
  }

  async isDisabled(selector) {
    return await this.page.locator(selector).isDisabled();
  }

  async isChecked(selector) {
    return await this.page.locator(selector).isChecked();
  }

  async getAttribute(selector, name) {
    return await this.page.locator(selector).getAttribute(name);
  }

  async count(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Console and error handling
   */
  setupConsoleListener() {
    this.page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  }

  setupErrorListener() {
    this.page.on("pageerror", (error) => console.log("PAGE ERROR:", error));
  }

  setupRequestListener() {
    this.page.on("request", (request) =>
      console.log("REQUEST:", request.url())
    );
  }

  setupResponseListener() {
    this.page.on("response", (response) =>
      console.log("RESPONSE:", response.url(), response.status())
    );
  }
}
