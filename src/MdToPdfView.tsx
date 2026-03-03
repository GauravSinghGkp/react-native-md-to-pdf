/**
 * react-native-md-to-pdf
 * MdToPdfView — A React Native component that renders markdown as styled HTML
 * and provides a one-tap PDF export.
 */

import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { convertMarkdownToHtml } from './converter';
import { generatePdf } from './pdfGenerator';
import { buildPageCss, buildStylesheet, wrapHtmlDocument } from './styles';
import type { PdfOptions, PdfResult, ThemeConfig } from './types';
import { ErrorCode, MdToPdfError } from './types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MdToPdfViewProps {
  /** The markdown string to render. */
  markdown: string;
  /** Optional theme overrides. */
  theme?: ThemeConfig;
  /** Optional PDF generation options (used when `ref.generatePdf()` is called). */
  pdfOptions?: PdfOptions;
  /** Style applied to the outer container View. */
  style?: ViewStyle;
  /**
   * Render prop that receives the generated HTML string.
   * Use this to render the HTML in a WebView or any custom viewer.
   *
   * @example
   * ```tsx
   * <MdToPdfView markdown={md}>
   *   {(html) => <WebView source={{ html }} />}
   * </MdToPdfView>
   * ```
   */
  children?: (html: string) => React.ReactNode;
  /** Called immediately when PDF generation begins. */
  onGenerateStart?: () => void;
  /** Called when PDF generation succeeds. */
  onGenerateComplete?: (result: PdfResult) => void;
  /** Called when PDF generation fails. */
  onGenerateError?: (error: MdToPdfError) => void;
}

/** Methods exposed via the component ref. */
export interface MdToPdfViewRef {
  /** Get the generated HTML string. */
  getHtml: () => string;
  /** Generate a PDF from the current markdown. */
  generatePdf: (options?: PdfOptions) => Promise<PdfResult>;
  /** Whether a PDF generation is currently in progress. */
  isConverting: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * A component that converts markdown to styled HTML and exposes PDF generation
 * via an imperative ref.
 *
 * @example
 * ```tsx
 * const ref = useRef<MdToPdfViewRef>(null);
 *
 * <MdToPdfView
 *   ref={ref}
 *   markdown="# Hello"
 *   onGenerateComplete={(result) => console.log(result.filePath)}
 *   onGenerateError={(err) => console.error(err.code)}
 * >
 *   {(html) => <WebView source={{ html }} />}
 * </MdToPdfView>
 *
 * // Later:
 * const result = await ref.current?.generatePdf({ pageSize: 'A4' });
 * ```
 */
export const MdToPdfView = React.forwardRef<MdToPdfViewRef, MdToPdfViewProps>(
  function MdToPdfView(
    {
      markdown,
      theme,
      pdfOptions,
      style,
      children,
      onGenerateStart,
      onGenerateComplete,
      onGenerateError,
    },
    ref
  ) {
    const [isConverting, setIsConverting] = useState(false);

    // Memoize the HTML to avoid re-computing on every render
    const html = useMemo(() => {
      if (!markdown) return '';
      const bodyHtml = convertMarkdownToHtml(markdown);
      const css = buildStylesheet(theme);
      const pageCss = buildPageCss(pdfOptions);
      return wrapHtmlDocument(bodyHtml, css, pageCss);
    }, [markdown, theme, pdfOptions]);

    const handleGeneratePdf = useCallback(
      async (overrideOptions?: PdfOptions): Promise<PdfResult> => {
        const mergedOptions = { ...pdfOptions, ...overrideOptions, theme };
        setIsConverting(true);
        onGenerateStart?.();
        try {
          const result = await generatePdf(markdown, mergedOptions);
          onGenerateComplete?.(result);
          return result;
        } catch (err: unknown) {
          const mdError =
            err instanceof MdToPdfError
              ? err
              : new MdToPdfError(
                  ErrorCode.GENERATION_FAILED,
                  err instanceof Error ? err.message : 'Unknown error'
                );
          onGenerateError?.(mdError);
          throw mdError;
        } finally {
          setIsConverting(false);
        }
      },
      [
        markdown,
        theme,
        pdfOptions,
        onGenerateStart,
        onGenerateComplete,
        onGenerateError,
      ]
    );

    // Expose imperative methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getHtml: () => html,
        generatePdf: handleGeneratePdf,
        isConverting,
      }),
      [html, handleGeneratePdf, isConverting]
    );

    return (
      <View style={[styles.container, style]}>
        {children ? children(html) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
