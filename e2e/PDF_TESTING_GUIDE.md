# PDF Testing Guide

A comprehensive guide to PDF validation testing using Playwright in the PlayAct project.

## Table of Contents

1. [Overview](#overview)
2. [Test PDFs](#test-pdfs)
3. [Architecture](#architecture)
4. [Content Validation Tests](#content-validation-tests)
5. [Visual Comparison Tests](#visual-comparison-tests)
6. [Running Tests](#running-tests)
7. [Best Practices](#best-practices)

---

## Overview

PDF testing validates that generated documents are accurate, complete, and visually correct. This test suite demonstrates two complementary approaches:

| Approach | Purpose | Detects |
|----------|---------|---------|
| **Content Validation** | Verify text, data, and calculations | Missing fields, wrong values, calculation errors |
| **Visual Comparison** | Detect layout and rendering changes | Missing images/logos, layout shifts, formatting issues |

### Why PDF Testing Matters

- **Data Integrity**: Ensure invoices contain accurate amounts and calculations
- **Completeness**: Verify all required fields are present
- **Visual Consistency**: Detect missing logos, images, or layout changes
- **Calculation Accuracy**: Catch mathematical errors before they reach customers
- **Regression Prevention**: Automatically detect unintended changes

---

## Test PDFs

This test suite uses 4 invoice variants to demonstrate different validation scenarios:

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

### total-missing.pdf (Missing Net Bill)
Invoice with the "Net Bill" line completely removed.

| Field | Status |
|-------|--------|
| Header info | ✓ Present |
| Payable items | ✓ Present |
| Deductions | ✓ Present |
| Total Income | ✓ Present |
| **Net Bill** | ✗ **MISSING** |

**Detection Method**: Content validation - check for absence of "Net Bill" text

### logo-missing.pdf (Missing Logo Image)
Invoice with company logo removed. All text content is identical to original.

| Aspect | Original | Logo Missing |
|--------|----------|--------------|
| File size | 66,568 bytes | 63,087 bytes |
| Text content | Complete | Complete |
| Logo image | ✓ Present | ✗ **MISSING** |
| Visual difference | - | **11.17%** |

**Detection Method**: **Visual comparison is the primary method** - 11.17% pixel difference (216,487 pixels). File size difference (3KB smaller) is only a secondary hint since content tests cannot detect missing images.

### wrong-calculations.pdf (Calculation Error)
Invoice with incorrect Net Bill amount (shows 515.00 instead of 510.00).

| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| Total Income | 515.00 | 515.00 | ✓ |
| Total Deductions | 5.00 | 5.00 | ✓ |
| Net Bill | 510.00 | **515.00** | ✗ **WRONG** |

**Detection Method**: Calculation validation - verify `Total Income - Deductions = Net Bill`

---

## Architecture

```
e2e/
├── utils/
│   └── pdf.utils.js          # PDF parsing and comparison utilities
├── pages/
│   └── pdf.page.js           # Page Object Model for PDF operations
├── specs/
│   ├── pdf-content.spec.js   # Content validation tests (41 tests)
│   └── pdf-visual.spec.js    # Visual comparison tests (17 tests)
└── fixtures/
    ├── pdfs/                 # Test PDF files
    │   ├── Invoice.pdf
    │   ├── total-missing.pdf
    │   ├── logo-missing.pdf
    │   └── wrong-calculations.pdf
    └── snapshots/            # Visual baseline images
        ├── original-invoice-page-1.png
        └── logo-missing-vs-original-diff.png
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `pdf-parse` | Extract text and metadata from PDFs |
| `pdf-to-img` | Convert PDF pages to PNG images |
| `pixelmatch` | Pixel-by-pixel image comparison |
| `pngjs` | PNG image processing |

---

## Content Validation Tests

Content validation extracts text from PDFs and verifies data accuracy.

### Original Invoice Tests (16 tests)

#### Field Presence Tests
```javascript
test('should contain invoice header')
test('should contain employee name')
test('should contain start date')
test('should contain department information')
test('should contain billing month')
test('should contain email address')
test('should contain days billed')
```
**Purpose**: Verify all required fields exist in the invoice.

**Why Important**: Missing fields can cause payment processing failures or compliance issues.

---

#### Financial Data Tests
```javascript
test('should contain all payable items')
test('should contain all deduction items')
test('should contain total income')
test('should contain total deductions')
test('should contain Net Bill with correct amount')
```
**Purpose**: Validate all financial line items and totals are present.

**Why Important**: Financial documents must contain complete, accurate data for accounting and auditing.

---

#### Calculation Validation
```javascript
test('should have correct calculation (Total Income - Deductions = Net Bill)')
```
**What it tests**:
```javascript
const totalIncome = 515.00;      // Extracted from PDF
const totalDeductions = 5.00;    // Extracted from PDF
const netBill = 510.00;          // Extracted from PDF
const expected = totalIncome - totalDeductions; // 510.00

expect(netBill).toBe(expected);  // ✓ Pass
```

**Why Important**: Calculation errors in invoices can lead to:
- Customer disputes
- Revenue loss
- Legal/compliance issues
- Loss of customer trust

---

### Total Missing Tests (7 tests)

#### Detecting Missing Content
```javascript
test('should be MISSING the Net Bill line')
```
**What it tests**: Confirms "Net Bill" text is absent from the PDF.

```javascript
await pdfPage.expectPdfNotContainsText(pdfPath, ['Net Bill']);
```

**Why Important**: Invoices without totals are invalid and cannot be processed.

---

#### Validation Failure Detection
```javascript
test('should FAIL when expecting Net Bill to be present')
```
**What it tests**: Demonstrates how validation catches missing required fields.

```javascript
const validation = await pdfPage.validateContent(pdfPath, ['Net Bill']);
expect(validation.allFound).toBe(false);
expect(validation.missing).toContain('Net Bill');
```

**Why Important**: Shows how automated tests catch document generation failures.

---

### Logo Missing Tests (6 tests)

> **Note**: Content tests (text extraction) cannot detect missing images since images don't contain extractable text. **Visual comparison is the primary method** for detecting missing logos.

#### Text Completeness (3 tests)
```javascript
test('should have all text content present (same as original)')
test('should have Net Bill present (text is complete)')
test('should have correct calculation')
```
**Purpose**: Verify that missing logo doesn't affect text content.

**Why Important**: Confirms the defect is isolated to the visual element only.

---

#### Visual Comparison Detection (2 tests)
```javascript
test('should FAIL visual comparison against original (missing logo)')
test('should detect logo area represents significant portion of page')
```
**What it tests**:
```javascript
// Convert PDFs to images
const originalImages = await pdfPage.convertPdfToImages(originalPath);
const logoMissingImages = await pdfPage.convertPdfToImages(logoMissingPath);

// Compare visually
const result = compareImages(originalImages[0], logoMissingImages[0], {
  threshold: 0.1,
});

// Should NOT match - logo is missing
expect(result.match).toBe(false);
expect(parseFloat(result.diffPercentage)).toBeGreaterThan(5); // ~11%
```

**Output**:
```
Logo missing detected via visual comparison:
  Visual difference: 11.17%
  Different pixels: 216487
```

**Why Important**: Visual comparison is the **definitive test** for missing images. It detects exactly what's different and where.

---

#### File Size Hint (1 test)
```javascript
test('file size hint: should be smaller due to missing logo image')
```
**What it tests**:
```javascript
const originalSize = 66568;     // With logo
const logoMissingSize = 63087;  // Without logo
const difference = originalSize - logoMissingSize; // 3481 bytes

expect(difference).toBeGreaterThan(3000); // ✓ Pass
```

**Why Important**: File size is a **secondary indicator** that embedded images may be missing. It's a quick check but visual comparison provides the definitive answer.

---

### Wrong Calculations Tests (6 tests)

#### Error Detection
```javascript
test('should FAIL calculation validation (515 - 5 != 515)')
```
**What it tests**:
```javascript
const totalIncome = 515.00;
const totalDeductions = 5.00;
const netBill = 515.00;  // WRONG - should be 510.00
const expected = totalIncome - totalDeductions; // 510.00

expect(netBill).not.toBe(expected); // ✓ Correctly detects error
```

**Why Important**: Catches mathematical errors that could result in incorrect billing.

---

#### Detailed Error Reporting
```javascript
test('should detect calculation error with detailed report')
```
**Output**:
```
Calculation Validation Report:
  Total Income: 515
  Total Deductions: 5
  Expected Net Bill: 510
  Actual Net Bill: 515
  Difference: 5
  Is Correct: false
```

**Why Important**: Provides clear diagnostic information for debugging.

---

### Cross-PDF Validation (4 tests)

#### Consistency Checks
```javascript
test('all invoices should have same header information')
test('all invoices should have same payable items')
```
**Purpose**: Verify base data is consistent across all variants.

---

#### Comparative Analysis
```javascript
test('only original and logo-missing should have correct Net Bill')
test('should rank file sizes correctly (logo missing = smallest)')
```
**Output**:
```javascript
File sizes: {
  original: 66568,
  totalMissing: 64822,
  logoMissing: 63087,    // Smallest (no logo image)
  wrongCalc: 66568       // Same as original
}
```

---

### Invoice Calculation Validator (4 tests)

A comprehensive validation helper that checks all invoice math:

```javascript
async function validateInvoiceCalculations(pdfPath) {
  // Extract all values
  // Calculate expected totals
  // Return validation report
  return {
    values: { totalExpense, service, miscal, ... },
    expected: { totalIncome, totalDeductions, netBill },
    isValid: {
      totalIncome: true/false,
      totalDeductions: true/false,
      netBill: true/false,
      hasNetBill: true/false
    }
  };
}
```

| Invoice | totalIncome | totalDeductions | netBill | hasNetBill |
|---------|-------------|-----------------|---------|------------|
| Invoice.pdf | ✓ | ✓ | ✓ | ✓ |
| total-missing.pdf | ✓ | ✓ | - | ✗ |
| logo-missing.pdf | ✓ | ✓ | ✓ | ✓ |
| wrong-calculations.pdf | ✓ | ✓ | ✗ | ✓ |

---

## Visual Comparison Tests

Visual tests convert PDFs to images and compare against baselines to detect visual changes.

### How It Works

```
PDF → pdf-to-img → PNG Image → pixelmatch → Comparison Result
                                    ↓
                            Baseline Image
```

1. **Convert**: PDF pages rendered to PNG at 2x scale
2. **Compare**: Pixel-by-pixel comparison against baseline
3. **Report**: Difference percentage and pixel count
4. **Diff Image**: Visual highlighting of differences

---

### Original Invoice Visual Tests (4 tests)

#### Baseline Creation
```javascript
test('should create/match visual baseline')
```
**First Run**: Creates baseline image at `fixtures/snapshots/original-invoice-page-1.png`

**Subsequent Runs**: Compares against baseline, fails if different.

---

#### Image Quality Validation
```javascript
test('should produce valid PNG image')
test('should have minimum image quality')
```
**Purpose**: Ensure converted images are valid and readable.

---

### Logo Missing Visual Tests (5 tests)

#### Visual Difference Detection
```javascript
test('should FAIL when compared against original invoice baseline')
```
**What it detects**:
```
Visual difference detected: 11.17%
Different pixels: 216,487
```

**Diff Image**: Saved to `fixtures/snapshots/logo-missing-vs-original-diff.png`

---

#### Quantifying the Difference
```javascript
test('should have significant visual difference from original')
test('should detect logo area as the main difference')
```
**Output**:
```
Logo Missing vs Original:
  Difference: 11.17%
  Different pixels: 216,487 / 1,938,816
```

**Why Important**: Visual tests catch issues that content tests miss (images, styling, layout).

---

### Total Missing Visual Tests (2 tests)

```javascript
test('should have minor visual difference from original (missing text line)')
test('should have less visual difference than logo-missing')
```
**Output**:
```
Visual difference comparison:
  Total missing: 0.38%
  Logo missing: 11.17%
```

**Why Important**: Confirms missing text has smaller visual impact than missing images.

---

### Wrong Calculations Visual Tests (2 tests)

```javascript
test('should have minimal visual difference (only number changed)')
test('should have smallest visual difference of all variants')
```
**Output**:
```
Wrong Calculations vs Original:
  Difference: 0.00%
  Different pixels: 79
```

**Why Important**: Shows that calculation errors are nearly invisible visually - content validation is essential.

---

### Visual Difference Summary

| PDF Variant | Visual Difference | Pixel Count | Detection Method |
|-------------|-------------------|-------------|------------------|
| wrong-calculations.pdf | 0.00% | 79 | Content validation only |
| total-missing.pdf | 0.38% | 7,459 | Both methods |
| logo-missing.pdf | 11.17% | 216,487 | Visual comparison best |

---

### Comparison Matrix

```
Visual Comparison Matrix:
======================================================================
Invoice.pdf vs total-missing.pdf: 0.38%
Invoice.pdf vs logo-missing.pdf: 11.17%
Invoice.pdf vs wrong-calculations.pdf: 0.00%
total-missing.pdf vs logo-missing.pdf: 10.90%
total-missing.pdf vs wrong-calculations.pdf: 0.38%
logo-missing.pdf vs wrong-calculations.pdf: 11.17%
```

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

# Error detection tests
npm run test:e2e -- --grep "Error Detection"

# Calculation tests
npm run test:e2e -- --grep "Calculation"
```

### Update Visual Baselines
```bash
UPDATE_SNAPSHOTS=true npm run test:e2e -- --grep "Visual"
```

### Generate All Baselines
```bash
GENERATE_BASELINES=true npm run test:e2e -- --grep "generate all"
```

---

## Best Practices

### Content Testing

1. **Validate Critical Fields First**
   - Invoice number, amounts, dates
   - Customer/recipient information
   - Totals and calculations

2. **Use Calculation Validation**
   ```javascript
   const expected = totalIncome - totalDeductions;
   expect(actualNetBill).toBe(expected);
   ```

3. **Test for Absence of Sensitive Data**
   ```javascript
   await pdfPage.expectPdfNotContainsText(pdfPath, [
     'password', 'SSN', 'credit card'
   ]);
   ```

4. **Include Negative Tests**
   - Verify defective PDFs fail validation
   - Document expected failures

### Visual Testing

1. **Create Baselines from Correct PDFs**
   - Never baseline a defective document
   - Review baselines before committing

2. **Use Appropriate Tolerance**
   | Scenario | Tolerance |
   |----------|-----------|
   | Static templates | 0% |
   | Minor variations | 1-2% |
   | Dynamic content | 5%+ |

3. **Review Diff Images**
   - Always inspect visual failures before updating baselines
   - Diff images highlight exactly what changed

4. **Combine Both Approaches**
   - Content tests catch data errors (calculations)
   - Visual tests catch presentation errors (missing logo)

### Test Organization

1. **Group by PDF Type**
   ```javascript
   test.describe('Original Invoice - All Fields Present', () => { ... });
   test.describe('Total Missing - Error Detection', () => { ... });
   ```

2. **Use Descriptive Test Names**
   ```javascript
   test('should FAIL calculation validation (515 - 5 != 515)')
   test('should detect missing logo via file size comparison')
   ```

3. **Log Diagnostic Information**
   ```javascript
   console.log(`Difference: ${result.diffPercentage}%`);
   console.log(`Expected: ${expected}, Actual: ${actual}`);
   ```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "PDF fixture not found" | Missing test file | Add PDF to `e2e/fixtures/pdfs/` |
| Visual test always fails | No baseline exists | Run with `UPDATE_SNAPSHOTS=true` |
| Text not found in PDF | PDF contains images of text | Use visual comparison instead |
| Different results on CI | Font rendering varies | Increase tolerance or use Docker |

### Debugging Tips

```javascript
// Print extracted text
const text = await pdfPage.extractText(pdfPath);
console.log(text);

// Check file sizes
const { getFileSize } = await import('../utils/pdf.utils.js');
console.log('Size:', getFileSize(pdfPath));

// Save image for manual inspection
const images = await pdfPage.convertPdfToImages(pdfPath);
fs.writeFileSync('debug.png', images[0]);
```

---

## Summary

This PDF testing suite validates invoices through:

| Category | Tests | Coverage |
|----------|-------|----------|
| Content Validation | 42 | Text, fields, calculations, visual comparison for logo |
| Visual Comparison | 17 | Layout, images, formatting |
| **Total** | **59** | **Comprehensive** |

### Detection Capabilities

| Defect Type | Content Test | Visual Test | Best Method |
|-------------|--------------|-------------|-------------|
| Missing fields | ✓ Detects | ✓ Detects | Content |
| Wrong calculations | ✓ Detects | ✗ Misses | **Content** |
| Missing images/logo | ~ File size hint | ✓ Detects | **Visual** |
| Layout changes | ✗ Misses | ✓ Detects | **Visual** |

### Logo Detection Example

```javascript
// Visual comparison detects missing logo
const result = compareImages(originalImages[0], logoMissingImages[0]);

// Result:
//   match: false
//   diffPercentage: 11.17%
//   diffPixels: 216,487
```

**Key Insight**: Use both content and visual testing together for comprehensive PDF validation:
- **Content tests** catch data errors (missing fields, wrong calculations)
- **Visual tests** catch presentation errors (missing logos, layout shifts)
- For missing images, **visual comparison is the definitive test** - file size is only a hint
