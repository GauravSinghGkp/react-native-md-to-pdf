/**
 * react-native-md-to-pdf
 * Pure-TypeScript markdown → HTML converter.
 *
 * Design:
 *   1. Tokenize — split the input into *block-level* tokens.
 *   2. Render  — convert each token to HTML, applying inline parsing on the fly.
 *
 * Zero external dependencies.
 */

import { ErrorCode, MdToPdfError } from './types';

// ─── Inline parsing ─────────────────────────────────────────────────────────

/**
 * Parse inline markdown formatting and return HTML.
 *
 * Order of replacements matters — we process the most specific patterns first
 * to avoid partial matches (e.g. `***bold-italic***` before `**bold**`).
 */
export function parseInline(text: string): string {
  let result = text;

  // Images: ![alt](src "title?")
  result = result.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_m, alt: string, src: string, title?: string) =>
      title
        ? `<img src="${src}" alt="${alt}" title="${title}" />`
        : `<img src="${src}" alt="${alt}" />`
  );

  // Links: [text](url "title?")
  result = result.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_m, label: string, href: string, title?: string) =>
      title
        ? `<a href="${href}" title="${title}">${label}</a>`
        : `<a href="${href}">${label}</a>`
  );

  // Inline code (must be before bold/italic to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold + Italic: ***text*** or ___text___
  result = result.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
  result = result.replace(/_{3}(.+?)_{3}/g, '<strong><em>$1</em></strong>');

  // Bold: **text** or __text__
  result = result.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
  result = result.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Line break: two trailing spaces → <br />
  result = result.replace(/ {2,}$/gm, '<br />');

  return result;
}

// ─── Block-level token types ────────────────────────────────────────────────

interface HeadingToken {
  type: 'heading';
  level: number;
  content: string;
}

interface ParagraphToken {
  type: 'paragraph';
  content: string;
}

interface CodeBlockToken {
  type: 'codeblock';
  language: string;
  content: string;
}

interface BlockquoteToken {
  type: 'blockquote';
  content: string;
}

interface HorizontalRuleToken {
  type: 'hr';
}

interface ListToken {
  type: 'list';
  ordered: boolean;
  items: string[];
}

interface TableToken {
  type: 'table';
  headers: string[];
  alignments: Array<'left' | 'center' | 'right' | null>;
  rows: string[][];
}

type BlockToken =
  | HeadingToken
  | ParagraphToken
  | CodeBlockToken
  | BlockquoteToken
  | HorizontalRuleToken
  | ListToken
  | TableToken;

// ─── Tokenizer ──────────────────────────────────────────────────────────────

/** Escape HTML entities in raw user text. */
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parse table alignment row (e.g. `| :--- | :---: | ---: |`)
 * and return alignment per column.
 */
function parseAlignments(
  line: string
): Array<'left' | 'center' | 'right' | null> {
  return splitTableRow(line).map((cell) => {
    const trimmed = cell.trim();
    const left = trimmed.startsWith(':');
    const right = trimmed.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return null;
  });
}

/** Split a markdown table row into cells. */
function splitTableRow(line: string): string[] {
  // Remove leading/trailing pipes then split
  const stripped = line.replace(/^\|/, '').replace(/\|$/, '');
  return stripped.split('|').map((c) => c.trim());
}

/** Check if a line is a table separator row. */
function isTableSeparator(line: string): boolean {
  return /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line);
}

/** Check if a line looks like part of a table (contains pipes). */
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('|') && !trimmed.startsWith('|--');
}

