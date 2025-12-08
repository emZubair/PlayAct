import { test, expect } from '@playwright/test';
import fs from 'fs';
import { PdfPage } from '../pages/pdf.page.js';
import {
  getSnapshotPath,
  getPdfFixturePath,
  fileExists,
  compareImages,
} from '../utils/pdf.utils.js';

/**
 * PDF Visual Comparison Tests
 *
 * Test PDFs:
 * - Invoice.pdf: Original correct invoice (baseline for visual comparison)
 * - logo-missing.pdf: Invoice with company logo missing (visual defect)
 * - total-missing.pdf: Invoice with Net Bill missing (minor visual difference)
 * - wrong-calculations.pdf: Invoice with wrong calculation (text difference only)
 *
 * Visual tests focus on detecting:
 * 1. Missing logo in logo-missing.pdf
 * 2. Layout differences between invoices
 * 3. Baseline creation and regression detection
 */

test.describe('PDF Visual Comparison', () => {
  let pdfPage;
  const updateSnapshots = process.env.UPDATE_SNAPSHOTS === 'true';

  test.beforeEach(async ({ page }) => {
    pdfPage = new PdfPage(page);
  });

  // ============================================================================
  // ORIGINAL INVOICE - Baseline Creation
  // ============================================================================
  test.describe('Original Invoice (Invoice.pdf) - Visual Baseline', () => {
    const invoiceFile = 'Invoice.pdf';
    const baselineName = 'original-invoice';

    test('should convert PDF to image successfully', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);
      const images = await pdfPage.convertPdfToImages(pdfPath);

      expect(images).toHaveLength(1);
      expect(images[0]).toBeInstanceOf(Buffer);
      expect(images[0].length).toBeGreaterThan(0);

      console.log(`Original invoice image size: ${images[0].length} bytes`);
    });

    test('should create/match visual baseline', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);

      const comparison = await pdfPage.comparePdfVisual(
        pdfPath,
        baselineName,
        {
          threshold: 0.1,
          tolerance: 0,
          updateSnapshots,
        }
      );

      expect(comparison.totalPages).toBe(1);

      if (comparison.results[0].status === 'baseline_created') {
        console.log(`Created baseline: ${comparison.results[0].path}`);
      }

      expect(comparison.allMatch).toBe(true);
    });

    test('should produce valid PNG image', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);
      const images = await pdfPage.convertPdfToImages(pdfPath);

      // Check PNG magic bytes: 89 50 4E 47
      expect(images[0][0]).toBe(0x89);
      expect(images[0][1]).toBe(0x50);
      expect(images[0][2]).toBe(0x4E);
      expect(images[0][3]).toBe(0x47);
    });

    test('should have minimum image quality', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);
      const images = await pdfPage.convertPdfToImages(pdfPath);

      // Image should be at least 50KB for good quality
      expect(images[0].length).toBeGreaterThan(50000);
    });
  });

  // ============================================================================
  // LOGO MISSING - Visual Defect Detection
  // ============================================================================
  test.describe('Logo Missing Invoice (logo-missing.pdf) - Visual Defect Detection', () => {
    const invoiceFile = 'logo-missing.pdf';
    const baselineName = 'logo-missing-invoice';

    test('should convert PDF to image successfully', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);
      const images = await pdfPage.convertPdfToImages(pdfPath);

      expect(images).toHaveLength(1);
      expect(images[0]).toBeInstanceOf(Buffer);
    });

    test('should create its own baseline', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);

      const comparison = await pdfPage.comparePdfVisual(
        pdfPath,
        baselineName,
        {
          threshold: 0.1,
          tolerance: 0,
          updateSnapshots,
        }
      );

      expect(comparison.totalPages).toBe(1);
      expect(comparison.allMatch).toBe(true);
    });

    test('should FAIL when compared against original invoice baseline', async () => {
      const originalPath = getPdfFixturePath('Invoice.pdf');
      const logoMissingPath = getPdfFixturePath(invoiceFile);

      // First ensure original baseline exists
      const originalBaseline = getSnapshotPath('original-invoice-page-1.png');
      if (!fileExists(originalBaseline)) {
        // Create baseline if needed
        await pdfPage.comparePdfVisual(originalPath, 'original-invoice', { updateSnapshots: true });
      }

      // Convert logo-missing PDF to image
      const logoMissingImages = await pdfPage.convertPdfToImages(logoMissingPath);

      // Read original baseline
      const originalImage = fs.readFileSync(originalBaseline);

      // Compare - should FAIL due to missing logo
      const result = compareImages(originalImage, logoMissingImages[0], {
        threshold: 0.1,
        tolerance: 0,
      });

      // Should NOT match - logo is missing
      expect(result.match).toBe(false);
      expect(parseFloat(result.diffPercentage)).toBeGreaterThan(0);

      console.log(`Visual difference detected: ${result.diffPercentage}%`);
      console.log(`Different pixels: ${result.numDiffPixels}`);

      // Save diff image for inspection
      if (result.diffImage) {
        const diffPath = getSnapshotPath('logo-missing-vs-original-diff.png');
        fs.writeFileSync(diffPath, result.diffImage);
        console.log(`Diff image saved: ${diffPath}`);
      }
    });

  });

  // ============================================================================
  // TOTAL MISSING - Minor Visual Difference
  // ============================================================================
  test.describe('Total Missing Invoice (total-missing.pdf) - Layout Difference', () => {
    const invoiceFile = 'total-missing.pdf';

    test('should have minor visual difference from original (missing text line)', async () => {
      const originalPath = getPdfFixturePath('Invoice.pdf');
      const totalMissingPath = getPdfFixturePath(invoiceFile);

      const originalImages = await pdfPage.convertPdfToImages(originalPath);
      const totalMissingImages = await pdfPage.convertPdfToImages(totalMissingPath);

      const result = compareImages(originalImages[0], totalMissingImages[0], {
        threshold: 0.1,
      });

      // Some difference due to missing "Net Bill" line
      expect(result.match).toBe(false);

      console.log('Total Missing vs Original:');
      console.log(`  Difference: ${result.diffPercentage}%`);
    });

    test('should have less visual difference than logo-missing', async () => {
      const originalPath = getPdfFixturePath('Invoice.pdf');
      const totalMissingPath = getPdfFixturePath(invoiceFile);
      const logoMissingPath = getPdfFixturePath('logo-missing.pdf');

      const originalImages = await pdfPage.convertPdfToImages(originalPath);
      const totalMissingImages = await pdfPage.convertPdfToImages(totalMissingPath);
      const logoMissingImages = await pdfPage.convertPdfToImages(logoMissingPath);

      const totalMissingDiff = compareImages(originalImages[0], totalMissingImages[0], { threshold: 0.1 });
      const logoMissingDiff = compareImages(originalImages[0], logoMissingImages[0], { threshold: 0.1 });

      // Missing text line is smaller visual change than missing logo image
      expect(parseFloat(totalMissingDiff.diffPercentage)).toBeLessThan(
        parseFloat(logoMissingDiff.diffPercentage)
      );

      console.log('Visual difference comparison:');
      console.log(`  Total missing: ${totalMissingDiff.diffPercentage}%`);
      console.log(`  Logo missing: ${logoMissingDiff.diffPercentage}%`);
    });
  });

  // ============================================================================
  // WRONG LOGO - Visual Defect Detection (Different Image)
  // ============================================================================
  test.describe('Wrong Logo Invoice (wrong-logo.pdf) - Visual Defect Detection', () => {
    const invoiceFile = 'wrong-logo.pdf';
    const baselineName = 'wrong-logo-invoice';

    test('should convert PDF to image successfully', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);
      const images = await pdfPage.convertPdfToImages(pdfPath);

      expect(images).toHaveLength(1);
      expect(images[0]).toBeInstanceOf(Buffer);
    });

    test('should create its own baseline', async () => {
      const pdfPath = getPdfFixturePath(invoiceFile);

      const comparison = await pdfPage.comparePdfVisual(
        pdfPath,
        baselineName,
        {
          threshold: 0.1,
          tolerance: 0,
          updateSnapshots,
        }
      );

      expect(comparison.totalPages).toBe(1);
      expect(comparison.allMatch).toBe(true);
    });

    test('should FAIL when compared against original invoice baseline', async () => {
      const originalPath = getPdfFixturePath('Invoice.pdf');
      const wrongLogoPath = getPdfFixturePath(invoiceFile);

      // First ensure original baseline exists
      const originalBaseline = getSnapshotPath('original-invoice-page-1.png');
      if (!fileExists(originalBaseline)) {
        // Create baseline if needed
        await pdfPage.comparePdfVisual(originalPath, 'original-invoice', { updateSnapshots: true });
      }

      // Convert wrong-logo PDF to image
      const wrongLogoImages = await pdfPage.convertPdfToImages(wrongLogoPath);

      // Read original baseline
      const originalImage = fs.readFileSync(originalBaseline);

      // Compare - should FAIL due to different logo
      const result = compareImages(originalImage, wrongLogoImages[0], {
        threshold: 0.1,
        tolerance: 0,
      });

      // Should NOT match - logo is different
      expect(result.match).toBe(false);
      expect(parseFloat(result.diffPercentage)).toBeGreaterThan(0);

      console.log(`Visual difference detected: ${result.diffPercentage}%`);
      console.log(`Different pixels: ${result.numDiffPixels}`);

      // Save diff image for inspection
      if (result.diffImage) {
        const diffPath = getSnapshotPath('wrong-logo-vs-original-diff.png');
        fs.writeFileSync(diffPath, result.diffImage);
        console.log(`Diff image saved: ${diffPath}`);
      }
    });
  });

  // ============================================================================
  // WRONG CALCULATIONS - Minimal Visual Difference
  // ============================================================================
  test.describe('Wrong Calculations Invoice (wrong-calculations.pdf) - Text Difference', () => {
    const invoiceFile = 'wrong-calculations.pdf';

    test('should have minimal visual difference (only number changed)', async () => {
      const originalPath = getPdfFixturePath('Invoice.pdf');
      const wrongCalcPath = getPdfFixturePath(invoiceFile);

      const originalImages = await pdfPage.convertPdfToImages(originalPath);
      const wrongCalcImages = await pdfPage.convertPdfToImages(wrongCalcPath);

      const result = compareImages(originalImages[0], wrongCalcImages[0], {
        threshold: 0.1,
      });

      // Very small difference - just "510.00" vs "515.00"
      console.log('Wrong Calculations vs Original:');
      console.log(`  Difference: ${result.diffPercentage}%`);
      console.log(`  Different pixels: ${result.numDiffPixels}`);

      // Should have some difference (the number changed)
      // but very small compared to logo/total missing
      expect(parseFloat(result.diffPercentage)).toBeLessThan(5);
    });

    test('should have smallest visual difference of all variants', async () => {
      const originalPath = getPdfFixturePath('Invoice.pdf');
      const originalImages = await pdfPage.convertPdfToImages(originalPath);

      const variants = [
        { file: 'total-missing.pdf', name: 'Total Missing' },
        { file: 'logo-missing.pdf', name: 'Logo Missing' },
        { file: 'wrong-logo.pdf', name: 'Wrong Logo' },
        { file: 'wrong-calculations.pdf', name: 'Wrong Calculations' },
      ];

      const differences = [];

      for (const variant of variants) {
        const variantPath = getPdfFixturePath(variant.file);
        const variantImages = await pdfPage.convertPdfToImages(variantPath);
        const result = compareImages(originalImages[0], variantImages[0], { threshold: 0.1 });

        differences.push({
          name: variant.name,
          percentage: parseFloat(result.diffPercentage),
          pixels: result.numDiffPixels,
        });
      }

      // Sort by difference percentage
      differences.sort((a, b) => a.percentage - b.percentage);

      console.log('Visual differences ranked (smallest to largest):');
      differences.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.name}: ${d.percentage}% (${d.pixels} pixels)`);
      });

      // Wrong calculations should be smallest (just a number change)
      expect(differences[0].name).toBe('Wrong Calculations');
    });
  });

  // ============================================================================
  // CROSS-PDF VISUAL COMPARISON
  // ============================================================================
  test.describe('Cross-PDF Visual Analysis', () => {
    test('should identify original as visually distinct from all variants', async () => {
      const originalPath = getPdfFixturePath('Invoice.pdf');
      const originalImages = await pdfPage.convertPdfToImages(originalPath);

      const variants = ['total-missing.pdf', 'logo-missing.pdf', 'wrong-logo.pdf', 'wrong-calculations.pdf'];

      for (const variant of variants) {
        const variantPath = getPdfFixturePath(variant);
        const variantImages = await pdfPage.convertPdfToImages(variantPath);

        const result = compareImages(originalImages[0], variantImages[0], {
          threshold: 0.1,
          tolerance: 0,
        });

        // All variants should have some visual difference
        expect(result.match).toBe(false);
        console.log(`${variant}: ${result.diffPercentage}% different`);
      }
    });

    test('should produce all valid PNG images', async () => {
      const pdfs = ['Invoice.pdf', 'total-missing.pdf', 'logo-missing.pdf', 'wrong-logo.pdf', 'wrong-calculations.pdf'];

      for (const pdf of pdfs) {
        const pdfPath = getPdfFixturePath(pdf);
        const images = await pdfPage.convertPdfToImages(pdfPath);

        // Check PNG magic bytes
        expect(images[0][0]).toBe(0x89);
        expect(images[0][1]).toBe(0x50);
        expect(images[0][2]).toBe(0x4E);
        expect(images[0][3]).toBe(0x47);
      }
    });

    test('should generate comparison matrix', async () => {
      const pdfs = ['Invoice.pdf', 'total-missing.pdf', 'logo-missing.pdf', 'wrong-logo.pdf', 'wrong-calculations.pdf'];
      const images = {};

      // Load all images
      for (const pdf of pdfs) {
        const pdfPath = getPdfFixturePath(pdf);
        const pdfImages = await pdfPage.convertPdfToImages(pdfPath);
        images[pdf] = pdfImages[0];
      }

      console.log('\nVisual Comparison Matrix:');
      console.log('=' .repeat(70));

      // Compare each pair
      for (let i = 0; i < pdfs.length; i++) {
        for (let j = i + 1; j < pdfs.length; j++) {
          const result = compareImages(images[pdfs[i]], images[pdfs[j]], { threshold: 0.1 });
          console.log(`${pdfs[i]} vs ${pdfs[j]}: ${result.diffPercentage}%`);
        }
      }
    });
  });

  // ============================================================================
  // BASELINE MANAGEMENT
  // ============================================================================
  test.describe('Baseline Management', () => {
    test('generate all baselines', async () => {
      test.skip(!process.env.GENERATE_BASELINES, 'Set GENERATE_BASELINES=true to run');

      const invoices = [
        { file: 'Invoice.pdf', name: 'original-invoice' },
        { file: 'total-missing.pdf', name: 'total-missing-invoice' },
        { file: 'logo-missing.pdf', name: 'logo-missing-invoice' },
        { file: 'wrong-logo.pdf', name: 'wrong-logo-invoice' },
        { file: 'wrong-calculations.pdf', name: 'wrong-calculations-invoice' },
      ];

      for (const { file, name } of invoices) {
        const pdfPath = getPdfFixturePath(file);

        if (!fileExists(pdfPath)) {
          console.log(`Skipping ${file} - not found`);
          continue;
        }

        console.log(`Generating baseline for ${file}...`);

        await pdfPage.comparePdfVisual(pdfPath, name, {
          updateSnapshots: true,
        });

        console.log(`Done: ${file}`);
      }
    });

    test('list existing baselines', async () => {
      const snapshotsDir = getSnapshotPath('');

      if (!fs.existsSync(snapshotsDir)) {
        console.log('No snapshots directory yet');
        return;
      }

      const files = fs.readdirSync(snapshotsDir);
      const pngFiles = files.filter(f => f.endsWith('.png'));

      console.log(`Found ${pngFiles.length} baseline snapshots:`);
      pngFiles.forEach(f => console.log(`  - ${f}`));

      expect(pngFiles.length).toBeGreaterThanOrEqual(0);
    });

    test('cleanup diff images', async () => {
      test.skip(!process.env.CLEANUP_DIFFS, 'Set CLEANUP_DIFFS=true to run');

      const snapshotsDir = getSnapshotPath('');

      if (!fs.existsSync(snapshotsDir)) {
        return;
      }

      const files = fs.readdirSync(snapshotsDir);
      const diffFiles = files.filter(f => f.includes('-diff.png'));

      for (const diffFile of diffFiles) {
        const diffPath = getSnapshotPath(diffFile);
        fs.unlinkSync(diffPath);
        console.log(`Deleted: ${diffFile}`);
      }

      console.log(`Cleaned up ${diffFiles.length} diff files`);
    });
  });
});
