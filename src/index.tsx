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

// ── Styling ─────────────────────────────────────────────────────────────────
export {
  DEFAULT_THEME,
  buildStylesheet,
  buildPageCss,
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
