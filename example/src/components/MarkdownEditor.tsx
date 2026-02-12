import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  type TextInputProps,
} from 'react-native';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  style?: TextInputProps['style'];
}

export function MarkdownEditor({
  value,
  onChange,
  style,
}: MarkdownEditorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Markdown Input</Text>
      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={onChange}
        multiline
        placeholder="Paste or type your markdown here…"
        placeholderTextColor="#999"
      />
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
});
