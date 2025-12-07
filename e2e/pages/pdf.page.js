import { expect } from '@playwright/test';
import path from 'path';
import { BasePage } from './base.page.js';
import {
  parsePdfFromPath,
  parsePdfFromBuffer,
  extractPdfText,
  getPdfMetadata,
  validatePdfContent,
  validatePdfPageCount,
  searchPdfPattern,
  compareImages,
  saveDiffImage,
  readImageFile,
  saveToFile,
  fileExists,
  getFileSize,
  deleteFile,
  getPdfFixturePath,
  getSnapshotPath,
} from '../utils/pdf.utils.js';

/**
 * PDF Page Object Model
 * Provides methods for PDF download, content validation, and visual comparison
 */
export class PdfPage extends BasePage {
  constructor(page) {
    super(page);
    this.downloadPath = path.join(process.cwd(), 'e2e', 'downloads');
  }

  /**
   * Download a PDF by clicking a link/button and wait for download
   * @param {Function|string} triggerAction - Locator or async function to trigger download
   * @returns {Promise<Object>} Download object with path and suggestedFilename
   */
  async downloadPdf(triggerAction) {
    const downloadPromise = this.page.waitForEvent('download');

    if (typeof triggerAction === 'string') {
      await this.page.click(triggerAction);
    } else if (typeof triggerAction === 'function') {
      await triggerAction();
    } else {
      await triggerAction.click();
    }

    const download = await downloadPromise;
    const suggestedFilename = download.suggestedFilename();
    const downloadPath = path.join(this.downloadPath, suggestedFilename);

    await download.saveAs(downloadPath);

    return {
      path: downloadPath,
      filename: suggestedFilename,
      download,
    };
  }

