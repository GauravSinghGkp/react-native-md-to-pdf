# react-native-md-to-pdf

A powerful, customizable library to convert **Markdown** to **PDF** in React Native.

🚀 **Zero-dependency markdown parser**
🎨 **Granular Theming (CSS-like)**
🔤 **Custom Fonts Support**
✅ **Task List / Checkbox rendering**
📱 **iOS & Android** (with Expo Go & Bare workflow support)
⚛️ **Works with Expo**

## Installation

```sh
npm install react-native-md-to-pdf expo-print expo-file-system
# or
yarn add react-native-md-to-pdf expo-print expo-file-system
```

> **Note**: This library depends on `expo-print` (for PDF generation) and `expo-file-system` (for saving files). If you are in a bare React Native project, ensure you install these modules correctly.

## Usage

### Simple Example

```tsx
import { useMdToPdf } from 'react-native-md-to-pdf';

export default function App() {
  const { convertToPdf } = useMdToPdf();

  const handleGenerate = async () => {
    const result = await convertToPdf('# Hello World', {
      fileName: 'my-doc',
      pageSize: 'A4',
    });
    console.log('PDF saved to:', result.filePath);
    console.log('Pages:', result.pageCount);
  };

  return <Button title="Generate PDF" onPress={handleGenerate} />;
}
```

### HTML Preview (WebView)

`convertToHtml` returns a **complete HTML5 document** ready to feed directly into a `WebView`. Pass `PdfOptions` to ensure the preview matches the PDF exactly (same page size, margins, and theme).

```tsx
const { convertToHtml } = useMdToPdf();

const html = convertToHtml(markdown, {
  pageSize: 'A4',
  theme: { colors: { heading: '#dc2626' } },
});

// Feed into WebView:
<WebView source={{ html }} />
```

### Advanced Customization (Themes & Fonts)

```tsx
const result = await convertToPdf(markdown, {
  pageSize: 'A4',
  theme: {
    // Global overrides
    fontFamily: 'Open Sans',
    background: '#ffffff',
    colors: {
      text: '#111827',
      heading: '#dc2626',
    },

    // 🎨 Granular Element Styles (CSS-like)
    h1: { fontSize: '32px', borderBottom: '2px solid #dc2626', paddingBottom: '10px' },
    h2: { color: '#4b5563', borderBottom: '1px solid #e5e7eb' },
    code: { backgroundColor: '#1f2937', color: '#38bdf8', borderRadius: '6px' },
    img: { borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  },
  // 🔤 Custom Fonts (base64 or data URI)
  fonts: {
    'Open Sans': 'data:font/ttf;base64,BASE64_FONT_DATA...',
    'Fira Code': 'BASE64_RAW_FONT_DATA...',
  },
});
```

### Task Lists

```md
- [x] Completed item
- [ ] Pending item
```

Renders as interactive checkboxes in the PDF (disabled, for display only).

### MdToPdfView Component

A component that renders markdown as styled HTML and exposes PDF generation via an imperative ref.

```tsx
import { MdToPdfView, type MdToPdfViewRef } from 'react-native-md-to-pdf';
import { WebView } from 'react-native-webview';

const ref = useRef<MdToPdfViewRef>(null);

<MdToPdfView
  ref={ref}
  markdown="# Hello"
  pdfOptions={{ pageSize: 'A4' }}
  onGenerateStart={() => setLoading(true)}
  onGenerateComplete={(result) => {
    setLoading(false);
    console.log('PDF saved to:', result.filePath);
  }}
  onGenerateError={(err) => {
    setLoading(false);
    console.error(err.code, err.message);
  }}
>
  {(html) => <WebView source={{ html }} />}
</MdToPdfView>

// Trigger PDF generation imperatively:
await ref.current?.generatePdf({ pageSize: 'A4' });

// Get HTML string:
const html = ref.current?.getHtml();

// Check if generating:
const busy = ref.current?.isConverting;
```

## API Reference

### `useMdToPdf()`

Hook that exposes the core functions.

