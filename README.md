# react-native-md-to-pdf

A powerful, customizable library to convert **Markdown** to **PDF** in React Native.

🚀 **Zero-dependency markdown parser**
🎨 **Granular Theming (CSS-like)**
🔤 **Custom Fonts Support**
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
  };

  return <Button title="Generate PDF" onPress={handleGenerate} />;
}
```

### Advanced Customization (Themes & Fonts)

The library supports rich customization using `ThemeConfig` and custom fonts.

```tsx
const result = await convertToPdf(markdown, {
  pageSize: 'A4',
  theme: {
    // Global overrides
    fontFamily: 'Open Sans',
    background: '#ffffff',
    colors: {
      text: '#111827',
      heading: '#dc2626', // Red headings
    },

    // 🎨 Granular Element Styles (CSS-like)
    h1: { fontSize: '32px', borderBottom: '2px solid #dc2626', paddingBottom: '10px' },
    h2: { color: '#4b5563', borderBottom: '1px solid #e5e7eb' },
    code: { backgroundColor: '#1f2937', color: '#38bdf8', borderRadius: '6px' },
    img: { borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
  },
  // 🔤 Custom Fonts (base64)
  fonts: {
    'Open Sans': 'BASE64_FONT_DATA...', 
    'Fira Code': 'BASE64_FONT_DATA...'
  }
});
```

## API Reference

### `useMdToPdf()`

Hook that exposes the core functions.

- **`convertToPdf(markdown, options?)`**: Generates a PDF. Returns `Promise<PdfResult>`.
- **`convertToHtml(markdown, theme?)`**: Returns the generated HTML string (useful for previews).
- **`isConverting`**: Boolean indicating if a conversion is in progress.

### `PdfOptions`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fileName` | `string` | `timestamp` | Name of the output file (no extension). |
| `pageSize` | `'A4'`, `'Letter'`, etc. | `'A4'` | Standard page sizes. |
| `orientation` | `'portrait'` \| `'landscape'` | `'portrait'` | Page orientation. |
| `directory` | `string` | `cache/doc` | Directory to save the PDF to. |
| `base64` | `boolean` | `false` | If true, returns base64 data in result. |
| `theme` | `ThemeConfig` | `DEFAULT` | Styling configuration. |
| `fonts` | `Record<string, string>` | `undefined` | Map of font-family names to base64 font data. |

### `ThemeConfig`

Allows overriding colors and specific element styles.

- **`colors`**: Object with keys like `text`, `background`, `heading`, `link`, `code`, `codeBackground`, etc.
- **`h1`...`h6`**: `TextStyle` objects for headings.
- **`p`, `a`, `img`, `table`, `blockquote`, `code`, `pre`**: `TextStyle` objects for respective elements.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
