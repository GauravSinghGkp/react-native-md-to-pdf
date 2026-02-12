import { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useMdToPdf } from 'react-native-md-to-pdf';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { MarkdownEditor } from './components/MarkdownEditor';
import { HtmlPreview } from './components/HtmlPreview';
import { Toolbar } from './components/Toolbar';
import { savePdfToDevice, sharePdf } from './utils/fileHandler';
import { THEMES, type ThemeKey } from './constants/theme';

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
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | undefined>(
    undefined
  );

  // Use the library hook
  const { convertToHtml, convertToPdf, isConverting } = useMdToPdf();

  const handleGenerateHtml = useCallback(() => {
    try {
      const theme = selectedTheme ? THEMES[selectedTheme].config : undefined;
      const fullDoc = convertToHtml(markdown, theme);
      setHtmlOutput(fullDoc);
      setShowHtmlModal(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', message);
    }
  }, [markdown, convertToHtml, selectedTheme]);

  const handleGeneratePdf = useCallback(async () => {
    try {
      const options = {
        pageSize: 'A4' as const,
        fileName: `demo-${Date.now()}`,
        ...(selectedTheme && {
          theme: THEMES[selectedTheme].config,
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
            onPress: () => sharePdf(result.filePath),
          },
          {
            text: 'Save to Files',
            onPress: () => savePdfToDevice(result.filePath),
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('❌ PDF Error', message);
    }
  }, [markdown, convertToPdf, selectedTheme]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.safe}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>📄 MD → PDF</Text>
              <Text style={styles.headerSub}>react-native-md-to-pdf demo</Text>
            </View>

            <MarkdownEditor value={markdown} onChange={setMarkdown} />

            <Toolbar
              onGenerateHtml={handleGenerateHtml}
              onGeneratePdf={handleGeneratePdf}
              isConverting={isConverting}
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
            />
          </View>
        </KeyboardAvoidingView>

        {/* HTML Preview Modal */}
        <Modal
          visible={showHtmlModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>HTML Preview</Text>
              <TouchableOpacity
                onPress={() => setShowHtmlModal(false)}
                style={styles.closeBtn}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <HtmlPreview html={htmlOutput} />
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  // Modal Styles
  modalSafe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeBtn: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
});