- **`convertToPdf(markdown, options?)`**: Generates a PDF. Returns `Promise<PdfResult>`.
- **`convertToHtml(markdown, options?)`**: Returns a complete HTML5 document string. Accepts `PdfOptions` so page layout and theme match the PDF. Ideal for `WebView` previews.
- **`isConverting`**: Boolean indicating if a conversion is in progress.
- **`status`**: `'idle' | 'converting' | 'success' | 'error'`
- **`result`**: The last `PdfResult` (when `status === 'success'`).
- **`error`**: The last `MdToPdfError` (when `status === 'error'`).
- **`reset()`**: Reset state back to idle.

### `PdfOptions`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fileName` | `string` | `timestamp` | Output file name (no extension). |
| `pageSize` | `'A4'`, `'Letter'`, etc. | `'A4'` | Standard page sizes. |
| `orientation` | `'portrait'` \| `'landscape'` | `'portrait'` | Page orientation. |
| `margins` | `Partial<MarginConfig>` | `20mm all` | Page margins (e.g. `{ top: '15mm' }`). |
| `directory` | `string` | cache dir | Directory to save the PDF to. |
| `base64` | `boolean` | `false` | If true, includes base64 data in result. |
| `theme` | `ThemeConfig` | `DEFAULT` | Styling configuration. |
| `fonts` | `Record<string, string>` | `undefined` | Map of font-family names to base64 font data. |

### `PdfResult`

| Property | Type | Description |
| :--- | :--- | :--- |
| `filePath` | `string` | Absolute path to the generated PDF file. |
| `pageCount` | `number` | Number of pages in the PDF. |
| `base64` | `string?` | Base64-encoded PDF data (only when `base64: true`). |

### `ThemeConfig`

Allows overriding colors and specific element styles.

- **`colors`**: Object with keys like `text`, `background`, `heading`, `link`, `code`, `codeBackground`, etc.
- **`h1`…`h6`**: `TextStyle` objects for headings.
- **`p`, `a`, `img`, `table`, `blockquote`, `code`, `pre`**: `TextStyle` objects for respective elements.

### `MdToPdfViewProps`

| Property | Type | Description |
| :--- | :--- | :--- |
| `markdown` | `string` | The markdown string to render. |
| `theme` | `ThemeConfig?` | Optional theme overrides. |
| `pdfOptions` | `PdfOptions?` | PDF generation options used by `ref.generatePdf()`. |
| `style` | `ViewStyle?` | Style for the outer container. |
| `children` | `(html: string) => ReactNode` | Render prop — receives the full HTML string. |
| `onGenerateStart` | `() => void` | Called when PDF generation begins. |
| `onGenerateComplete` | `(result: PdfResult) => void` | Called on success. |
| `onGenerateError` | `(error: MdToPdfError) => void` | Called on failure. |

### `MdToPdfViewRef`

| Property | Type | Description |
| :--- | :--- | :--- |
| `getHtml()` | `() => string` | Returns the current HTML document string. |
| `generatePdf(options?)` | `(options?: PdfOptions) => Promise<PdfResult>` | Triggers PDF generation. |
| `isConverting` | `boolean` | Whether a PDF generation is in progress. |

### Custom Fonts

Pass fonts as either:
- **Raw base64** string → library wraps it as `data:font/ttf;base64,...`
- **Full data URI** → `data:font/ttf;base64,...` (used as-is)

```ts
fonts: {
  'Open Sans': 'data:font/ttf;base64,AAEC...', // data URI
  'Fira Code': 'AAEC...',                        // raw base64 (assumed ttf)
}
```

## Troubleshooting

**`expo-print` or `expo-file-system` not found**
```sh
npx expo install expo-print expo-file-system
```

**PDF not saving on Android**
Ensure `directory` points to a writable path. Use `FileSystem.documentDirectory` or `FileSystem.cacheDirectory` from `expo-file-system`.

**Custom font not rendering in PDF**
- Make sure you pass the font name to `theme.fontFamily` as well:  
  `theme: { fontFamily: 'Open Sans', ... }`
- Check the base64 string is valid and the font format is TTF/OTF/WOFF.

**`MdToPdfError` with code `GENERATION_FAILED`**
Usually means `expo-print` encountered an issue. Check that your HTML is valid and the device has enough memory for the page count.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
