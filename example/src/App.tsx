import { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useMdToPdf } from 'react-native-md-to-pdf';
import * as Sharing from 'expo-sharing';
import { Directory, File } from 'expo-file-system';

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
      const fullDoc = convertToHtml(markdown);
      setHtmlOutput(fullDoc);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setHtmlOutput(`Error: ${message}`);
    }
  }, [markdown, convertToHtml]);

  const saveToFiles = useCallback(async (filePath: string) => {
    try {
      if (Platform.OS === 'android') {
        const directory = await Directory.pickDirectoryAsync();
        if (directory) {
          const fileName = `markdown-export-${Date.now()}.pdf`;

          // Read source file as base64 using modern File API
          const sourceFile = new File(filePath);
          const base64 = await sourceFile.base64();

          // Convert base64 to Uint8Array
          // Expo/Hermes usually supports atob, otherwise we'd need a polyfill.
          // For safety in this example, we assume atob is available or use a simple polyfill logic if needed.
          const binaryString = global.atob
            ? global.atob(base64)
            : Buffer.from(base64, 'base64').toString('binary');
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const newFile = directory.createFile(fileName, 'application/pdf');
          newFile.write(bytes);

          Alert.alert('Success', 'PDF saved to selected directory');
        }
      } else {
        await Sharing.shareAsync(filePath, { mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.log('Save to files process failed or cancelled', error);
      Alert.alert(
        'Error Saving',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, []);

  const handleGeneratePdf = useCallback(async () => {
    try {
      const options = {
        pageSize: 'A4' as const,
        fileName: `demo-${Date.now()}`,
        ...(isCustomTheme && {
          theme: {
            fontFamily: 'Helvetica, sans-serif',
            h1: {
              color: '#FF3366',
              borderBottom: '2px solid #FF3366',
              paddingBottom: '10px',
              fontSize: '32px',
            },
            h2: {
              color: '#663399',
              borderBottom: '1px dashed #663399',
            },
            code: {
              backgroundColor: '#1E1E1E',
              color: '#A9FF68',
              borderRadius: '6px',
              fontFamily: 'monospace',
            },
          },
        }),
      };

      const result = await convertToPdf(markdown, options);

      Alert.alert(
        '✅ PDF Generated!',
        `Saved to cache: ${result.filePath}\n\nWhat would you like to do?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share',
            onPress: () =>
              Sharing.shareAsync(result.filePath, {
                mimeType: 'application/pdf',
              }),
          },
          {
            text: Platform.OS === 'android' ? 'Save to Files' : 'Save/Share',
            onPress: () => saveToFiles(result.filePath),
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('❌ PDF Error', message);
    }
  }, [markdown, convertToPdf, saveToFiles, isCustomTheme]);

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

        {/* Options */}
        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.toggle, isCustomTheme && styles.toggleActive]}
            onPress={() => setIsCustomTheme(!isCustomTheme)}
            activeOpacity={0.8}
          >
            <View
              style={[styles.checkbox, isCustomTheme && styles.checkboxActive]}
            >
              {isCustomTheme && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.toggleLabel}>
              Use Custom Theme (Pink/Purple)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerateHtml}
            activeOpacity={0.8}
          >
            <Text style={styles.generateBtnText}>⚡ HTML</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.generateBtn, styles.pdfBtn]}
            onPress={handleGeneratePdf}
            activeOpacity={0.8}
            disabled={isConverting}
          >
            {isConverting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.generateBtnText}>📄 PDF</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* HTML Preview */}
        {!!htmlOutput && (
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
  options: {
    marginBottom: 20,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  toggleActive: {
    borderColor: '#6c63ff',
    backgroundColor: '#252540',
  },
  toggleLabel: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#6c63ff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  generateBtn: {
    flex: 1,
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  pdfBtn: {
    backgroundColor: '#e74c3c',
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
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  clearBtnText: {
    color: '#8888aa',
    fontSize: 18,
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
