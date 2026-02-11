/**
 * Tests for the useMdToPdf hook.
 *
 * Uses @testing-library/react-native's renderHook for hook testing.
 * expo-print and expo-file-system are resolved via manual mocks.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useMdToPdf } from '../useMdToPdf';
import { ErrorCode } from '../types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { printToFileAsync: mockPrintToFileAsync } = require('expo-print');

describe('useMdToPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrintToFileAsync.mockResolvedValue({
      uri: '/cache/output.pdf',
      numberOfPages: 1,
    });
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useMdToPdf());
    expect(result.current.status).toBe('idle');
    expect(result.current.isConverting).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('convertToHtml returns styled HTML synchronously', () => {
    const { result } = renderHook(() => useMdToPdf());
    const html = result.current.convertToHtml('# Hello');
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<style>');
  });

  it('convertToHtml accepts a custom theme', () => {
    const { result } = renderHook(() => useMdToPdf());
    const html = result.current.convertToHtml('# Hello', {
      colors: { text: '#ff0000' },
    });
    expect(html).toContain('#ff0000');
  });

  it('convertToPdf transitions through converting → success', async () => {
    const { result } = renderHook(() => useMdToPdf());

    let pdfResult: Awaited<ReturnType<typeof result.current.convertToPdf>>;
    await act(async () => {
      pdfResult = await result.current.convertToPdf('# Test');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isConverting).toBe(false);
    expect(result.current.result).toBeTruthy();
    expect(result.current.result?.filePath).toBe('/cache/output.pdf');
    expect(pdfResult!.pageCount).toBe(1);
  });

  it('convertToPdf transitions to error on failure', async () => {
    mockPrintToFileAsync.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useMdToPdf());

    await act(async () => {
      try {
        await result.current.convertToPdf('# Test');
      } catch {
        // expected
      }
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe(ErrorCode.GENERATION_FAILED);
  });

  it('reset clears all state back to idle', async () => {
    const { result } = renderHook(() => useMdToPdf());

    await act(async () => {
      await result.current.convertToPdf('# Test');
    });

    expect(result.current.status).toBe('success');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
