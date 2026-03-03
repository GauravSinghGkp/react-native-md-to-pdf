/**
 * Tests for the MdToPdfView component.
 */

import { createRef } from 'react';
import { render, act } from '@testing-library/react-native';
import { MdToPdfView, type MdToPdfViewRef } from '../MdToPdfView';

const { printToFileAsync: mockPrintToFileAsync } = require('expo-print');
const {
  copyAsync: mockCopyAsync,
  deleteAsync: mockDeleteAsync,
} = require('expo-file-system');

describe('MdToPdfView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrintToFileAsync.mockResolvedValue({
      uri: '/cache/output.pdf',
      numberOfPages: 2,
    });
    mockCopyAsync?.mockResolvedValue(undefined);
    mockDeleteAsync?.mockResolvedValue(undefined);
  });

  // ── Render prop ────────────────────────────────────────────────────────

  it('calls children render prop with an HTML string', () => {
    const childFn = jest.fn(() => null);
    render(<MdToPdfView markdown="# Hello">{childFn}</MdToPdfView>);

    expect(childFn).toHaveBeenCalledTimes(1);
    expect(childFn).toHaveBeenCalledWith(
      expect.stringContaining('<h1>Hello</h1>')
    );
    expect(childFn).toHaveBeenCalledWith(
      expect.stringContaining('<!DOCTYPE html>')
    );
  });

  it('renders without children without crashing', () => {
    expect(() => render(<MdToPdfView markdown="# Hello" />)).not.toThrow();
  });

  it('updates HTML when markdown prop changes', () => {
    const childFn = jest.fn(() => null);
    const { rerender } = render(
      <MdToPdfView markdown="# First">{childFn}</MdToPdfView>
    );

    rerender(<MdToPdfView markdown="# Second">{childFn}</MdToPdfView>);

    expect(childFn).toHaveBeenLastCalledWith(
      expect.stringContaining('<h1>Second</h1>')
    );
  });

  // ── Ref API ────────────────────────────────────────────────────────────

  it('ref.getHtml() returns the full HTML document', () => {
    const ref = createRef<MdToPdfViewRef>();
    render(<MdToPdfView ref={ref} markdown="# Hi" />);

    const html = ref.current?.getHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<h1>Hi</h1>');
  });

  it('ref.isConverting starts as false', () => {
    const ref = createRef<MdToPdfViewRef>();
    render(<MdToPdfView ref={ref} markdown="# Hi" />);
    expect(ref.current?.isConverting).toBe(false);
  });

  it('ref.generatePdf() resolves with a PdfResult', async () => {
    const ref = createRef<MdToPdfViewRef>();
    render(<MdToPdfView ref={ref} markdown="# Hi" />);

    let result: Awaited<ReturnType<MdToPdfViewRef['generatePdf']>> | undefined;
    await act(async () => {
      result = await ref.current?.generatePdf();
    });

    expect(result?.filePath).toBeTruthy();
    expect(result?.pageCount).toBe(2);
  });

  // ── Callbacks ──────────────────────────────────────────────────────────

  it('calls onGenerateStart then onGenerateComplete on success', async () => {
    const onStart = jest.fn();
    const onComplete = jest.fn();

    const ref = createRef<MdToPdfViewRef>();
    render(
      <MdToPdfView
        ref={ref}
        markdown="# Hi"
        onGenerateStart={onStart}
        onGenerateComplete={onComplete}
      />
    );

    await act(async () => {
      await ref.current?.generatePdf();
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    const completeArg = onComplete.mock.calls[0]?.[0] as
      | { filePath: string }
      | undefined;
    expect(completeArg?.filePath).toBeTruthy();
  });

  it('calls onGenerateError and throws on failure', async () => {
    mockPrintToFileAsync.mockRejectedValue(new Error('print failed'));
    const onError = jest.fn();

    const ref = createRef<MdToPdfViewRef>();
    render(<MdToPdfView ref={ref} markdown="# Hi" onGenerateError={onError} />);

    await act(async () => {
      try {
        await ref.current?.generatePdf();
      } catch {
        // expected
      }
    });

    expect(onError).toHaveBeenCalledTimes(1);
    const errArg = onError.mock.calls[0]?.[0] as
      | { message: string }
      | undefined;
    expect(errArg?.message).toContain('print failed');
  });
});
