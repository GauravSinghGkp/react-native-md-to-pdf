/**
 * Tests for the PDF generation pipeline.
 *
 * expo-print and expo-file-system are mocked via manual mocks in __mocks__/
 * since they are optional peer dependencies not installed in dev.
 */

import { generatePdf } from '../pdfGenerator';
import { ErrorCode } from '../types';

// Get references to the mocked functions

const { printToFileAsync: mockPrintToFileAsync } = require('expo-print');

const {
  readAsStringAsync: mockReadAsStringAsync,
  copyAsync: mockCopyAsync,
} = require('expo-file-system');

describe('generatePdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrintToFileAsync.mockResolvedValue({
      uri: '/cache/output.pdf',
      numberOfPages: 2,
    });
  });

  it('generates a PDF from markdown', async () => {
    const result = await generatePdf('# Hello');
    expect(result.filePath).toBe('/cache/output.pdf');
    expect(result.pageCount).toBe(2);
    expect(mockPrintToFileAsync).toHaveBeenCalledTimes(1);

    // Verify styled HTML was passed to expo-print
    const callArgs = mockPrintToFileAsync.mock.calls[0]!;
    expect(callArgs[0].html).toContain('<h1>Hello</h1>');
    expect(callArgs[0].html).toContain('<!DOCTYPE html>');
    expect(callArgs[0].html).toContain('<style>');
  });

  it('passes correct A4 dimensions by default', async () => {
    await generatePdf('# Test');
    const callArgs = mockPrintToFileAsync.mock.calls[0]!;
    expect(callArgs[0].width).toBe(595);
    expect(callArgs[0].height).toBe(842);
  });

  it('passes LETTER dimensions', async () => {
    await generatePdf('# Test', { pageSize: 'LETTER' });
    const callArgs = mockPrintToFileAsync.mock.calls[0]!;
    expect(callArgs[0].width).toBe(612);
    expect(callArgs[0].height).toBe(792);
  });

  it('swaps dimensions for landscape orientation', async () => {
    await generatePdf('# Test', { orientation: 'landscape' });
    const callArgs = mockPrintToFileAsync.mock.calls[0]!;
    // A4 landscape: width=842, height=595
    expect(callArgs[0].width).toBe(842);
    expect(callArgs[0].height).toBe(595);
  });

  it('copies to custom directory when specified', async () => {
    mockCopyAsync.mockResolvedValue(undefined);
    const result = await generatePdf('# Test', {
      directory: '/custom/dir',
      fileName: 'myfile',
    });
    expect(mockCopyAsync).toHaveBeenCalledWith({
      from: '/cache/output.pdf',
      to: '/custom/dir/myfile.pdf',
    });
    expect(result.filePath).toBe('/custom/dir/myfile.pdf');
  });

  it('reads base64 when requested', async () => {
    mockReadAsStringAsync.mockResolvedValue('dGVzdA==');
    const result = await generatePdf('# Test', { base64: true });
    expect(result.base64).toBe('dGVzdA==');
    expect(mockReadAsStringAsync).toHaveBeenCalledWith('/cache/output.pdf', {
      encoding: 'base64',
    });
  });

  it('includes @page CSS when options are provided', async () => {
    await generatePdf('# Test', {
      pageSize: 'LETTER',
      orientation: 'landscape',
    });
    const callArgs = mockPrintToFileAsync.mock.calls[0]!;
    expect(callArgs[0].html).toContain('@page');
    expect(callArgs[0].html).toContain('landscape');
  });

  it('applies custom theme to the PDF', async () => {
    await generatePdf('# Test', {
      theme: { colors: { text: '#ff0000' } },
    });
    const callArgs = mockPrintToFileAsync.mock.calls[0]!;
    expect(callArgs[0].html).toContain('#ff0000');
  });

  it('throws INVALID_MARKDOWN for non-string input', async () => {
    await expect(generatePdf(null as unknown as string)).rejects.toMatchObject({
      code: ErrorCode.INVALID_MARKDOWN,
    });
  });

  it('throws GENERATION_FAILED when expo-print fails', async () => {
    mockPrintToFileAsync.mockRejectedValue(new Error('print failed'));
    await expect(generatePdf('# Test')).rejects.toMatchObject({
      code: ErrorCode.GENERATION_FAILED,
    });
  });
});