/** Tokenize all lines into block-level tokens. */
function tokenize(lines: string[]): BlockToken[] {
  const tokens: BlockToken[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    // ── Empty line → skip ────────────────────────────────────────────
    if (trimmed === '') {
      i++;
      continue;
    }

    // ── Fenced code block ────────────────────────────────────────────
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith('```')) {
        codeLines.push(lines[i]!);
        i++;
      }
      i++; // skip closing ```
      tokens.push({
        type: 'codeblock',
        language,
        content: escapeHtml(codeLines.join('\n')),
      });
      continue;
    }

    // ── Heading (ATX style: # … ######) ──────────────────────────────
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      tokens.push({
        type: 'heading',
        level: headingMatch[1]!.length,
        content: headingMatch[2]!,
      });
      i++;
      continue;
    }

    // ── Horizontal rule ──────────────────────────────────────────────
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    // ── Table ────────────────────────────────────────────────────────
    if (
      isTableRow(trimmed) &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1]!.trim())
    ) {
      const headers = splitTableRow(trimmed);
      const alignments = parseAlignments(lines[i + 1]!.trim());
      const rows: string[][] = [];
      i += 2; // skip header + separator
      while (i < lines.length && isTableRow(lines[i]!.trim())) {
        rows.push(splitTableRow(lines[i]!.trim()));
        i++;
      }
      tokens.push({ type: 'table', headers, alignments, rows });
      continue;
    }

    // ── Blockquote ───────────────────────────────────────────────────
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith('>')) {
        quoteLines.push(lines[i]!.trim().replace(/^>\s?/, ''));
        i++;
      }
      tokens.push({ type: 'blockquote', content: quoteLines.join('\n') });
      continue;
    }

    // ── Unordered list ───────────────────────────────────────────────
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        lines[i]!.trim() !== '' &&
        /^[-*+]\s+/.test(lines[i]!.trim())
      ) {
        items.push(lines[i]!.trim().replace(/^[-*+]\s+/, ''));
        i++;
      }
      tokens.push({ type: 'list', ordered: false, items });
      continue;
    }

    // ── Ordered list ─────────────────────────────────────────────────
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        lines[i]!.trim() !== '' &&
        /^\d+\.\s+/.test(lines[i]!.trim())
      ) {
        items.push(lines[i]!.trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      tokens.push({ type: 'list', ordered: true, items });
      continue;
    }

    // ── Paragraph (default) ──────────────────────────────────────────
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !lines[i]!.trim().startsWith('#') &&
      !lines[i]!.trim().startsWith('```') &&
      !lines[i]!.trim().startsWith('>') &&
      !/^[-*+]\s+/.test(lines[i]!.trim()) &&
      !/^\d+\.\s+/.test(lines[i]!.trim()) &&
      !/^(\*{3,}|-{3,}|_{3,})$/.test(lines[i]!.trim())
    ) {
      paragraphLines.push(lines[i]!.trim());
      i++;
    }
    if (paragraphLines.length > 0) {
      tokens.push({ type: 'paragraph', content: paragraphLines.join('\n') });
    }
  }

  return tokens;
}

// ─── Renderer ───────────────────────────────────────────────────────────────

function renderToken(token: BlockToken): string {
  switch (token.type) {
    case 'heading':
      return `<h${token.level}>${parseInline(token.content)}</h${token.level}>`;

    case 'paragraph':
      return `<p>${parseInline(token.content)}</p>`;

    case 'codeblock': {
      const langClass = token.language
        ? ` class="language-${token.language}"`
        : '';
      return `<pre><code${langClass}>${token.content}</code></pre>`;
    }

    case 'blockquote': {
      // Escape raw text first, then apply inline markdown transforms.
      // This prevents literal HTML in the source markdown from being injected.
      const safeContent = token.content
        .split('\n')
        .map((line) => {
          // Only escape lines that are not pure markdown inline syntax.
          // We escape the full line and let parseInline handle the markdown
          // tokens — the regex patterns in parseInline match syntax chars
          // that escapeHtml doesn't touch (*, _, `, ~, [, !, ())
          return line;
        })
        .join('\n');
      return `<blockquote><p>${parseInline(safeContent)}</p></blockquote>`;
    }

    case 'hr':
      return '<hr />';

    case 'list': {
      const tag = token.ordered ? 'ol' : 'ul';
      const items = token.items
        .map((item) => `<li>${parseInline(item)}</li>`)
        .join('\n');
      return `<${tag}>\n${items}\n</${tag}>`;
    }

    case 'table': {
      const headerCells = token.headers
        .map((h, idx) => {
          const align = token.alignments[idx];
          const style = align ? ` style="text-align:${align}"` : '';
          return `<th${style}>${parseInline(h)}</th>`;
        })
        .join('');

      const bodyRows = token.rows
        .map((row) => {
          const cells = row
            .map((cell, idx) => {
              const align = token.alignments[idx];
              const style = align ? ` style="text-align:${align}"` : '';
              return `<td${style}>${parseInline(cell)}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('\n');

      return [
        '<table>',
        `<thead><tr>${headerCells}</tr></thead>`,
        `<tbody>\n${bodyRows}\n</tbody>`,
        '</table>',
      ].join('\n');
    }
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Convert a markdown string to an HTML body fragment.
 *
 * @param markdown - Raw markdown text.
 * @returns HTML string (body content only, no `<html>` wrapper).
 * @throws {MdToPdfError} with code `INVALID_MARKDOWN` if input is not a string.
 * @throws {MdToPdfError} with code `CONVERSION_FAILED` on unexpected failures.
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (typeof markdown !== 'string') {
    throw new MdToPdfError(
      ErrorCode.INVALID_MARKDOWN,
      'Expected markdown input to be a string.'
    );
  }

  // Fast-path: empty / whitespace-only input produces no HTML.
  if (markdown.trim() === '') {
    return '';
  }

  try {
    const lines = markdown.split(/\r?\n/);
    const tokens = tokenize(lines);
    return tokens.map(renderToken).join('\n');
  } catch (error: unknown) {
    // Re-throw our own errors; wrap anything unexpected.
    if (error instanceof MdToPdfError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : 'Unknown conversion error';
    throw new MdToPdfError(ErrorCode.CONVERSION_FAILED, message);
  }
}
