# Test Coverage Documentation

This document provides detailed information about the test coverage for the PlayAct application, including both unit tests (Vitest) and end-to-end tests (Playwright).

## Test Statistics

- **Total Vitest Tests:** 30 unit tests
- **Total Playwright Tests:** 51 E2E tests (using Page Object Model)
  - Checkbox component: 13 tests
  - TextField component: 18 tests
  - Autocomplete component: 20 tests
- **Browsers Tested:** Chromium by default (Firefox and WebKit available)
- **Test Coverage Areas:**
  - Component rendering
  - User interactions
  - State management
  - Accessibility
  - Keyboard navigation
  - Responsive design
  - State persistence

## Checkbox Component Tests

### Unit Tests (Vitest)
- ✅ Initial unchecked state
- ✅ Status display ("Not Accepted" / "Accepted")
- ✅ Click interaction
- ✅ Multiple toggles
- ✅ Accessibility (aria-label)

### E2E Tests (Playwright)
- ✅ Visual rendering
- ✅ Page title verification
- ✅ Section visibility
- ✅ Initial unchecked state
- ✅ Status display ("Not Accepted" initially)
- ✅ Check interaction
- ✅ Status update to "Accepted" when checked
- ✅ Uncheck interaction
- ✅ Status update back to "Not Accepted"
- ✅ Multiple toggles (3 iterations)
- ✅ Keyboard accessibility (Space key)
- ✅ State persistence after interactions
- ✅ Mobile viewport compatibility (375x667)
- ✅ Tablet viewport compatibility (768x1024)

**Total: 13 E2E tests**

## TextField Component Tests

### Unit Tests (Vitest)
- ✅ Initial empty state
- ✅ Character count display (starts at 0)
- ✅ Text input handling
- ✅ Dynamic greeting message
- ✅ Clear input functionality
- ✅ Special characters support
- ✅ Unicode character handling

