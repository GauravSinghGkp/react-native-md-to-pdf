import { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import {
  convertMarkdownToHtml,
  buildStylesheet,
  wrapHtmlDocument,
} from 'react-native-md-to-pdf';

const SAMPLE_MARKDOWN = `# react-native-md-to-pdf

A **powerful** library for converting *Markdown* to PDF.

## Features

- Zero-dependency markdown parser
- Customizable themes
- iOS & Android support
- Works with **Expo**

## Code Example

\`\`\`typescript
import { convertMarkdownToHtml } from 'react-native-md-to-pdf';

const html = convertMarkdownToHtml('# Hello World');
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
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    try {
      const bodyHtml = convertMarkdownToHtml(markdown);
      const css = buildStylesheet();
      const fullDoc = wrapHtmlDocument(bodyHtml, css);
      setHtmlOutput(fullDoc);
      setIsGenerated(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setHtmlOutput(`Error: ${message}`);
      setIsGenerated(true);
    }
  }, [markdown]);

  const handleClear = useCallback(() => {
    setMarkdown('');
    setHtmlOutput('');
    setIsGenerated(false);
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

        {/* Markdown Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Markdown Input</Text>
          <TextInput
            style={styles.input}
            value={markdown}
            onChangeText={setMarkdown}
            multiline
            placeholder="Paste or type your markdown here…"
            placeholderTextColor="#999"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerate}
            activeOpacity={0.8}
          >
            <Text style={styles.generateBtnText}>⚡ Generate HTML</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* HTML Preview */}
        {isGenerated && (
          <View style={styles.section}>
            <Text style={styles.label}>Generated HTML</Text>
            <View style={styles.preview}>
              <ScrollView nestedScrollEnabled style={styles.previewScroll}>
                <Text style={styles.previewText} selectable>
                  {htmlOutput}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c63ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    color: '#e0e0e0',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 200,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  generateBtn: {
    flex: 1,
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  clearBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  clearBtnText: {
    color: '#8888aa',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    overflow: 'hidden',
  },
  previewScroll: {
    maxHeight: 400,
    padding: 16,
  },
  previewText: {
    color: '#c0c0d0',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
});
