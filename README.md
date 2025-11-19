# PlayAct - Material UI Testing Demo

A React application demonstrating comprehensive testing of Material UI components using Vitest and Playwright.

## Project Overview

PlayAct is a testing-focused React application that showcases three core Material UI components with extensive automated test coverage:

- **Checkbox** - Toggle state management with status display
- **TextField** - Text input with character counting and dynamic greeting
- **Autocomplete** - Searchable dropdown with fruit options

The project emphasizes **testing quality** over UI design, providing thorough unit tests (Vitest) and end-to-end tests (Playwright) to validate component behavior.

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and development server
- **Material UI (MUI)** - Component library
- **Vitest** - Unit testing framework
- **@testing-library/react** - React testing utilities
- **Playwright** - End-to-end testing framework

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended, v18 minimum)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:emZubair/PlayAct.git
cd PlayAct
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers (if not already installed):
```bash
npx playwright install
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Running Tests

### Unit Tests (Vitest)

Run all unit tests (runs once and exits):
```bash
npm test
```

Run tests in watch mode (recommended for development):
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

### End-to-End Tests (Playwright)

The project uses the **Page Object Model (POM)** pattern for maintainable and scalable E2E tests:
- **app.pom.spec.js** - 39 comprehensive tests using POM pattern
- **PlayActPage.js** - Page Object containing all locators and interactions
- **BasePage.js** - Base class with common reusable methods

Run all E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Run E2E tests in headed mode (see browser):
```bash
npx playwright test --headed
```

#### Cross-Browser Testing

By default, tests run only on **Chromium** for faster execution. To test on multiple browsers, uncomment the Firefox and WebKit projects in `playwright.config.js`:

```javascript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
],
```

Then run tests on specific browsers:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Currently only chromium is being used and others are commented

### Run All Tests

Run both unit and E2E tests:
```bash
npm run test:all
```

## Test Coverage

### Checkbox Component Tests

**Unit Tests:**
- Initial unchecked state
- Status display ("Not Accepted" / "Accepted")
- Click interaction
- Multiple toggles
- Accessibility (aria-label)

**E2E Tests:**
- Visual rendering
- User interaction flow
- Keyboard accessibility (Space key)
- Status updates

### TextField Component Tests

**Unit Tests:**
- Initial empty state
- Character count display (starts at 0)
- Text input handling
- Dynamic greeting message
- Clear input functionality
- Special characters support
- Unicode character handling

**E2E Tests:**
- Real-time character count updates
- Long text input
- Input clearing
- Visual feedback
- Edge cases (special chars, unicode)

### Autocomplete Component Tests

**Unit Tests:**
- Initial empty state
- Dropdown opening
- Option display (8 fruit options)
- Filtering by input
- Option selection
- Selection changes
- Case-insensitive filtering

**E2E Tests:**
- Dropdown interaction
- Keyboard navigation (Arrow keys)
- Option selection
- Value persistence
- Filter functionality
- "No options" state
- Escape key behavior

### Integration Tests

Both test suites include integration tests that verify:
- All components work independently
- State is maintained across interactions
- Multiple components can be used simultaneously

### Accessibility Tests (Playwright)

- Heading hierarchy
- Form labels
- Keyboard navigation (Tab key)
- Focus management

### Responsive Design Tests (Playwright)

- Mobile viewport (375x667)
- Tablet viewport (768x1024)

## Test Statistics

- **Total Vitest Tests:** 30 unit tests
- **Total Playwright Tests:** 39 E2E tests (using Page Object Model)
- **Browsers Tested:** Chromium by default (Firefox and WebKit available - see Cross-Browser Testing section)
- **Test Coverage Areas:**
  - Component rendering
  - User interactions
  - State management
  - Accessibility
  - Keyboard navigation
  - Responsive design
  - Integration scenarios

## Project Structure

```
PlayAct/
├── .github/
│   └── workflows/
│       └── test.yml          # GitHub Actions CI/CD workflow
├── e2e/                      # Playwright E2E tests
│   ├── pages/
│   │   ├── base.page.js      # Base Page Object with common methods
│   │   └── play.act.page.js  # Page Object Model for PlayAct app
│   ├── specs/
│   │   └── app.spec.js       # POM-based E2E tests (39 tests)
├── src/
│   ├── test/
│   │   └── setup.js          # Vitest setup and configuration
│   ├── App.jsx               # Main application with IDs
│   └── App.test.jsx          # Vitest unit tests (30 tests)
├── playwright.config.js      # Playwright configuration
├── vitest.config.js          # Vitest configuration
├── package.json
└── README.md
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run Vitest once and exit |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:ui` | Run Vitest with UI |
| `npm run test:e2e` | Run Playwright tests |
| `npm run test:e2e:ui` | Run Playwright with UI |
| `npm run test:all` | Run all tests (unit + E2E) |

## CI/CD

### GitHub Actions Workflow (test.yml)

The project includes an automated testing workflow that runs Vitest unit tests on pull requests against the `main` branch.

**Features:**
- ✅ Runs Vitest unit tests (30 tests)
- 📊 Posts test results as a PR comment with pass/fail status
- 🔄 Updates existing comment on subsequent pushes (no comment spam)
- 🚫 Auto-cancels previous runs when PR is updated (saves CI resources)
- ❌ Fails the workflow if tests fail
- ⚡ Uses npm cache for faster builds

**Note:** Playwright E2E tests are excluded from CI as they require a running development server. Run them locally with `npm run test:e2e`.

**Workflow file:** `.github/workflows/test.yml`

**Example PR Comment:**
```markdown
## Test Results Summary

### 📝 Vitest Unit Tests
✅ **Status:** Passed
 Test Files  1 passed (1)
      Tests  30 passed (30)

---
💡 **Note:** Playwright E2E tests are excluded from CI as they require a running server. Run them locally with `npm run test:e2e`

Updated: Wed, 20 Nov 2024 00:00:00 GMT
```

### Manual CI Mode

The project is also configured for manual CI/CD environments:

- Playwright retries failed tests 2 times in CI
- Single worker in CI for stability
- Development server auto-starts for E2E tests
- All tests can run headlessly

To run in CI mode:
```bash
CI=true npm run test:all
```

## Key Testing Patterns

### Vitest Unit Tests

- Uses `@testing-library/react` for component rendering
- Uses `@testing-library/user-event` for realistic user interactions
- Uses `waitFor` for async operations
- Tests are isolated with automatic cleanup

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

## Debugging Tests

### Debug Vitest Tests

Run tests with verbose output:
```bash
npm test -- --reporter=verbose
```

### Debug Playwright Tests

```bash
npx playwright test --debug
```

View Playwright test report:
```bash
npx playwright show-report
```

