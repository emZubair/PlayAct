# PDF Testing Guide

A comprehensive guide to PDF validation testing using Playwright in the PlayAct project.

## Table of Contents

1. [Overview](#overview)
2. [Test PDFs](#test-pdfs)
3. [Architecture](#architecture)
4. [Content Validation Tests](#content-validation-tests)
5. [Visual Comparison Tests](#visual-comparison-tests)
6. [Best Practices](#best-practices)
7. [Running Tests](#running-tests)
8. [Summary](#summary)

---

## Overview

PDF testing ensures generated documents are accurate, complete, and visually correct. This suite uses two complementary testing methods:

| Method                 | Purpose                                     | Detects                                           |
| ---------------------- | ------------------------------------------- | ------------------------------------------------- |
| **Content Validation** | Extract and verify text, data, calculations | Missing fields, wrong values, calculation errors  |
| **Visual Comparison**  | Render PDFs as images and compare visually  | Missing images, layout changes, formatting issues |

### Why This Matters

**Content Testing** catches data errors that customers will notice:

- Wrong payment amounts or calculations
- Missing required fields (invoice numbers, dates, etc.)
- Incomplete financial information

**Visual Testing** catches presentation defects:

- Missing logos or images
- Layout shifts or alignment issues
- Formatting problems

**Together** they provide comprehensive validation against both data and presentation errors.

---

## Test PDFs

This test suite uses 5 invoice variants to demonstrate different validation scenarios:

### Invoice.pdf (Original - Correct)

The baseline invoice with all fields present and correct calculations.

```
Employee: John Doe
Department: Finance
Month: May / 2025

Payables:
  Total Expense: 500.00
  Service: 10.00
  Miscal: 5.00
  ─────────────────
  Total Income: 515.00

Deductions:
  Package Discount: 5.00
  Other Deductions: 0.00
  ─────────────────
  Total Deductions: 5.00

Net Bill: PKR 510.00 ✓ (515 - 5 = 510)
```

### Test Variants

The test suite includes 4 variant invoices to demonstrate different error detection scenarios:

1. **total-missing.pdf** - Missing Net Bill line (content error)
2. **logo-missing.pdf** - Missing logo image (visual error)
3. **wrong-logo.pdf** - Different logo image (visual error)
4. **wrong-calculations.pdf** - Wrong calculation in Net Bill (content error)

---

## Architecture

```
e2e/
├── utils/
│   └── pdf.utils.js          # PDF parsing and comparison utilities
├── pages/
│   └── pdf.page.js           # Page Object Model for PDF operations
├── specs/
│   ├── pdf-content.spec.js   # Content validation tests
│   └── pdf-visual.spec.js    # Visual comparison tests
└── fixtures/
    ├── pdfs/                 # Test PDF files
    │   ├── Invoice.pdf
    │   ├── total-missing.pdf
    │   ├── logo-missing.pdf
    │   ├── wrong-logo.pdf
    │   └── wrong-calculations.pdf
    └── snapshots/            # Visual baseline images
        ├── original-invoice-page-1.png
        └── logo-missing-vs-original-diff.png
```

### Dependencies

| Package      | Purpose                             |
| ------------ | ----------------------------------- |
| `pdf-parse`  | Extract text and metadata from PDFs |
| `pdf-to-img` | Convert PDF pages to PNG images     |
| `pixelmatch` | Pixel-by-pixel image comparison     |
| `pngjs`      | PNG image processing                |

---

## Content Validation Tests

Content validation extracts text from PDFs and verifies data accuracy.

### Original Invoice Tests (16 tests)

#### Field Presence Tests

```javascript
test("should contain invoice header");
test("should contain employee name");
test("should contain start date");
test("should contain department information");
test("should contain billing month");
test("should contain email address");
test("should contain days billed");
```

**Purpose**: Verify all required fields exist in the invoice.

**Why Important**: Missing fields can cause payment processing failures or compliance issues.

---

#### Financial Data Tests

```javascript
test("should contain all payable items");
test("should contain all deduction items");
test("should contain total income");
test("should contain total deductions");
test("should contain Net Bill with correct amount");
```

**Purpose**: Validate all financial line items and totals are present.

**Why Important**: Financial documents must contain complete, accurate data for accounting and auditing.

---

### Total Missing Tests (3 tests)

Tests for invoice with Net Bill line completely removed.

```javascript
test('should have all content except Net Bill');
test('should be MISSING the Net Bill line');
test('should FAIL validation when checking for Net Bill');
```

**What it detects**: Missing required financial summary fields.

---

### Logo Missing Tests (3 tests)

Tests for invoice with company logo image removed. All text content is identical to original.

```javascript
test('should have all text content present (same as original)');
test('should have Net Bill present with correct calculation');
test('should FAIL visual comparison against original (missing logo detected)');
```

**Key Point**: Content tests pass (text is complete), but visual comparison fails. This demonstrates that **visual testing is essential for detecting missing images**.

---

### Wrong Logo Tests (5 tests)

Tests for invoice with a different/wrong logo image instead of the original. All text content is identical to original.

```javascript
test('should have all text content present (identical to original)');
test('should have Net Bill present with correct amount');
test('should have correct calculation (Total Income - Deductions = Net Bill)');
test('should be significantly larger than original (different logo image)');
test('should FAIL visual comparison against original (wrong logo detected)');
```

**What it detects**: Different logo image without changes to text content.

**Key Metrics**:
- File size difference: 135KB larger (201,613 vs 66,568 bytes)
- Visual difference: 12.36% (239,714 pixels differ)
- Ranked slightly larger than logo-missing (11.17%) due to bigger image

---

### Wrong Calculations Tests (3 tests)

Tests for invoice with incorrect Net Bill calculation (shows 515.00 instead of 510.00).

```javascript
test('should have all fields present including Net Bill');
test('should FAIL calculation validation (515 - 5 != 515)');
test('should detect calculation error with detailed report');
```

**What it detects**: Mathematical errors in invoice totals.

**Why Important**: Catches billing errors before they reach customers. Nearly invisible visually (0% diff) but critical to catch with content validation.

---

## Visual Comparison Tests

Visual tests convert PDFs to images and compare against baselines to detect visual changes.

### How Visual Testing Works

1. **Convert PDF to Image**: Render each PDF page to a PNG image
2. **Compare Pixels**: Perform pixel-by-pixel comparison against baseline image
3. **Report Differences**: Calculate difference percentage and pixel count
4. **Generate Diff Image**: Create visual map showing what changed

### Visual Difference Summary

| PDF Variant | Visual Difference | Detection Method |
|-------------|-------------------|------------------|
| wrong-calculations.pdf | ~0% | Content validation |
| total-missing.pdf | 0.38% | Both methods |
| logo-missing.pdf | 11.17% | Visual comparison |
| wrong-logo.pdf | 12.36% | Visual comparison |

**Key Insight**: Wrong calculations are nearly invisible visually but easily caught by content validation. Missing or wrong images require visual testing.

---

## Best Practices

### Content Testing

1. **Validate Critical Fields First**
   - Invoice numbers, amounts, dates
   - Customer/recipient information
   - Totals and calculations

2. **Use Calculation Validation**
   ```javascript
   const expected = totalIncome - totalDeductions;
   expect(actualNetBill).toBe(expected);
   ```

3. **Test for Absence of Sensitive Data**
   ```javascript
   await pdfPage.expectPdfNotContainsText(pdfPath, ['password', 'SSN']);
   ```

### Visual Testing

1. **Create Baselines from Correct PDFs**
   - Never baseline a defective document
   - Review baselines before committing

2. **Combine Both Approaches**
   - Content tests catch data errors (calculations, missing fields)
   - Visual tests catch presentation errors (missing logos, layout shifts, wrong images)

### When to Use Which

- **Content Testing**: Data validation, calculations, field presence
- **Visual Testing**: Logo/image detection, layout verification, rendering changes
- **Both**: Comprehensive validation ensures nothing is missed

### Example: Wrong Logo Detection

```javascript
// Content tests pass - all text is identical
await pdfPage.expectPdfContainsText(pdfPath, ['John Doe', 'Finance', 'Net Bill', 'PKR 510.00']);

// But visual tests fail - different image
const result = compareImages(originalImage, wrongLogoImage);
expect(result.match).toBe(false); // 12.36% different
expect(result.diffPercentage).toBeGreaterThan(5);
```

**This demonstrates**: Visual testing catches presentation errors that content testing misses. Wrong images don't affect extractable text but are critical to document appearance.

---

## Running Tests

### All PDF Tests

```bash
npm run test:e2e -- --grep "PDF"
```

### Content Tests Only

```bash
npm run test:e2e -- --grep "Invoice Validation"
```

### Visual Tests Only

```bash
npm run test:e2e -- --grep "Visual"
```

### Specific Invoice Tests

```bash
# Original invoice tests
npm run test:e2e -- --grep "Original Invoice"

# Logo-related tests
npm run test:e2e -- --grep "Logo"

# Wrong Logo tests
npm run test:e2e -- --grep "Wrong Logo"

# Calculation tests
npm run test:e2e -- --grep "Calculation"

# Total Missing tests
npm run test:e2e -- --grep "Total Missing"
```

### Update Visual Baselines

```bash
UPDATE_SNAPSHOTS=true npm run test:e2e -- --grep "Visual"
```

### Local Maintenance Tests

The following tests are designed to run locally and are **intentionally skipped on GitHub Actions**. They require explicit environment variables to run.

#### Generate All Baselines

Creates baseline images for all PDF variants. Use this when you:
- First set up the testing environment
- Add new PDF variants
- Update baseline images after intentional changes

```bash
GENERATE_BASELINES=true npm run test:e2e -- --grep "generate all"
```

**What it does:**
- Converts each PDF variant to a PNG image
- Saves the image as a visual baseline for future comparisons
- Overwrites existing baselines if they already exist

**When to run:**
- During initial setup to create baselines
- After adding new test PDFs
- After making intentional visual changes and verifying they're correct

**Important**: Always review baseline images before committing them. Never baseline a defective document.

---

#### Cleanup Diff Images

Removes temporary diff images generated during visual comparison debugging. These are helper images created by failed tests.

```bash
CLEANUP_DIFFS=true npm run test:e2e -- --grep "cleanup"
```

**What it does:**
- Finds all diff images (files ending with `-diff.png`)
- Deletes them from the snapshots directory
- Outputs a count of removed files

**When to run:**
- After debugging visual comparison failures
- When cleaning up temporary test artifacts
- Before committing test results

**Example flow:**
```bash
# 1. Run tests - some fail with diff images created
npm run test:e2e -- --grep "Visual"

# 2. Inspect the diff images to understand failures
# (files saved in e2e/fixtures/snapshots/)

# 3. Fix the issues

# 4. Clean up the temporary diff images
CLEANUP_DIFFS=true npm run test:e2e -- --grep "cleanup"

# 5. Run tests again to verify fixes
npm run test:e2e -- --grep "Visual"
```

---

#### List Existing Baselines

Shows all currently saved baseline images without modifying anything.

```bash
npm run test:e2e -- --grep "list existing"
```

**What it does:**
- Reads the snapshots directory
- Lists all baseline PNG files
- Shows the count of baselines

**When to run:**
- To verify which baselines are currently saved
- Before generating new baselines (to see what already exists)
- To audit visual baselines in version control

---

### Why These Tests Are Skipped on GitHub Actions

These tests are **intentionally skipped in CI/CD** because:

1. **Generate Baselines** requires developer judgment
   - Baselines must be reviewed before committing
   - Automated generation risks committing defective baselines
   - Only developers know when a visual change is intentional

2. **Cleanup Diffs** is maintenance, not validation
   - Not part of the test suite verification
   - Should be run manually before committing
   - Prevents accidentally committing debug artifacts

3. **Environment Control**
   - GitHub Actions doesn't set `GENERATE_BASELINES` or `CLEANUP_DIFFS` environment variables
   - This prevents accidental baseline overwrites in CI/CD
   - Local developers have explicit control via command-line flags

---

### Test Organization

1. **Group by PDF Type**

   ```javascript
   test.describe('Original Invoice - All Fields Present', () => { ... });
   test.describe('Total Missing - Error Detection', () => { ... });
   ```

2. **Use Descriptive Test Names**

   ```javascript
   test("should FAIL calculation validation (515 - 5 != 515)");
   test("should FAIL visual comparison against original (missing logo)");
   ```

3. **Log Diagnostic Information**
   ```javascript
   console.log(`Difference: ${result.diffPercentage}%`);
   console.log(`Expected: ${expected}, Actual: ${actual}`);
   ```

---

## Summary

This PDF testing suite validates invoices through two complementary approaches:

| Category               | Coverage                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| **Content Validation** | Text extraction, field presence, calculations, financial accuracy |
| **Visual Comparison**  | Layout changes, images, formatting, visual regressions            |

### Detection Capabilities

| Defect Type           | Content Test    | Visual Test | Best Method |
| --------------------- | --------------- | ----------- | ----------- |
| Missing fields        | ✓ Detects       | ✓ Detects   | Content     |
| Wrong calculations    | ✓ Detects       | ✗ Misses    | **Content** |
| Missing images/logo   | ✗ Cannot detect | ✓ Detects   | **Visual**  |
| Wrong/different image | ✗ Cannot detect | ✓ Detects   | **Visual**  |
| Layout changes        | ✗ Misses        | ✓ Detects   | **Visual**  |

### Test Coverage Summary

**Content Validation Tests**:
- Original Invoice: 5 tests (field presence, financial data, calculations, system notes)
- Total Missing: 3 tests (content validation without Net Bill)
- Logo Missing: 3 tests (text completeness with missing visual)
- Wrong Logo: 5 tests (text completeness, file size difference, visual comparison)
- Wrong Calculations: 3 tests (field validation, calculation error detection)
- Cross-PDF Validation: 3 tests (consistency checks, Net Bill status)
- Calculation Validator: 5 tests (validation helper for all invoices)

**Visual Comparison Tests**:
- Original Invoice: 4 tests (baseline creation, image quality)
- Logo Missing: 3 tests (visual defect detection)
- Wrong Logo: 3 tests (visual defect detection)
- Total Missing: 2 tests (layout difference)
- Wrong Calculations: 2 tests (minimal visual difference)
- Cross-PDF Analysis: 3 tests (matrix comparison, PNG validation)
- Baseline Management: 3 tests (baseline generation, cleanup)

### Key Insights

**Use Content Testing For**:
- Validating invoice amounts and calculations
- Ensuring required fields are present
- Detecting mathematical errors

**Use Visual Testing For**:
- Detecting missing images or logos
- Identifying wrong/different images
- Catching layout or formatting changes
- Detecting visual rendering issues

**Both Together Ensure**:
- Complete data validation
- Presentation integrity
- Early detection of document generation errors
- Comprehensive test coverage across data and visual aspects