### E2E Tests (Playwright)
- ✅ Page title verification
- ✅ Section visibility
- ✅ Initial empty state
- ✅ Character count of 0 initially
- ✅ No greeting message initially
- ✅ Text input ("John Doe")
- ✅ Character count updates (5 chars for "Alice")
- ✅ Greeting message display ("Hello, Bob!")
- ✅ Real-time character count updates (1, 2, 4 chars)
- ✅ Input clearing
- ✅ Special characters handling (@, #, $, etc.)
- ✅ Long text input (100 characters)
- ✅ Unicode character support (世界 🌍)
- ✅ State persistence after interactions
- ✅ Character count reset after clearing
- ✅ Mobile viewport compatibility
- ✅ Tablet viewport compatibility
- ✅ Accessible label ("Enter your name")

**Total: 18 E2E tests**

## Autocomplete Component Tests

### Unit Tests (Vitest)
- ✅ Initial empty state
- ✅ Dropdown opening
- ✅ Option display (8 fruit options)
- ✅ Filtering by input
- ✅ Option selection
- ✅ Selection changes
- ✅ Case-insensitive filtering

### E2E Tests (Playwright)
- ✅ Page title verification
- ✅ Section visibility
- ✅ Initial empty state
- ✅ No selection message initially
- ✅ Dropdown opens on click
- ✅ Displays all 8 fruit options (Apple, Banana, Cherry, Date, Elderberry, Fig, Grape, Honeydew)
- ✅ Option selection by clicking ("Banana")
- ✅ Selected value displays in input ("Cherry")
- ✅ Filtering options by typing ("App")
- ✅ Selection change (Apple → Grape)
- ✅ Case-insensitive filtering ("banana")
- ✅ "No options" state for non-matching input ("xyz")
- ✅ Keyboard navigation (Arrow Down x2 → Enter = "Banana")
- ✅ Escape key closes dropdown
- ✅ State persistence after interactions
- ✅ Multiple matching options filter (letter "e")
- ✅ Mobile viewport compatibility
- ✅ Tablet viewport compatibility
- ✅ Accessible label ("Select a fruit")
- ✅ All fruit options selectable (8 fruits)

**Total: 20 E2E tests**

## Integration Tests

Both test suites (Vitest and Playwright) include integration tests that verify:
- ✅ All components work independently
- ✅ State is maintained across interactions
- ✅ Multiple components can be used simultaneously
- ✅ Component states don't interfere with each other

## Accessibility Tests (Playwright)

- ✅ Heading hierarchy (1 h1, 3 h5 headings)
- ✅ Form labels for all interactive elements
- ✅ Checkbox accessible label
- ✅ TextField accessible label ("Enter your name")
- ✅ Autocomplete accessible label ("Select a fruit")
- ✅ Keyboard navigation support
- ✅ Focus management

## Responsive Design Tests (Playwright)

### Mobile Viewport (375x667)
- ✅ Checkbox component visibility and functionality
- ✅ TextField component visibility and functionality
- ✅ Autocomplete component visibility and functionality

### Tablet Viewport (768x1024)
- ✅ Checkbox component visibility and functionality
- ✅ TextField component visibility and functionality
- ✅ Autocomplete component visibility and functionality

## Test Organization

### Unit Tests (Vitest)
- **Location:** `src/App.test.jsx`
- **Test File:** Single file with 30 tests
- **Focus:** Component logic, state management, user events
- **Tools:** @testing-library/react, @testing-library/user-event

### E2E Tests (Playwright)
- **Location:** `e2e/specs/`
- **Test Files:**
  - `checkbox.spec.js` - 13 tests
  - `textfield.spec.js` - 18 tests
  - `autocomplete.spec.js` - 20 tests
- **Focus:** User workflows, visual validation, cross-browser testing
- **Pattern:** Page Object Model (POM)
- **Page Objects:**
  - `play.act.page.js` - Main page object with all locators and interactions
  - `base.page.js` - Base class with common reusable methods

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Unit Tests Only
```bash
npm test
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Run Specific Component Tests
```bash
# Checkbox tests only
npx playwright test checkbox.spec.js

# TextField tests only
npx playwright test textfield.spec.js

# Autocomplete tests only
npx playwright test autocomplete.spec.js
```

### Run Tests in Different Modes
```bash
# Watch mode (unit tests)
npm run test:watch

# UI mode (unit tests)
npm run test:ui

# UI mode (E2E tests)
npm run test:e2e:ui

# Headed mode (see browser)
npx playwright test --headed
```

## Test Execution in CI/CD

### Unit Tests Workflow
- **Trigger:** Pull requests to main branch
- **Tests:** 30 Vitest unit tests
- **Environment:** Node.js 20, jsdom
- **Results:** Posted as PR comments

### E2E Tests Workflow
- **Trigger:** Pull requests and pushes to main branch
- **Tests:** 51 Playwright E2E tests
- **Environment:** Chromium browser on Ubuntu
- **Target:** https://play-act.vercel.app/
- **Results:** Posted as PR comments
- **Reports:** Allure reports published to GitHub Pages

## Key Testing Patterns

### Vitest Unit Tests
- Component rendering with `@testing-library/react`
- Realistic user interactions with `@testing-library/user-event`
- Async operations with `waitFor`
- Automatic cleanup between tests

### Playwright E2E Tests (Page Object Model)
- **BasePage Pattern**: Common methods inherited by all page objects
  - Navigation methods (goto, reload, goBack, goForward)
  - Keyboard interactions (pressTab, pressEnter, pressEscape, arrow keys)
  - Viewport management (setMobileViewport, setTabletViewport, etc.)
  - Assertion helpers (expectVisible, expectChecked, expectText, etc.)
  - Element interaction methods (click, fill, check, hover, etc.)

- **PlayActPage**: Application-specific page object
  - All locators defined in constructor using ID selectors
  - Component-specific interaction methods (checkCheckbox, fillTextField, etc.)
  - Custom assertion helpers (expectCheckboxChecked, expectTextFieldValue, etc.)

- **Benefits of POM approach**:
  - Cleaner, more maintainable test code
  - Reusable methods across tests
  - Centralized locator management
  - Easy to extend for new pages
  - Tests focus on behavior, not implementation details

## Edge Cases Covered

### TextField
- Empty input
- Single character
- Long text (100+ characters)
- Special characters (@, #, $, !, etc.)
- Unicode characters (世界, 🌍)
- Input clearing
- Real-time updates

### Autocomplete
- Empty state
- All 8 options visible
- Partial matching ("App" → "Apple")
- Case-insensitive matching ("banana" → "Banana")
- No matches ("xyz")
- Multiple matching options ("e" matches multiple fruits)
- Selection changes
- Keyboard navigation
- Escape key handling

### Checkbox
- Initial state
- Single toggle
- Multiple toggles (3+ times)
- Keyboard interaction (Space key)
- State persistence

## Future Test Enhancements

Potential areas for additional test coverage:
- Form validation scenarios
- Error state handling
- Network error handling
- Performance testing
- Visual regression testing
- Cross-browser testing (Firefox, WebKit)
- Additional accessibility tests (screen reader support)
- Multi-language support testing
