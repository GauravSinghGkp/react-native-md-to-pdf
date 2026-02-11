/**
 * react-native-md-to-pdf
 * PDF generation engine powered by expo-print.
 *
 * `expo-print` and `expo-file-system` are optional peer dependencies.
 * The library's markdown-to-HTML features work without them, but this
 * module requires both to be installed.
 */

import { convertMarkdownToHtml } from './converter';
import { buildPageCss, buildStylesheet, wrapHtmlDocument } from './styles';
import type { PdfOptions, PdfResult } from './types';
import { ErrorCode, MdToPdfError } from './types';

// ─── Dynamic Imports ────────────────────────────────────────────────────────

/**
 * Lazily resolve `expo-print`. Throws a clear error if not installed.
 */
async function requireExpoPrint(): Promise<{
  printToFileAsync: (options: {
    html: string;
    width?: number;
    height?: number;
  }) => Promise<{ uri: string; numberOfPages: number; base64?: string }>;
}> {
  try {
    return require('expo-print');
  } catch {
    throw new MdToPdfError(
      ErrorCode.GENERATION_FAILED,
      'expo-print is required for PDF generation. ' +
        'Install it with: npx expo install expo-print'
    );
  }
}

/**
 * Lazily resolve `expo-file-system`. Throws a clear error if not installed.
 */
async function requireExpoFileSystem(): Promise<{
  readAsStringAsync: (
    uri: string,
    options: { encoding: string }
  ) => Promise<string>;
  copyAsync: (options: { from: string; to: string }) => Promise<void>;
  documentDirectory: string | null;
  cacheDirectory: string | null;
  EncodingType: { Base64: string };
}> {
  try {
    return require('expo-file-system');
  } catch {
    throw new MdToPdfError(
      ErrorCode.GENERATION_FAILED,
      'expo-file-system is required for PDF generation. ' +
        'Install it with: npx expo install expo-file-system'
    );
  }
}

// ─── Page Dimensions ────────────────────────────────────────────────────────

/** Page dimensions in points (72 dpi) for expo-print width/height. */
const PAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  A3: { width: 842, height: 1191 },
  A4: { width: 595, height: 842 },
  A5: { width: 420, height: 595 },
  LEGAL: { width: 612, height: 1008 },
  LETTER: { width: 612, height: 792 },
  TABLOID: { width: 792, height: 1224 },
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate a PDF from a markdown string.
 *
 * This is the main high-level API of the library. It handles the full
 * pipeline: markdown → HTML → styled document → PDF file.
 *
 * @example
 * ```ts
 * import { generatePdf } from 'react-native-md-to-pdf';
 *
 * const result = await generatePdf('# Hello World', {
 *   pageSize: 'A4',
 *   fileName: 'readme',
 * });
 * console.log(result.filePath); // "/path/to/readme.pdf"
 * ```
 *
 * @param markdown - Raw markdown string.
 * @param options  - Optional PDF generation options.
 * @returns A promise that resolves to a `PdfResult`.
 *
 * @throws {MdToPdfError} `INVALID_MARKDOWN` — if the input is not a string.
 * @throws {MdToPdfError} `CONVERSION_FAILED` — if markdown → HTML fails.
 * @throws {MdToPdfError} `GENERATION_FAILED` — if HTML → PDF fails or deps missing.
 * @throws {MdToPdfError} `FILE_SYSTEM_ERROR` — if file operations fail.
 */
export async function generatePdf(
  markdown: string,
  options?: PdfOptions
): Promise<PdfResult> {
  // 1️⃣ Convert markdown → HTML body
  const bodyHtml = convertMarkdownToHtml(markdown);

  // 2️⃣ Build the styled HTML document
  const css = buildStylesheet(options?.theme);
  const pageCss = buildPageCss(options);
  const html = wrapHtmlDocument(bodyHtml, css, pageCss);

  // 3️⃣ Resolve native dependencies
  const Print = await requireExpoPrint();
  const FileSystem = await requireExpoFileSystem();

  // 4️⃣ Determine page dimensions
  const pageKey = options?.pageSize ?? 'A4';
  const dimensions = PAGE_DIMENSIONS[pageKey] ?? PAGE_DIMENSIONS.A4!;

  // Swap dimensions for landscape
  const isLandscape = options?.orientation === 'landscape';
  const width = isLandscape ? dimensions.height : dimensions.width;
  const height = isLandscape ? dimensions.width : dimensions.height;

  try {
    // 5️⃣ Generate PDF via expo-print
    const printResult = await Print.printToFileAsync({
      html,
      width,
      height,
    });

    let filePath = printResult.uri;

    // 6️⃣ Move to user-specified directory if provided
    if (options?.directory) {
      const fileName = options.fileName ?? `md-to-pdf-${Date.now()}`;
      const destination = `${options.directory}/${fileName}.pdf`;

      try {
        await FileSystem.copyAsync({
          from: printResult.uri,
          to: destination,
        });
        filePath = destination;
      } catch (copyError: unknown) {
        const message =
          copyError instanceof Error
            ? copyError.message
            : 'Failed to copy PDF to target directory';
        throw new MdToPdfError(ErrorCode.FILE_SYSTEM_ERROR, message);
      }
    } else if (options?.fileName) {
      // Rename in the default cache directory
      const dir =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
      const destination = `${dir}${options.fileName}.pdf`;

      try {
        await FileSystem.copyAsync({
          from: printResult.uri,
          to: destination,
        });
        filePath = destination;
      } catch {
        // If rename fails, keep the original path — non-critical
        filePath = printResult.uri;
      }
    }

    // 7️⃣ Read base64 if requested
    let base64: string | undefined;
    if (options?.base64) {
      try {
        base64 = await FileSystem.readAsStringAsync(filePath, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (readError: unknown) {
        const message =
          readError instanceof Error
            ? readError.message
            : 'Failed to read PDF as base64';
        throw new MdToPdfError(ErrorCode.FILE_SYSTEM_ERROR, message);
      }
    }

    // 8️⃣ Build result
    const result: PdfResult = {
      filePath,
      pageCount: printResult.numberOfPages ?? 1,
      ...(base64 !== undefined && { base64 }),
    };

    return result;
  } catch (error: unknown) {
    // Re-throw our own errors
    if (error instanceof MdToPdfError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : 'PDF generation failed';
    throw new MdToPdfError(ErrorCode.GENERATION_FAILED, message);
  }
}
