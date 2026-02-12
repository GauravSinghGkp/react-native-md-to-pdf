import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';

interface HtmlPreviewProps {
  html: string;
}

export function HtmlPreview({ html }: HtmlPreviewProps) {
  if (!html) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Generated HTML</Text>
      <View style={styles.preview}>
        <ScrollView nestedScrollEnabled style={styles.previewScroll}>
          <Text style={styles.previewText} selectable>
            {html}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  preview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  previewScroll: {
    maxHeight: 400,
    padding: 16,
  },
  previewText: {
    color: '#333',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
});
