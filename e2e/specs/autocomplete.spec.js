import { test, expect } from "@playwright/test";
import { PlayActPage } from "../pages/play.act.page.js";

test.describe("Autocomplete Component", () => {
  let playActPage;

  test.beforeEach(async ({ page }) => {
    playActPage = new PlayActPage(page);
    await playActPage.goto();
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/playact/i);
  });

  test("displays autocomplete section", async () => {
    await playActPage.expectVisible(playActPage.autocompleteSection);
    await playActPage.expectVisible(playActPage.autocompleteHeading);
  });

  test("autocomplete is initially empty", async () => {
    await playActPage.expectAutocompleteValue("");
  });

  test("does not show selection message initially", async () => {
    await playActPage.expectAutocompleteOutputNotVisible();
  });

  test("opens dropdown when clicked", async () => {
    await playActPage.openAutocomplete();
    expect(await playActPage.isAutocompleteDropdownOpen()).toBe(true);
  });

  test("displays all fruit options when opened", async () => {
    const options = await playActPage.getAutocompleteOptions();
    const expectedFruits = [
      "Apple",
      "Banana",
      "Cherry",
      "Date",
      "Elderberry",
      "Fig",
      "Grape",
      "Honeydew",
    ];
    expect(options).toEqual(expectedFruits);
  });

  test("can select an option by clicking", async () => {
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption("Banana");

    const output = await playActPage.getAutocompleteOutput();
    expect(output).toBe("You selected: Banana");
  });

  test("displays selected value in input", async () => {
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption("Cherry");
    await playActPage.expectAutocompleteValue("Cherry");
  });

  test("filters options when typing", async ({ page }) => {
    await playActPage.typeInAutocomplete("App");
    await expect(page.getByRole("option", { name: "Apple" })).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Banana" })
    ).not.toBeVisible();
  });

  test("can change selection", async () => {
    // First selection
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption("Apple");
    expect(await playActPage.getAutocompleteOutput()).toBe(
      "You selected: Apple"
    );

    // Change selection
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption("Grape");
    expect(await playActPage.getAutocompleteOutput()).toBe(
      "You selected: Grape"
    );
  });

  test("handles case-insensitive filtering", async ({ page }) => {
    await playActPage.typeInAutocomplete("banana");
    await expect(page.getByRole("option", { name: "Banana" })).toBeVisible();
  });

  test("shows no options for non-matching input", async ({ page }) => {
    await playActPage.typeInAutocomplete("xyz");
    await expect(page.getByText("No options")).toBeVisible();
  });

  test("can navigate options with keyboard", async () => {
    await playActPage.openAutocomplete();
    await playActPage.pressArrowDown();
    await playActPage.pressArrowDown();
    await playActPage.pressEnter();

    const output = await playActPage.getAutocompleteOutput();
    expect(output).toBe("You selected: Banana");
  });

  test("closes dropdown on escape key", async ({ page }) => {
    await playActPage.openAutocomplete();
    await expect(page.getByRole("listbox")).toBeVisible();

    await playActPage.pressEscape();
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("autocomplete maintains state after interactions", async () => {
    // Select an option
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption("Date");
    expect(await playActPage.getAutocompleteOutput()).toBe(
      "You selected: Date"
    );

    // Click on heading (non-interactive element)
    await playActPage.autocompleteHeading.click();

    // Verify state is maintained
    expect(await playActPage.getAutocompleteOutput()).toBe(
      "You selected: Date"
    );
  });

  test("filters multiple matching options correctly", async ({ page }) => {
    await playActPage.typeInAutocomplete("e");
    // Should show options containing 'e': Cherry, Date, Elderberry, Apple, Grape, Honeydew
    await expect(page.getByRole("option", { name: "Cherry" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Date" })).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Elderberry" })
    ).toBeVisible();
  });

  test("autocomplete works on mobile viewport", async () => {
    await playActPage.setMobileViewport();
    await playActPage.goto();

    await expect(playActPage.autocompleteInput).toBeVisible();
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption("Fig");
    expect(await playActPage.getAutocompleteOutput()).toBe("You selected: Fig");
  });

  test("autocomplete works on tablet viewport", async () => {
    await playActPage.setTabletViewport();
    await playActPage.goto();

    await expect(playActPage.autocompleteInput).toBeVisible();
    await playActPage.openAutocomplete();
    await playActPage.selectAutocompleteOption("Grape");
    expect(await playActPage.getAutocompleteOutput()).toBe(
      "You selected: Grape"
    );
  });

  test("has accessible label", async ({ page }) => {
    await expect(page.getByText("Select a fruit").first()).toBeVisible();
  });

  test("can select all available fruit options", async () => {
    const fruits = [
      "Apple",
      "Banana",
      "Cherry",
      "Date",
      "Elderberry",
      "Fig",
      "Grape",
      "Honeydew",
    ];

    for (const fruit of fruits) {
      await playActPage.openAutocomplete();
      await playActPage.selectAutocompleteOption(fruit);
      expect(await playActPage.getAutocompleteOutput()).toBe(
        `You selected: ${fruit}`
      );
    }
  });
});
