/**
 * react-native-md-to-pdf
 * Core type definitions for the library.
 */

// ---------------------------------------------------------------------------
// Page & Layout
// ---------------------------------------------------------------------------

/** Standard page sizes for PDF generation. */
export type PageSize = 'A3' | 'A4' | 'A5' | 'LEGAL' | 'LETTER' | 'TABLOID';

/** Page orientation. */
export type Orientation = 'portrait' | 'landscape';

/** Margin configuration in CSS units (e.g. '20mm', '1in', '10px'). */
export interface MarginConfig {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

/** Color palette for themed rendering. */
export interface ThemeColors {
  /** Primary text color. */
  text: string;
  /** Page background color. */
  background: string;
  /** Heading text color. */
  heading: string;
  /** Inline & block code text color. */
  code: string;
  /** Code block background. */
  codeBackground: string;
  /** Hyperlink color. */
  link: string;
  /** Blockquote border / accent color. */
  blockquote: string;
  /** Blockquote text color. */
  blockquoteText: string;
  /** Horizontal rule color. */
  rule: string;
  /** Table border color. */
  tableBorder: string;
  /** Table header background. */
  tableHeaderBackground: string;
}

/** Standard CSS properties for granular element styling. */
export interface TextStyle {
  // Typography
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  whiteSpace?: string;

  // Box model
  backgroundColor?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string;

  // Sizing
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;

  // Misc
  display?: string;
  overflow?: string;
  overflowWrap?: string;
  wordBreak?: string;
  boxShadow?: string;
  opacity?: string | number;
}

/**
 * Theme configuration that controls the visual appearance of the generated
 * HTML / PDF output.
 *
 * Every field is optional — unset fields fall back to `DEFAULT_THEME`.
 */
export interface ThemeConfig {
  /** Primary font family stack, e.g. `'"Inter", sans-serif'`. */
  fontFamily?: string;
  /** Base font size, e.g. `'16px'`. */
  fontSize?: string;
  /** Base line-height multiplier, e.g. `'1.6'`. */
  lineHeight?: string;
  /** Monospace font family for code, e.g. `'"Fira Code", monospace'`. */
  codeFontFamily?: string;
  /** Color palette overrides. */
  colors?: Partial<ThemeColors>;

  // Granular Element Styles
  h1?: TextStyle;
  h2?: TextStyle;
  h3?: TextStyle;
  h4?: TextStyle;
  h5?: TextStyle;
  h6?: TextStyle;
  p?: TextStyle;
  a?: TextStyle;
  img?: TextStyle;
  table?: TextStyle;
  blockquote?: TextStyle;
  code?: TextStyle;
  pre?: TextStyle;
}

// ---------------------------------------------------------------------------
// PDF Options
// ---------------------------------------------------------------------------

/**
 * Options passed to `generatePdf()` (implemented in Step 2).
 *
 * Exported now so consumers can start typing their configuration early.
 */
export interface PdfOptions {
  /** Output file name **without** extension. Defaults to a timestamp-based name. */
  fileName?: string;
  /**
   * Directory to write the PDF to.
   * Defaults to the app's cache/temporary directory.
   */
  directory?: string;
  /** Page size. @default 'A4' */
  pageSize?: PageSize;
  /** Page orientation. @default 'portrait' */
  orientation?: Orientation;
  /** Page margins. @default { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' } */
  margins?: Partial<MarginConfig>;
  /** Theme / styling overrides. */
  theme?: ThemeConfig;
  /**
   * If `true`, the result will include a `base64` field with the PDF data
   * encoded as a base64 string. Useful for sharing or uploading without
   * touching the file system.
   * @default false
   */
  base64?: boolean;
  /**
   * Custom fonts to embed via @font-face.
   * Key is the font-family name, Value is the base64-encoded font file content.
   */
  fonts?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

/** Successful result returned after PDF generation. */
export interface PdfResult {
  /** Absolute path to the generated PDF file. */
  filePath: string;
  /** Number of pages in the PDF. */
  pageCount: number;
  /**
   * Base64-encoded PDF data.
   * Only present when `PdfOptions.base64` is `true`.
   */
  base64?: string;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Machine-readable error codes emitted by the library. */
export enum ErrorCode {
  /** The markdown input is invalid (null, undefined, or wrong type). */
  INVALID_MARKDOWN = 'INVALID_MARKDOWN',
  /** The markdown → HTML conversion failed. */
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  /** Could not write to / read from the file system. */
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  /** The HTML → PDF generation step failed. */
  GENERATION_FAILED = 'GENERATION_FAILED',
}

/**
 * Typed error thrown by every public function in the library.
 *
 * Consumers can discriminate on `.code` for programmatic error handling.
 */
export class MdToPdfError extends Error {
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'MdToPdfError';
    this.code = code;

    // Maintain proper prototype chain for `instanceof` checks.
    Object.setPrototypeOf(this, MdToPdfError.prototype);
  }
}
