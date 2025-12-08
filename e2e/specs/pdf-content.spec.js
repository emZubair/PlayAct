import { test, expect } from '@playwright/test';
import { PdfPage } from '../pages/pdf.page.js';

/**
 * PDF Content Validation Tests
 *
 * Test PDFs:
 * - Invoice.pdf: Original correct invoice (baseline)
 * - total-missing.pdf: Invoice with Net Bill total missing
 * - logo-missing.pdf: Invoice with company logo missing (detected via visual comparison)
 * - wrong-calculations.pdf: Invoice with incorrect Net Bill calculation
 */

test.describe('PDF Invoice Validation', () => {
  let pdfPage;

  test.beforeEach(async ({ page }) => {
    pdfPage = new PdfPage(page);
  });

  // ============================================================================
  // ORIGINAL INVOICE - Complete Validation
  // ============================================================================
  test.describe('Original Invoice (Invoice.pdf)', () => {
    const invoiceFile = 'Invoice.pdf';

    test('should have correct structure and page count', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfPageCount(pdfPath, 1);
    });

    test('should contain all header and employee information', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfContainsText(pdfPath, [
        'Invoice',
        'John Doe',
        'Start Date', '01/10/2024',
        'Department', 'Finance',
        'Month', 'May / 2025',
        'Email', 'john@doe.co',
        'Days Billed', '26.00',
      ]);
    });

    test('should contain all financial data (payables, deductions, totals)', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfContainsText(pdfPath, [
        // Payables
        'Payable', 'Total Expanse', '500.00', 'Service', '10.00', 'Miscal', '5.00',
        // Deductions
        'Deductions', 'Package Discount', '5.00', 'Other Deductions', '0.00',
        // Totals
        'Total Income', '515.00',
        'Total Deductions', '5.00',
        'Net Bill', 'PKR', '510.00',
      ]);
    });

    test('should have correct calculation (Total Income - Deductions = Net Bill)', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      const text = await pdfPage.extractText(pdfPath);

      const totalIncome = parseFloat(text.match(/Total Income\s+([\d.]+)/)[1]);
      const totalDeductions = parseFloat(text.match(/Total Deductions\s+([\d.]+)/)[1]);
      const netBill = parseFloat(text.match(/Net Bill:\s*PKR\s+([\d.]+)/)[1]);

      expect(netBill).toBe(totalIncome - totalDeductions);
    });

    test('should contain system generated note', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfContainsText(pdfPath, [
        'system-generated document',
        'does not require a physical stamp or signature',
      ]);
    });
  });

  // ============================================================================
  // TOTAL MISSING - Should Fail Net Bill Validation
  // ============================================================================
  test.describe('Total Missing Invoice (total-missing.pdf)', () => {
    const invoiceFile = 'total-missing.pdf';

    test('should have all content except Net Bill', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfContainsText(pdfPath, [
        'Invoice', 'John Doe', 'Start Date', 'Department', 'Finance',
        'Total Expanse', '500.00', 'Service', '10.00', 'Miscal', '5.00',
        'Total Income', '515.00', 'Total Deductions', '5.00',
      ]);
    });

    test('should be MISSING the Net Bill line', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfNotContainsText(pdfPath, ['Net Bill']);
    });

    test('should FAIL validation when checking for Net Bill', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      const validation = await pdfPage.validateContent(pdfPath, ['Net Bill', '510.00']);

      expect(validation.allFound).toBe(false);
      expect(validation.missing).toContain('Net Bill');
      expect(validation.missing).toContain('510.00');
    });
  });

  // ============================================================================
  // LOGO MISSING - Detected via Visual Comparison (not content)
  // ============================================================================
  test.describe('Logo Missing Invoice (logo-missing.pdf)', () => {
    const invoiceFile = 'logo-missing.pdf';

    test('should have all text content identical to original', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfContainsText(pdfPath, [
        'Invoice', 'John Doe', 'Start Date', '01/10/2024',
        'Department', 'Finance', 'Month', 'May / 2025',
        'Email', 'john@doe.co', 'Days Billed', '26.00',
        'Net Bill', 'PKR', '510.00',
      ]);
    });

    test('should pass calculation validation (logo does not affect data)', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      const text = await pdfPage.extractText(pdfPath);

      const netBillMatch = text.match(/Net Bill:\s*PKR\s+([\d.]+)/);
      expect(netBillMatch).not.toBeNull();
      expect(parseFloat(netBillMatch[1])).toBe(510.00);
    });

    test('should FAIL visual comparison against original (missing logo detected)', async () => {
      const originalPath = pdfPage.getPdfFixture('Invoice.pdf');
      const logoMissingPath = pdfPage.getPdfFixture(invoiceFile);

      const originalImages = await pdfPage.convertPdfToImages(originalPath);
      const logoMissingImages = await pdfPage.convertPdfToImages(logoMissingPath);

      const { compareImages } = await import('../utils/pdf.utils.js');
      const result = compareImages(originalImages[0], logoMissingImages[0], { threshold: 0.1 });

      // Should NOT match - logo is missing
      expect(result.match).toBe(false);

      // Should have significant visual difference (logo area ~11%)
      const diffPercentage = parseFloat(result.diffPercentage);
      expect(diffPercentage).toBeGreaterThan(5);
      expect(diffPercentage).toBeLessThan(20);

      console.log(`Missing logo detected: ${result.diffPercentage}% difference (${result.numDiffPixels} pixels)`);
    });
  });

  // ============================================================================
  // WRONG LOGO - Visual Defect Detection (Wrong Image, Not Missing)
  // ============================================================================
  test.describe('Wrong Logo Invoice (wrong-logo.pdf)', () => {
    const invoiceFile = 'wrong-logo.pdf';

    test('should have all text content present (identical to original)', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfContainsText(pdfPath, [
        'Invoice', 'John Doe', 'Start Date', 'Department', 'Finance',
        'Total Expanse', '500.00', 'Service', '10.00', 'Miscal', '5.00',
        'Total Income', '515.00', 'Total Deductions', '5.00',
      ]);
    });

    test('should have Net Bill present with correct amount', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      const text = await pdfPage.extractText(pdfPath);

      const netBillMatch = text.match(/Net Bill:\s*PKR\s+([\d.]+)/);
      expect(netBillMatch).not.toBeNull();
      expect(parseFloat(netBillMatch[1])).toBe(510.00);
    });

    test('should have correct calculation (Total Income - Deductions = Net Bill)', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      const text = await pdfPage.extractText(pdfPath);

      const totalIncome = parseFloat(text.match(/Total Income\s+([\d.]+)/)[1]);
      const totalDeductions = parseFloat(text.match(/Total Deductions\s+([\d.]+)/)[1]);
      const netBill = parseFloat(text.match(/Net Bill:\s*PKR\s+([\d.]+)/)[1]);

      expect(netBill).toBe(totalIncome - totalDeductions);
    });

    test('should be significantly larger than original (different logo image)', async () => {
      const originalPath = pdfPage.getPdfFixture('Invoice.pdf');
      const wrongLogoPath = pdfPage.getPdfFixture(invoiceFile);

      const { getFileSize } = await import('../utils/pdf.utils.js');
      const originalSize = getFileSize(originalPath);
      const wrongLogoSize = getFileSize(wrongLogoPath);

      // Wrong logo PDF should be significantly larger due to different image
      const sizeDifference = wrongLogoSize - originalSize;
      expect(sizeDifference).toBeGreaterThan(100000); // At least 100KB larger

      console.log(`File size comparison:
        Original: ${originalSize} bytes
        Wrong logo: ${wrongLogoSize} bytes
        Difference: ${sizeDifference} bytes`);
    });

    test('should FAIL visual comparison against original (wrong logo detected)', async () => {
      const originalPath = pdfPage.getPdfFixture('Invoice.pdf');
      const wrongLogoPath = pdfPage.getPdfFixture(invoiceFile);

      const originalImages = await pdfPage.convertPdfToImages(originalPath);
      const wrongLogoImages = await pdfPage.convertPdfToImages(wrongLogoPath);

      const { compareImages } = await import('../utils/pdf.utils.js');
      const result = compareImages(originalImages[0], wrongLogoImages[0], { threshold: 0.1 });

      // Should NOT match - logo is different
      expect(result.match).toBe(false);

      // Should have visual difference (logo area likely >10%)
      const diffPercentage = parseFloat(result.diffPercentage);
      expect(diffPercentage).toBeGreaterThan(5);

      console.log(`Wrong logo detected: ${result.diffPercentage}% difference (${result.numDiffPixels} pixels)`);
    });
  });

  // ============================================================================
  // WRONG CALCULATIONS - Math Error Detection
  // ============================================================================
  test.describe('Wrong Calculations Invoice (wrong-calculations.pdf)', () => {
    const invoiceFile = 'wrong-calculations.pdf';

    test('should have all fields present including Net Bill', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      await pdfPage.expectPdfContainsText(pdfPath, [
        'Invoice', 'John Doe',
        'Total Income', '515.00',
        'Total Deductions', '5.00',
        'Net Bill', 'PKR', '515.00', // Wrong value
      ]);
    });

    test('should FAIL calculation validation (515 - 5 != 515)', async () => {
      const pdfPath = pdfPage.getPdfFixture(invoiceFile);
      const text = await pdfPage.extractText(pdfPath);

      const totalIncome = parseFloat(text.match(/Total Income\s+([\d.]+)/)[1]);
      const totalDeductions = parseFloat(text.match(/Total Deductions\s+([\d.]+)/)[1]);
      const netBill = parseFloat(text.match(/Net Bill:\s*PKR\s+([\d.]+)/)[1]);

      const expectedNetBill = totalIncome - totalDeductions;

      // Verify the calculation error
      expect(totalIncome).toBe(515.00);
      expect(totalDeductions).toBe(5.00);
      expect(expectedNetBill).toBe(510.00);
      expect(netBill).toBe(515.00); // Wrong!
      expect(netBill).not.toBe(expectedNetBill);

      console.log(`Calculation error: Expected ${expectedNetBill}, got ${netBill} (difference: ${netBill - expectedNetBill})`);
    });
  });

  // ============================================================================
  // CROSS-PDF VALIDATION
  // ============================================================================
  test.describe('Cross-PDF Validation', () => {
    test('all invoices should have same base content', async () => {
      const invoices = ['Invoice.pdf', 'total-missing.pdf', 'logo-missing.pdf', 'wrong-logo.pdf', 'wrong-calculations.pdf'];

      for (const invoice of invoices) {
        const pdfPath = pdfPage.getPdfFixture(invoice);
        await pdfPage.expectPdfContainsText(pdfPath, [
          'John Doe', 'Finance', '01/10/2024', 'May / 2025',
          'Total Expanse', '500.00', 'Service', '10.00', 'Miscal', '5.00',
          'Total Income', '515.00',
        ]);
      }
    });

    test('should correctly identify Net Bill status across all invoices', async () => {
      // Original, logo-missing, and wrong-logo have correct Net Bill
      for (const invoice of ['Invoice.pdf', 'logo-missing.pdf', 'wrong-logo.pdf']) {
        const text = await pdfPage.extractText(pdfPage.getPdfFixture(invoice));
        expect(parseFloat(text.match(/Net Bill:\s*PKR\s+([\d.]+)/)[1])).toBe(510.00);
      }

      // Wrong calculation has incorrect Net Bill
      const wrongText = await pdfPage.extractText(pdfPage.getPdfFixture('wrong-calculations.pdf'));
      expect(parseFloat(wrongText.match(/Net Bill:\s*PKR\s+([\d.]+)/)[1])).toBe(515.00);

      // Total missing has no Net Bill
      const missingText = await pdfPage.extractText(pdfPage.getPdfFixture('total-missing.pdf'));
      expect(missingText).not.toContain('Net Bill');
    });
  });

  // ============================================================================
  // CALCULATION VALIDATOR
  // ============================================================================
  test.describe('Calculation Validator', () => {
    async function validateInvoice(pdfPath) {
      const text = await pdfPage.extractText(pdfPath);

      const getValue = (regex) => {
        const match = text.match(regex);
        return match ? parseFloat(match[1]) : null;
      };

      const totalIncome = getValue(/Total Income\s+([\d.]+)/);
      const totalDeductions = getValue(/Total Deductions\s+([\d.]+)/);
      const netBill = getValue(/Net Bill:\s*PKR\s+([\d.]+)/);
      const expectedNetBill = totalIncome && totalDeductions ? totalIncome - totalDeductions : null;

      return {
        hasNetBill: netBill !== null,
        isCalculationCorrect: netBill === expectedNetBill,
        values: { totalIncome, totalDeductions, netBill, expectedNetBill },
      };
    }

    test('original invoice passes all validations', async () => {
      const result = await validateInvoice(pdfPage.getPdfFixture('Invoice.pdf'));
      expect(result.hasNetBill).toBe(true);
      expect(result.isCalculationCorrect).toBe(true);
    });

    test('total-missing fails hasNetBill', async () => {
      const result = await validateInvoice(pdfPage.getPdfFixture('total-missing.pdf'));
      expect(result.hasNetBill).toBe(false);
    });

    test('wrong-calculations fails isCalculationCorrect', async () => {
      const result = await validateInvoice(pdfPage.getPdfFixture('wrong-calculations.pdf'));
      expect(result.hasNetBill).toBe(true);
      expect(result.isCalculationCorrect).toBe(false);
      expect(result.values.netBill).toBe(515.00);
      expect(result.values.expectedNetBill).toBe(510.00);
    });

    test('logo-missing passes all validations (visual defect only)', async () => {
      const result = await validateInvoice(pdfPage.getPdfFixture('logo-missing.pdf'));
      expect(result.hasNetBill).toBe(true);
      expect(result.isCalculationCorrect).toBe(true);
    });

    test('wrong-logo passes all validations (visual defect only)', async () => {
      const result = await validateInvoice(pdfPage.getPdfFixture('wrong-logo.pdf'));
      expect(result.hasNetBill).toBe(true);
      expect(result.isCalculationCorrect).toBe(true);
    });
  });
});
