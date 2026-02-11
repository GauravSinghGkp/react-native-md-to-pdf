/**
 * react-native-md-to-pdf
 * React hook for markdown-to-PDF conversion.
 *
 * Provides a declarative, state-managed way to convert markdown to PDF
 * from within React Native components.
 */

import { useCallback, useRef, useState } from 'react';
import { convertMarkdownToHtml } from './converter';
import { generatePdf } from './pdfGenerator';
import { buildPageCss, buildStylesheet, wrapHtmlDocument } from './styles';
import type { PdfOptions, PdfResult, ThemeConfig } from './types';
import { ErrorCode, MdToPdfError } from './types';

// ─── Hook State ─────────────────────────────────────────────────────────────

/** Possible states of the conversion pipeline. */
export type ConversionStatus = 'idle' | 'converting' | 'success' | 'error';

/** Return value of the `useMdToPdf` hook. */
export interface UseMdToPdfReturn {
  /** Current status of the conversion pipeline. */
  status: ConversionStatus;
  /** Whether a conversion is currently in progress. */
  isConverting: boolean;
  /** The generated PDF result (available when `status === 'success'`). */
  result: PdfResult | null;
  /** The error that occurred (available when `status === 'error'`). */
  error: MdToPdfError | null;
  /**
   * Convert markdown to HTML string.
   * This is synchronous and does not require expo-print.
   */
  convertToHtml: (markdown: string, theme?: ThemeConfig) => string;
  /**
   * Generate a PDF from markdown.
   * Requires expo-print and expo-file-system to be installed.
   */
  convertToPdf: (markdown: string, options?: PdfOptions) => Promise<PdfResult>;
  /** Reset the hook state back to idle. */
  reset: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * React hook for markdown-to-PDF conversion.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { convertToPdf, convertToHtml, status, result, error } = useMdToPdf();
 *
 *   const handleExport = async () => {
 *     const pdf = await convertToPdf('# Hello World', { pageSize: 'A4' });
 *     console.log('PDF saved to:', pdf.filePath);
 *   };
 *
 *   return (
 *     <Button title="Export PDF" onPress={handleExport} disabled={status === 'converting'} />
 *   );
 * }
 * ```
 */
export function useMdToPdf(): UseMdToPdfReturn {
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState<MdToPdfError | null>(null);

  // Track the latest call to handle race conditions
  const callIdRef = useRef(0);

  const convertToHtml = useCallback(
    (markdown: string, theme?: ThemeConfig): string => {
      const bodyHtml = convertMarkdownToHtml(markdown);
      const css = buildStylesheet(theme);
      const pageCss = buildPageCss();
      return wrapHtmlDocument(bodyHtml, css, pageCss);
    },
    []
  );

  const convertToPdf = useCallback(
    async (markdown: string, options?: PdfOptions): Promise<PdfResult> => {
      const currentCallId = ++callIdRef.current;

      setStatus('converting');
      setError(null);

      try {
        const pdfResult = await generatePdf(markdown, options);

        // Only update state if this is still the latest call
        if (currentCallId === callIdRef.current) {
          setResult(pdfResult);
          setStatus('success');
        }

        return pdfResult;
      } catch (err: unknown) {
        const mdError =
          err instanceof MdToPdfError
            ? err
            : new MdToPdfError(
                ErrorCode.GENERATION_FAILED,
                err instanceof Error ? err.message : 'Unknown error'
              );

        // Only update state if this is still the latest call
        if (currentCallId === callIdRef.current) {
          setError(mdError);
          setStatus('error');
        }

        throw mdError;
      }
    },
    []
  );

  const reset = useCallback(() => {
    callIdRef.current++;
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    isConverting: status === 'converting',
    result,
    error,
    convertToHtml,
    convertToPdf,
    reset,
  };
}
