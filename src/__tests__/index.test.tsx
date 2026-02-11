import {
  convertMarkdownToHtml,
  buildStylesheet,
  wrapHtmlDocument,
  mergeTheme,
  DEFAULT_THEME,
  MdToPdfError,
  ErrorCode,
} from '../index';
import { parseInline } from '../converter';

// ═══════════════════════════════════════════════════════════════════════════
// convertMarkdownToHtml
// ═══════════════════════════════════════════════════════════════════════════

describe('convertMarkdownToHtml', () => {
  // ── Input validation ────────────────────────────────────────────────────

  describe('input validation', () => {
    it('throws INVALID_MARKDOWN for non-string input', () => {
      expect(() => convertMarkdownToHtml(null as unknown as string)).toThrow(
        MdToPdfError
      );
      expect(() =>
        convertMarkdownToHtml(undefined as unknown as string)
      ).toThrow(MdToPdfError);
      expect(() => convertMarkdownToHtml(42 as unknown as string)).toThrow(
        MdToPdfError
      );

      try {
        convertMarkdownToHtml(null as unknown as string);
      } catch (e) {
        expect(e).toBeInstanceOf(MdToPdfError);
        expect((e as MdToPdfError).code).toBe(ErrorCode.INVALID_MARKDOWN);
      }
    });

    it('returns empty string for empty input', () => {
      expect(convertMarkdownToHtml('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(convertMarkdownToHtml('   \n\n  \t  ')).toBe('');
    });
  });

  // ── Headings ────────────────────────────────────────────────────────────

  describe('headings', () => {
    it('converts h1 through h6', () => {
      expect(convertMarkdownToHtml('# Heading 1')).toBe('<h1>Heading 1</h1>');
      expect(convertMarkdownToHtml('## Heading 2')).toBe('<h2>Heading 2</h2>');
      expect(convertMarkdownToHtml('### Heading 3')).toBe('<h3>Heading 3</h3>');
      expect(convertMarkdownToHtml('#### Heading 4')).toBe(
        '<h4>Heading 4</h4>'
      );
      expect(convertMarkdownToHtml('##### Heading 5')).toBe(
        '<h5>Heading 5</h5>'
      );
      expect(convertMarkdownToHtml('###### Heading 6')).toBe(
        '<h6>Heading 6</h6>'
      );
    });

    it('preserves inline formatting inside headings', () => {
      expect(convertMarkdownToHtml('# Hello **world**')).toBe(
        '<h1>Hello <strong>world</strong></h1>'
      );
    });
  });

  // ── Paragraphs ──────────────────────────────────────────────────────────

  describe('paragraphs', () => {
    it('wraps plain text in <p> tags', () => {
      expect(convertMarkdownToHtml('Hello world')).toBe('<p>Hello world</p>');
    });

    it('merges consecutive non-blank lines into one paragraph', () => {
      const result = convertMarkdownToHtml('Line one\nLine two');
      expect(result).toBe('<p>Line one\nLine two</p>');
    });

    it('creates separate paragraphs for blank-line-separated text', () => {
      const result = convertMarkdownToHtml('Para one\n\nPara two');
      expect(result).toContain('<p>Para one</p>');
      expect(result).toContain('<p>Para two</p>');
    });
  });

  // ── Code blocks ─────────────────────────────────────────────────────────

  describe('code blocks', () => {
    it('converts fenced code blocks', () => {
      const md = '```js\nconst x = 1;\n```';
      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<pre><code class="language-js">');
      expect(result).toContain('const x = 1;');
    });

    it('handles code blocks without a language', () => {
      const md = '```\nhello\n```';
      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<pre><code>hello</code></pre>');
    });

    it('escapes HTML inside code blocks', () => {
      const md = '```\n<div>test</div>\n```';
      const result = convertMarkdownToHtml(md);
      expect(result).toContain('&lt;div&gt;');
    });
  });

  // ── Blockquotes ─────────────────────────────────────────────────────────

  describe('blockquotes', () => {
    it('converts single-line blockquotes', () => {
      const result = convertMarkdownToHtml('> This is a quote');
      expect(result).toContain('<blockquote>');
      expect(result).toContain('This is a quote');
    });

    it('converts multi-line blockquotes', () => {
      const result = convertMarkdownToHtml('> Line 1\n> Line 2');
      expect(result).toContain('<blockquote>');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
    });
  });

  // ── Lists ───────────────────────────────────────────────────────────────

  describe('lists', () => {
    it('converts unordered lists (dash)', () => {
      const md = '- Item 1\n- Item 2\n- Item 3';
      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('<li>Item 3</li>');
    });

    it('converts unordered lists (asterisk)', () => {
      const md = '* Item A\n* Item B';
      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item A</li>');
    });

    it('converts ordered lists', () => {
      const md = '1. First\n2. Second\n3. Third';
      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>First</li>');
      expect(result).toContain('<li>Second</li>');
    });

    it('preserves inline formatting in list items', () => {
      const md = '- **Bold item**\n- *Italic item*';
      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<li><strong>Bold item</strong></li>');
      expect(result).toContain('<li><em>Italic item</em></li>');
    });
  });

  // ── Horizontal rules ───────────────────────────────────────────────────

  describe('horizontal rules', () => {
    it('converts --- to <hr />', () => {
      expect(convertMarkdownToHtml('---')).toBe('<hr />');
    });

    it('converts *** to <hr />', () => {
      expect(convertMarkdownToHtml('***')).toBe('<hr />');
    });

    it('converts ___ to <hr />', () => {
      expect(convertMarkdownToHtml('___')).toBe('<hr />');
    });
  });

  // ── Tables ──────────────────────────────────────────────────────────────

  describe('tables', () => {
    it('converts a basic table', () => {
      const md = [
        '| Name | Age |',
        '| --- | --- |',
        '| Alice | 30 |',
        '| Bob | 25 |',
      ].join('\n');

      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<table>');
      expect(result).toContain('<thead>');
      expect(result).toContain('<th>Name</th>');
      expect(result).toContain('<th>Age</th>');
      expect(result).toContain('<td>Alice</td>');
      expect(result).toContain('<td>Bob</td>');
    });

    it('handles column alignment', () => {
      const md = [
        '| Left | Center | Right |',
        '| :--- | :---: | ---: |',
        '| A | B | C |',
      ].join('\n');

      const result = convertMarkdownToHtml(md);
      expect(result).toContain('text-align:left');
      expect(result).toContain('text-align:center');
      expect(result).toContain('text-align:right');
    });
  });

  // ── Mixed content ─────────────────────────────────────────────────────

  describe('mixed content', () => {
    it('handles a document with multiple block types', () => {
      const md = [
        '# Title',
        '',
        'A paragraph with **bold** text.',
        '',
        '- Item 1',
        '- Item 2',
        '',
        '> A quote',
        '',
        '---',
      ].join('\n');

      const result = convertMarkdownToHtml(md);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<blockquote>');
      expect(result).toContain('<hr />');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// parseInline (exported for direct testing)
// ═══════════════════════════════════════════════════════════════════════════

describe('parseInline', () => {
  it('converts bold with **', () => {
    expect(parseInline('**bold**')).toBe('<strong>bold</strong>');
  });

  it('converts italic with *', () => {
    expect(parseInline('*italic*')).toBe('<em>italic</em>');
  });

  it('converts bold+italic with ***', () => {
    expect(parseInline('***both***')).toBe('<strong><em>both</em></strong>');
  });

  it('converts inline code', () => {
    expect(parseInline('use `console.log`')).toBe(
      'use <code>console.log</code>'
    );
  });

  it('converts strikethrough', () => {
    expect(parseInline('~~removed~~')).toBe('<del>removed</del>');
  });

  it('converts links', () => {
    expect(parseInline('[Google](https://google.com)')).toBe(
      '<a href="https://google.com">Google</a>'
    );
  });

  it('converts links with title', () => {
    expect(parseInline('[Google](https://google.com "Search")')).toBe(
      '<a href="https://google.com" title="Search">Google</a>'
    );
  });

  it('converts images', () => {
    expect(parseInline('![alt](img.png)')).toBe(
      '<img src="img.png" alt="alt" />'
    );
  });

  it('converts images with title', () => {
    expect(parseInline('![alt](img.png "My Image")')).toBe(
      '<img src="img.png" alt="alt" title="My Image" />'
    );
  });

  it('handles mixed inline elements', () => {
    const result = parseInline('**bold** and *italic* and `code`');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
    expect(result).toContain('<code>code</code>');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════════

describe('DEFAULT_THEME', () => {
  it('provides all required properties', () => {
    expect(DEFAULT_THEME.fontFamily).toBeDefined();
    expect(DEFAULT_THEME.fontSize).toBeDefined();
    expect(DEFAULT_THEME.lineHeight).toBeDefined();
    expect(DEFAULT_THEME.codeFontFamily).toBeDefined();
    expect(DEFAULT_THEME.colors).toBeDefined();
    expect(DEFAULT_THEME.colors.text).toBeDefined();
    expect(DEFAULT_THEME.colors.background).toBeDefined();
  });
});

describe('mergeTheme', () => {
  it('returns default theme when no overrides given', () => {
    expect(mergeTheme()).toEqual(DEFAULT_THEME);
    expect(mergeTheme(undefined)).toEqual(DEFAULT_THEME);
  });

  it('overrides only specified fields', () => {
    const result = mergeTheme({ fontSize: '18px' });
    expect(result.fontSize).toBe('18px');
    expect(result.fontFamily).toBe(DEFAULT_THEME.fontFamily);
  });

  it('deep-merges color overrides', () => {
    const result = mergeTheme({ colors: { text: '#000000' } });
    expect(result.colors.text).toBe('#000000');
    expect(result.colors.background).toBe(DEFAULT_THEME.colors.background);
  });
});

describe('buildStylesheet', () => {
  it('returns a <style> block', () => {
    const css = buildStylesheet();
    expect(css).toContain('<style>');
    expect(css).toContain('</style>');
  });

  it('includes default theme values', () => {
    const css = buildStylesheet();
    expect(css).toContain(DEFAULT_THEME.colors.text);
    expect(css).toContain(DEFAULT_THEME.colors.link);
  });

  it('incorporates custom theme overrides', () => {
    const css = buildStylesheet({ colors: { text: '#ff0000' } });
    expect(css).toContain('#ff0000');
  });
});

describe('wrapHtmlDocument', () => {
  it('produces a complete HTML5 document', () => {
    const html = wrapHtmlDocument('<p>Hello</p>', '<style>body{}</style>');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<meta charset="UTF-8"');
    expect(html).toContain('<style>body{}</style>');
    expect(html).toContain('<p>Hello</p>');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MdToPdfError
// ═══════════════════════════════════════════════════════════════════════════

describe('MdToPdfError', () => {
  it('is an instance of Error', () => {
    const err = new MdToPdfError(ErrorCode.INVALID_MARKDOWN, 'bad input');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(MdToPdfError);
  });

  it('carries the correct code and message', () => {
    const err = new MdToPdfError(ErrorCode.CONVERSION_FAILED, 'oops');
    expect(err.code).toBe(ErrorCode.CONVERSION_FAILED);
    expect(err.message).toBe('oops');
    expect(err.name).toBe('MdToPdfError');
  });
});
