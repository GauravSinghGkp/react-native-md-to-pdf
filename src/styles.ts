/**
 * react-native-md-to-pdf
 * Default theme, stylesheet builder, and HTML document wrapper.
 */

import type {
  MarginConfig,
  PdfOptions,
  ThemeColors,
  ThemeConfig,
  TextStyle,
} from './types';

// ─── Default Theme ──────────────────────────────────────────────────────────

const DEFAULT_COLORS: ThemeColors = {
  text: '#1a1a2e',
  background: '#ffffff',
  heading: '#16213e',
  code: '#e06c75',
  codeBackground: '#f5f5f7',
  link: '#0a84ff',
  blockquote: '#6c63ff',
  blockquoteText: '#4a4a68',
  rule: '#d1d5db',
  tableBorder: '#e2e8f0',
  tableHeaderBackground: '#f8fafc',
};

/** Sensible default theme with a clean, readable aesthetic. */
export const DEFAULT_THEME: Required<
  Pick<ThemeConfig, 'fontFamily' | 'fontSize' | 'lineHeight' | 'codeFontFamily'>
> & { colors: ThemeColors } = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',
  codeFontFamily:
    '"SF Mono", SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
  colors: DEFAULT_COLORS,
};

// ─── Theme Merging ──────────────────────────────────────────────────────────

/** Deep-merge user overrides on top of the default theme. */
export function mergeTheme(overrides?: ThemeConfig): typeof DEFAULT_THEME {
  if (!overrides) return DEFAULT_THEME;

  return {
    fontFamily: overrides.fontFamily ?? DEFAULT_THEME.fontFamily,
    fontSize: overrides.fontSize ?? DEFAULT_THEME.fontSize,
    lineHeight: overrides.lineHeight ?? DEFAULT_THEME.lineHeight,
    codeFontFamily: overrides.codeFontFamily ?? DEFAULT_THEME.codeFontFamily,
    colors: {
      ...DEFAULT_THEME.colors,
      ...overrides.colors,
    },
  };
}

// ─── Stylesheet Builder ─────────────────────────────────────────────────────

/**
 * Produce a `<style>` block from a (possibly partial) theme configuration.
 *
 * The resulting CSS covers every supported markdown element, yielding a
 * polished, GitHub-inspired look without external stylesheets.
 */
export function buildStylesheet(theme?: ThemeConfig): string {
  const t = mergeTheme(theme);
  const c = t.colors;

  // Helper to convert TextStyle object to CSS string
  const toCss = (style?: TextStyle) => {
    if (!style) return '';
    return Object.entries(style)
      .map(([k, v]) => {
        if (v === undefined) return '';
        const key = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        return `${key}: ${v};`;
      })
      .join(' ');
  };

  return `<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${t.fontFamily};
    font-size: ${t.fontSize};
    line-height: ${t.lineHeight};
    color: ${c.text};
    background: ${c.background};
    padding: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* ── Headings ────────────────────────────────────────────────────── */
  h1, h2, h3, h4, h5, h6 {
    color: ${c.heading};
    margin-top: 1.4em;
    margin-bottom: 0.6em;
    font-weight: 600;
    line-height: 1.25;
  }
  h1 { font-size: 2em; border-bottom: 2px solid ${
    c.rule
  }; padding-bottom: 0.3em; ${toCss(theme?.h1)} }
  h2 { font-size: 1.5em; border-bottom: 1px solid ${
    c.rule
  }; padding-bottom: 0.25em; ${toCss(theme?.h2)} }
  h3 { font-size: 1.25em; ${toCss(theme?.h3)} }
  h4 { font-size: 1em; ${toCss(theme?.h4)} }
  h5 { font-size: 0.875em; ${toCss(theme?.h5)} }
  h6 { font-size: 0.85em; color: ${c.blockquoteText}; ${toCss(theme?.h6)} }

  /* ── Paragraphs ──────────────────────────────────────────────────── */
  p {
    margin-bottom: 1em;
    ${toCss(theme?.p)}
  }

  /* ── Links ───────────────────────────────────────────────────────── */
  a {
    color: ${c.link};
    text-decoration: none;
    ${toCss(theme?.a)}
  }
  a:hover { text-decoration: underline; }

  /* ── Code ─────────────────────────────────────────────────────────── */
  code {
    font-family: ${t.codeFontFamily};
    font-size: 0.9em;
    background: ${c.codeBackground};
    color: ${c.code};
    padding: 0.15em 0.4em;
    border-radius: 4px;
    ${toCss(theme?.code)}
  }

  pre {
    background: ${c.codeBackground};
    border-radius: 8px;
    padding: 1em;
    overflow-x: auto;
    margin-bottom: 1em;
    ${toCss(theme?.pre)}
  }
  pre code {
    background: none;
    padding: 0;
    font-size: 0.875em;
    color: ${c.text};
  }

  /* ── Blockquotes ─────────────────────────────────────────────────── */
  blockquote {
    border-left: 4px solid ${c.blockquote};
    padding: 0.6em 1em;
    margin: 0 0 1em 0;
    color: ${c.blockquoteText};
    background: ${c.codeBackground};
    border-radius: 0 6px 6px 0;
    ${toCss(theme?.blockquote)}
  }
  blockquote p { margin-bottom: 0; }

  /* ── Lists ───────────────────────────────────────────────────────── */
  ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
  }
  li {
    margin-bottom: 0.35em;
  }

  /* ── Horizontal Rule ─────────────────────────────────────────────── */
  hr {
    border: none;
    height: 2px;
    background: ${c.rule};
    margin: 1.5em 0;
  }

  /* ── Tables ──────────────────────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
    ${toCss(theme?.table)}
  }
  th, td {
    border: 1px solid ${c.tableBorder};
    padding: 0.5em 0.75em;
    text-align: left;
  }
  th {
    background: ${c.tableHeaderBackground};
    font-weight: 600;
  }
  tbody tr:nth-child(even) {
    background: ${c.tableHeaderBackground};
  }

  /* ── Images ──────────────────────────────────────────────────────── */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 0.5em 0;
    ${toCss(theme?.img)}
  }

  /* ── Strikethrough ───────────────────────────────────────────────── */
  del {
    color: ${c.blockquoteText};
  }
</style>`;
}

