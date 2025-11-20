# PlayAct - Material UI Testing Demo

[![Unit Tests](https://github.com/emZubair/PlayAct/actions/workflows/test.yml/badge.svg)](https://github.com/emZubair/PlayAct/actions/workflows/test.yml)
[![E2E Tests](https://github.com/emZubair/PlayAct/actions/workflows/e2e.yml/badge.svg)](https://github.com/emZubair/PlayAct/actions/workflows/e2e.yml)

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

### End-to-End Tests (Playwright)

The project uses the **Page Object Model (POM)** pattern for maintainable and scalable E2E tests:

**Test Files (organized by component):**
- **checkbox.spec.js** - 13 tests for Checkbox component functionality
- **textfield.spec.js** - 18 tests for TextField component functionality
- **autocomplete.spec.js** - 20 tests for Autocomplete component functionality

**Page Objects:**
- **play.act.page.js** - Page Object containing all locators and interaction methods
- **base.page.js** - Base class with common reusable methods inherited by all page objects

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

For detailed test coverage information including all test cases, edge cases, and testing patterns, see the [Test Coverage Documentation](./e2e/TEST_COVERAGE.md).

## Test Statistics

- **Total Vitest Tests:** 30 unit tests
- **Total Playwright Tests:** 51 E2E tests (using Page Object Model)
  - Checkbox component: 13 tests
  - TextField component: 18 tests
  - Autocomplete component: 20 tests
- **Browsers Tested:** Chromium by default (Firefox and WebKit available - see Cross-Browser Testing section)
- **Test Coverage Areas:**
  - Component rendering
  - User interactions
  - State management
  - Accessibility
  - Keyboard navigation
  - Responsive design
  - State persistence

## Project Structure

```
PlayAct/
├── .github/
│   └── workflows/
│       ├── test.yml          # GitHub Actions workflow for Vitest unit tests
│       └── e2e.yml           # GitHub Actions workflow for Playwright E2E tests
├── e2e/                      # Playwright E2E tests
│   ├── pages/
│   │   ├── base.page.js      # Base Page Object with common methods
│   │   └── play.act.page.js  # Page Object Model for PlayAct app
│   ├── specs/
│   │   ├── checkbox.spec.js     # Checkbox component tests (13 tests)
│   │   ├── textfield.spec.js    # TextField component tests (18 tests)
│   │   └── autocomplete.spec.js # Autocomplete component tests (20 tests)
│   └── TEST_COVERAGE.md      # Detailed test coverage documentation
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

The project includes two automated testing workflows:

### 1. Unit Tests Workflow (test.yml)

Runs Vitest unit tests on pull requests against the `main` branch.

### 2. E2E Tests Workflow (e2e.yml)

Runs Playwright E2E tests against the deployed Vercel application and publishes Allure reports.

**Allure Report:** After the first workflow run on main branch, the Allure report will be available at:
[PlayWright-React-Pages](https://emzubair.github.io/PlayAct/)