  /**
   * Download PDF and get its buffer directly
   * @param {Function|string} triggerAction - Action to trigger download
   * @returns {Promise<Buffer>} PDF buffer
   */
  async downloadPdfAsBuffer(triggerAction) {
    const downloadPromise = this.page.waitForEvent('download');

    if (typeof triggerAction === 'string') {
      await this.page.click(triggerAction);
    } else if (typeof triggerAction === 'function') {
      await triggerAction();
    } else {
      await triggerAction.click();
    }

    const download = await downloadPromise;
    const stream = await download.createReadStream();

    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Fetch PDF from URL and return buffer
   * @param {string} url - URL of the PDF
   * @returns {Promise<Buffer>} PDF buffer
   */
  async fetchPdfFromUrl(url) {
    const response = await this.page.request.get(url);
    return await response.body();
  }

  /**
   * Parse PDF from file path
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<Object>} Parsed PDF data
   */
  async parsePdf(filePath) {
    return await parsePdfFromPath(filePath);
  }

  /**
   * Parse PDF from buffer
   * @param {Buffer} buffer - PDF buffer
   * @returns {Promise<Object>} Parsed PDF data
   */
  async parsePdfBuffer(buffer) {
    return await parsePdfFromBuffer(buffer);
  }

  /**
   * Extract text from PDF
   * @param {string|Buffer} source - File path or buffer
   * @returns {Promise<string>} Extracted text
   */
  async extractText(source) {
    return await extractPdfText(source);
  }

  /**
   * Get PDF metadata
   * @param {string|Buffer} source - File path or buffer
   * @returns {Promise<Object>} PDF metadata
   */
  async getMetadata(source) {
    return await getPdfMetadata(source);
  }

  /**
   * Validate PDF contains expected text(s)
   * @param {string|Buffer} source - File path or buffer
   * @param {string|string[]} expectedTexts - Expected text(s)
   * @returns {Promise<Object>} Validation result
   */
  async validateContent(source, expectedTexts) {
    return await validatePdfContent(source, expectedTexts);
  }

  /**
   * Validate PDF page count
   * @param {string|Buffer} source - File path or buffer
   * @param {number} expectedCount - Expected page count
   * @returns {Promise<Object>} Validation result
   */
  async validatePageCount(source, expectedCount) {
    return await validatePdfPageCount(source, expectedCount);
  }

  /**
   * Search for regex pattern in PDF
   * @param {string|Buffer} source - File path or buffer
   * @param {RegExp} pattern - Regex pattern
   * @returns {Promise<Object>} Search results
   */
  async searchPattern(source, pattern) {
    return await searchPdfPattern(source, pattern);
  }

  /**
   * Convert PDF pages to images using pdf-to-img
   * @param {string|Buffer} source - File path or buffer
   * @returns {Promise<Buffer[]>} Array of PNG buffers for each page
   */
  async convertPdfToImages(source) {
    const { pdf } = await import('pdf-to-img');
    const images = [];

    const document = typeof source === 'string'
      ? await pdf(source, { scale: 2 })
      : await pdf(source, { scale: 2 });

    for await (const image of document) {
      images.push(image);
    }

    return images;
  }

  /**
   * Compare PDF visual appearance with baseline
   * @param {string|Buffer} source - PDF file path or buffer
   * @param {string} baselineName - Name of baseline snapshot
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison result for each page
   */
  async comparePdfVisual(source, baselineName, options = {}) {
    const images = await this.convertPdfToImages(source);
    const results = [];

    for (let i = 0; i < images.length; i++) {
      const pageNum = i + 1;
      const snapshotName = `${baselineName}-page-${pageNum}.png`;
      const snapshotPath = getSnapshotPath(snapshotName);

      if (!fileExists(snapshotPath)) {
        // Save as new baseline if doesn't exist
        saveToFile(images[i], snapshotPath);
        results.push({
          page: pageNum,
          status: 'baseline_created',
          path: snapshotPath,
        });
      } else {
        // Compare with existing baseline
        const baseline = readImageFile(snapshotPath);
        const comparison = compareImages(baseline, images[i], options);

        if (!comparison.match && options.updateSnapshots) {
          // Update baseline if requested
          saveToFile(images[i], snapshotPath);
          results.push({
            page: pageNum,
            status: 'baseline_updated',
            path: snapshotPath,
            previousDiff: comparison.diffPercentage,
          });
        } else {
          // Save diff image if there are differences
          if (!comparison.match && comparison.diffImage) {
            const diffPath = getSnapshotPath(`${baselineName}-page-${pageNum}-diff.png`);
            saveDiffImage(comparison.diffImage, diffPath);
            comparison.diffImagePath = diffPath;
          }

          results.push({
            page: pageNum,
            status: comparison.match ? 'match' : 'mismatch',
            ...comparison,
          });
        }
      }
    }

    return {
      totalPages: images.length,
      results,
      allMatch: results.every(r => r.status === 'match' || r.status === 'baseline_created'),
    };
  }

  /**
   * Assert PDF contains text
   * @param {string|Buffer} source - PDF source
   * @param {string|string[]} expectedTexts - Expected text(s)
   */
  async expectPdfContainsText(source, expectedTexts) {
    const validation = await this.validateContent(source, expectedTexts);
    expect(validation.allFound, `PDF missing texts: ${validation.missing.join(', ')}`).toBe(true);
  }

  /**
   * Assert PDF does not contain text
   * @param {string|Buffer} source - PDF source
   * @param {string|string[]} unexpectedTexts - Text(s) that should not be present
   */
  async expectPdfNotContainsText(source, unexpectedTexts) {
    const validation = await this.validateContent(source, unexpectedTexts);
    expect(validation.found.length, `PDF contains unexpected texts: ${validation.found.join(', ')}`).toBe(0);
  }

  /**
   * Assert PDF has specific page count
   * @param {string|Buffer} source - PDF source
   * @param {number} expectedCount - Expected page count
   */
  async expectPdfPageCount(source, expectedCount) {
    const validation = await this.validatePageCount(source, expectedCount);
    expect(validation.actual, `Expected ${expectedCount} pages, got ${validation.actual}`).toBe(expectedCount);
  }

  /**
   * Assert PDF matches visual baseline
   * @param {string|Buffer} source - PDF source
   * @param {string} baselineName - Baseline name
   * @param {Object} options - Comparison options
   */
  async expectPdfMatchesBaseline(source, baselineName, options = {}) {
    const comparison = await this.comparePdfVisual(source, baselineName, options);

    const mismatches = comparison.results.filter(r => r.status === 'mismatch');
    if (mismatches.length > 0) {
      const details = mismatches.map(m => `Page ${m.page}: ${m.diffPercentage}% different`).join('\n');
      expect(mismatches.length, `PDF visual mismatch:\n${details}`).toBe(0);
    }
  }

  /**
   * Assert PDF text matches regex pattern
   * @param {string|Buffer} source - PDF source
   * @param {RegExp} pattern - Regex pattern to match
   */
  async expectPdfMatchesPattern(source, pattern) {
    const result = await this.searchPattern(source, pattern);
    expect(result.found, `PDF does not match pattern: ${pattern}`).toBe(true);
  }

  /**
   * Assert PDF file size is within range
   * @param {string} filePath - PDF file path
   * @param {number} minBytes - Minimum size in bytes
   * @param {number} maxBytes - Maximum size in bytes
   */
  async expectPdfSizeInRange(filePath, minBytes, maxBytes) {
    const size = getFileSize(filePath);
    expect(size).toBeGreaterThanOrEqual(minBytes);
    expect(size).toBeLessThanOrEqual(maxBytes);
  }

  /**
   * Get a PDF fixture file path
   * @param {string} filename - Fixture filename
   * @returns {string} Full path
   */
  getPdfFixture(filename) {
    return getPdfFixturePath(filename);
  }

  /**
   * Cleanup downloaded files
   * @param {string|string[]} files - File path(s) to delete
   */
  cleanup(files) {
    const filesToDelete = Array.isArray(files) ? files : [files];
    filesToDelete.forEach(f => deleteFile(f));
  }
}
