import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  type TextInputProps,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    onChange(value + text);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>MARKDOWN INPUT</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handlePaste}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <MaterialIcons name="content-paste" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        style={[styles.input, style, { textAlignVertical: 'top' }]}
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
  container: {
    flex: 1,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    color: '#333',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
