import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface ToolbarProps {
  onGenerateHtml: () => void;
  onGeneratePdf: () => void;
  onClear: () => void;
  isConverting: boolean;
  isCustomTheme: boolean;
  onToggleTheme: () => void;
}

export function Toolbar({
  onGenerateHtml,
  onGeneratePdf,
  onClear,
  isConverting,
  isCustomTheme,
  onToggleTheme,
}: ToolbarProps) {
  return (
    <View>
      {/* Theme Toggle */}
      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.toggle, isCustomTheme && styles.toggleActive]}
          onPress={onToggleTheme}
          activeOpacity={0.8}
        >
          <View
            style={[styles.checkbox, isCustomTheme && styles.checkboxActive]}
          >
            {isCustomTheme && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.toggleLabel}>Use Custom Theme (Pink/Purple)</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={onGenerateHtml}
          activeOpacity={0.8}
        >
          <Text style={styles.generateBtnText}>⚡ HTML</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.generateBtn, styles.pdfBtn]}
          onPress={onGeneratePdf}
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
          onPress={onClear}
          activeOpacity={0.8}
        >
          <Text style={styles.clearBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
