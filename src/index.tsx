/**
 * react-native-md-to-pdf
 *
 * Convert Markdown to PDF in React Native & Expo apps.
 *
 * @packageDocumentation
 */

// ── Conversion ──────────────────────────────────────────────────────────────
export { convertMarkdownToHtml } from './converter';

// ── PDF Generation ──────────────────────────────────────────────────────────
export { generatePdf } from './pdfGenerator';

// ── Hook ────────────────────────────────────────────────────────────────────
export { useMdToPdf } from './useMdToPdf';
export type { UseMdToPdfReturn, ConversionStatus } from './useMdToPdf';

// ── Component ───────────────────────────────────────────────────────────────
export { MdToPdfView } from './MdToPdfView';
export type { MdToPdfViewProps, MdToPdfViewRef } from './MdToPdfView';

// ── Styling ─────────────────────────────────────────────────────────────────
export {
  DEFAULT_THEME,
  buildStylesheet,
  buildPageCss,
  buildFontCss,
  wrapHtmlDocument,
  mergeTheme,
} from './styles';

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  PdfOptions,
  ThemeConfig,
  ThemeColors,
  PdfResult,
  PageSize,
  Orientation,
  MarginConfig,
} from './types';

export { MdToPdfError, ErrorCode } from './types';
