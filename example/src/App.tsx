import { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useMdToPdf } from 'react-native-md-to-pdf';

import { MarkdownEditor } from './components/MarkdownEditor';
import { HtmlPreview } from './components/HtmlPreview';
import { Toolbar } from './components/Toolbar';
import { savePdfToDevice } from './utils/fileHandler';
import { CUSTOM_THEME } from './constants/theme';

const SAMPLE_MARKDOWN = `# react-native-md-to-pdf

A **powerful** library for converting *Markdown* to PDF.

## Features

- Zero-dependency markdown parser
- Customizable themes
- iOS & Android support
- Works with **Expo**

## Code Example

\`\`\`typescript
import { useMdToPdf } from 'react-native-md-to-pdf';

const { convertToPdf } = useMdToPdf();
const result = await convertToPdf('# Hello World');
console.log(result.filePath);
\`\`\`

## Table Demo

| Feature | Status |
| :--- | :---: |
| Headings | ✅ |
| Lists | ✅ |
| Code Blocks | ✅ |
| Tables | ✅ |

> Built with ❤️ for the React Native community

---

Try editing this markdown and press **Generate**!
`;

export default function App() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  // Use the library hook
  const { convertToHtml, convertToPdf, isConverting } = useMdToPdf();

  const handleGenerateHtml = useCallback(() => {
    try {
      // Pass theme if custom theme is selected, otherwise undefined (default)
      const theme = isCustomTheme ? CUSTOM_THEME : undefined;
      const fullDoc = convertToHtml(markdown, theme);
      setHtmlOutput(fullDoc);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setHtmlOutput(`Error: ${message}`);
    }
  }, [markdown, convertToHtml, isCustomTheme]);

  const handleGeneratePdf = useCallback(async () => {
    try {
      const options = {
        pageSize: 'A4' as const,
        fileName: `demo-${Date.now()}`,
        ...(isCustomTheme && {
          theme: CUSTOM_THEME,
        }),
      };

      const result = await convertToPdf(markdown, options);

      Alert.alert(
        '✅ PDF Generated!',
        `Saved to cache: ${result.filePath}\n\nWhat would you like to do?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: Platform.OS === 'android' ? 'Save to Files' : 'Save/Share',
            onPress: () => savePdfToDevice(result.filePath),
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('❌ PDF Error', message);
    }
  }, [markdown, convertToPdf, isCustomTheme]);

  const handleClear = useCallback(() => {
    setMarkdown('');
    setHtmlOutput('');
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📄 MD → PDF</Text>
          <Text style={styles.headerSub}>react-native-md-to-pdf demo</Text>
        </View>

        <MarkdownEditor value={markdown} onChange={setMarkdown} />

        <Toolbar
          onGenerateHtml={handleGenerateHtml}
          onGeneratePdf={handleGeneratePdf}
          onClear={handleClear}
          isConverting={isConverting}
          isCustomTheme={isCustomTheme}
          onToggleTheme={() => setIsCustomTheme(!isCustomTheme)}
        />

        <HtmlPreview html={htmlOutput} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: Platform.OS === 'android' ? 30 : 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#8888aa',
    marginTop: 4,
  },
});