// ─── Page Size Map ──────────────────────────────────────────────────────────

/** CSS page size values for each supported page size. */
const PAGE_SIZE_MAP: Record<string, string> = {
  A3: '297mm 420mm',
  A4: '210mm 297mm',
  A5: '148mm 210mm',
  LEGAL: '8.5in 14in',
  LETTER: '8.5in 11in',
  TABLOID: '11in 17in',
};

/** Default margins for PDF output. */
const DEFAULT_MARGINS: MarginConfig = {
  top: '20mm',
  right: '20mm',
  bottom: '20mm',
  left: '20mm',
};

// ─── @page CSS Builder ──────────────────────────────────────────────────────

/**
 * Build a `@page` CSS rule from PDF options.
 *
 * Controls page size, orientation, and margins in the generated PDF.
 */
export function buildPageCss(options?: PdfOptions): string {
  if (!options) return '';

  const parts: string[] = [];

  // Page size + orientation
  const size = PAGE_SIZE_MAP[options.pageSize ?? 'A4'] ?? PAGE_SIZE_MAP.A4!;
  const orientation = options.orientation === 'landscape' ? ' landscape' : '';
  parts.push(`size: ${size}${orientation};`);

  // Margins
  const m = { ...DEFAULT_MARGINS, ...options.margins };
  parts.push(`margin: ${m.top} ${m.right} ${m.bottom} ${m.left};`);

  return `<style>@page { ${parts.join(' ')} }</style>`;
}

// ─── Font CSS Builder ────────────────────────────────────────────────────────

/**
 * Build `@font-face` rules for custom fonts.
 *
 * @param fonts - Map of font-family name to base64 font content.
 */
export function buildFontCss(fonts?: Record<string, string>): string {
  if (!fonts) return '';

  return Object.entries(fonts)
    .map(([family, base64]) => {
      // Basic detection for format based on file content is hard without mime type,
      // but commonly these are passed as full data URIs or raw base64.
      // If raw base64, we assume ttf/otf/woff.
      // However, typical usage expected is: 'data:font/ttf;base64,...' OR just base64.
      // Let's assume standard base64 and use a generic format or try to infer.
      // Actually, standard practice for this lib: user provides base64.
      // We'll wrap it in `url('data:font/ttf;base64,${base64}')` if it doesn't have scheme.

      const src = base64.startsWith('data:')
        ? `url('${base64}')`
        : `url('data:font/ttf;base64,${base64}')`;

      return `@font-face {
  font-family: '${family}';
  src: ${src};
}`;
    })
    .join('\n');
}

// ─── HTML Document Wrapper ──────────────────────────────────────────────────

/**
 * Wrap an HTML body fragment into a complete, well-formed HTML5 document
 * ready for PDF rendering.
 *
 * @param bodyHtml - The HTML body content.
 * @param css      - The `<style>` block from `buildStylesheet()`.
 * @param pageCss  - Optional `@page` CSS from `buildPageCss()`.
 * @param fontCss  - Optional `@font-face` CSS from `buildFontCss()`.
 */
export function wrapHtmlDocument(
  bodyHtml: string,
  css: string,
  pageCss?: string,
  fontCss?: string
): string {
  const pageStyle = pageCss ? `\n  ${pageCss}` : '';
  const fontStyle = fontCss ? `\n  <style>\n${fontCss}\n  </style>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${fontStyle}
  ${css}${pageStyle}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
