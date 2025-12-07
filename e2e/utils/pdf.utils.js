import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * PDF Utilities for Playwright Tests
 * Provides content extraction, validation, and visual comparison capabilities
 */

/**
 * Parse PDF from a file path
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} Parsed PDF data with text, pages, metadata
 */
export async function parsePdfFromPath(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  return await pdf(dataBuffer);
}

/**
 * Parse PDF from a buffer
 * @param {Buffer} buffer - PDF buffer data
 * @returns {Promise<Object>} Parsed PDF data
 */
export async function parsePdfFromBuffer(buffer) {
  return await pdf(buffer);
}

/**
 * Extract text content from PDF
 * @param {string|Buffer} source - File path or buffer
 * @returns {Promise<string>} Extracted text content
 */
export async function extractPdfText(source) {
  const data = typeof source === 'string'
    ? await parsePdfFromPath(source)
    : await parsePdfFromBuffer(source);
  return data.text;
}

/**
 * Get PDF metadata
 * @param {string|Buffer} source - File path or buffer
 * @returns {Promise<Object>} PDF metadata (title, author, pages, etc.)
 */
export async function getPdfMetadata(source) {
  const data = typeof source === 'string'
    ? await parsePdfFromPath(source)
    : await parsePdfFromBuffer(source);

  return {
    pageCount: data.numpages,
    info: data.info,
    metadata: data.metadata,
    version: data.version,
  };
}

/**
 * Validate PDF contains expected text
 * @param {string|Buffer} source - File path or buffer
 * @param {string|string[]} expectedTexts - Text(s) to search for
 * @returns {Promise<Object>} Validation result with found/missing texts
 */
export async function validatePdfContent(source, expectedTexts) {
  const text = await extractPdfText(source);
  const textsToCheck = Array.isArray(expectedTexts) ? expectedTexts : [expectedTexts];

  const results = {
    found: [],
    missing: [],
    allFound: true,
  };

  for (const expectedText of textsToCheck) {
    if (text.includes(expectedText)) {
      results.found.push(expectedText);
    } else {
      results.missing.push(expectedText);
      results.allFound = false;
    }
  }

  return results;
}

/**
 * Validate PDF page count
 * @param {string|Buffer} source - File path or buffer
 * @param {number} expectedCount - Expected number of pages
 * @returns {Promise<Object>} Validation result
 */
export async function validatePdfPageCount(source, expectedCount) {
  const metadata = await getPdfMetadata(source);
  return {
    actual: metadata.pageCount,
    expected: expectedCount,
    valid: metadata.pageCount === expectedCount,
  };
}

/**
 * Extract text from a specific page (approximate - pdf-parse returns all text)
 * @param {string|Buffer} source - File path or buffer
 * @param {number} pageNumber - Page number (1-indexed)
 * @returns {Promise<string>} Text content (note: pdf-parse doesn't support per-page extraction)
 */
export async function extractPdfPageText(source, pageNumber) {
  const data = typeof source === 'string'
    ? await parsePdfFromPath(source)
    : await parsePdfFromBuffer(source);

  // Note: pdf-parse doesn't natively support per-page text extraction
  // This returns full text with a warning
  console.warn('pdf-parse does not support per-page extraction. Returning full text.');
  return data.text;
}

/**
 * Search for pattern in PDF using regex
 * @param {string|Buffer} source - File path or buffer
 * @param {RegExp} pattern - Regular expression to search for
 * @returns {Promise<Object>} Search results with matches
 */
export async function searchPdfPattern(source, pattern) {
  const text = await extractPdfText(source);
  const matches = text.match(pattern);

  return {
    found: matches !== null,
    matches: matches || [],
    count: matches ? matches.length : 0,
  };
}

/**
 * Compare two PNG images and return difference
 * @param {Buffer} img1Buffer - First image buffer
 * @param {Buffer} img2Buffer - Second image buffer
 * @param {Object} options - Comparison options
 * @returns {Object} Comparison result with diff count and diff image
 */
export function compareImages(img1Buffer, img2Buffer, options = {}) {
  const img1 = PNG.sync.read(img1Buffer);
  const img2 = PNG.sync.read(img2Buffer);

  const { width, height } = img1;

  if (img2.width !== width || img2.height !== height) {
    return {
      match: false,
      error: 'Image dimensions do not match',
      dimensions: {
        img1: { width: img1.width, height: img1.height },
        img2: { width: img2.width, height: img2.height },
      },
    };
  }

  const diff = new PNG({ width, height });
  const threshold = options.threshold || 0.1;

  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold }
  );

  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;
  const tolerance = options.tolerance || 0; // percentage tolerance

  return {
    match: diffPercentage <= tolerance,
    numDiffPixels,
    totalPixels,
    diffPercentage: diffPercentage.toFixed(2),
    diffImage: PNG.sync.write(diff),
  };
}

/**
 * Save diff image to file
 * @param {Buffer} diffImageBuffer - Diff image buffer from compareImages
 * @param {string} outputPath - Path to save the diff image
 */
export function saveDiffImage(diffImageBuffer, outputPath) {
  fs.writeFileSync(outputPath, diffImageBuffer);
}

/**
 * Read image file to buffer
 * @param {string} filePath - Path to image file
 * @returns {Buffer} Image buffer
 */
export function readImageFile(filePath) {
  return fs.readFileSync(filePath);
}

/**
 * Save buffer to file
 * @param {Buffer} buffer - Data buffer
 * @param {string} filePath - Output file path
 */
export function saveToFile(buffer, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, buffer);
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {number} File size in bytes
 */
export function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Delete file if exists
 * @param {string} filePath - Path to file
 */
export function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Get fixtures directory path
 * @param {string} subDir - Optional subdirectory
 * @returns {string} Path to fixtures directory
 */
export function getFixturesPath(subDir = '') {
  return path.join(process.cwd(), 'e2e', 'fixtures', subDir);
}

/**
 * Get PDF fixtures path
 * @param {string} filename - PDF filename
 * @returns {string} Full path to PDF fixture
 */
export function getPdfFixturePath(filename) {
  return path.join(getFixturesPath('pdfs'), filename);
}

/**
 * Get snapshot path for visual comparison
 * @param {string} filename - Snapshot filename
 * @returns {string} Full path to snapshot
 */
export function getSnapshotPath(filename) {
  return path.join(getFixturesPath('snapshots'), filename);
}
