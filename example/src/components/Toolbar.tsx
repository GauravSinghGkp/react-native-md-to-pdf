import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { THEMES, type ThemeKey } from '../constants/theme';

interface ToolbarProps {
  onGenerateHtml: () => void;
  onGeneratePdf: () => void;
  isConverting: boolean;
  selectedTheme: ThemeKey | undefined;
  onSelectTheme: (theme: ThemeKey | undefined) => void;
}

export function Toolbar({
  onGenerateHtml,
  onGeneratePdf,
  isConverting,
  selectedTheme,
  onSelectTheme,
}: ToolbarProps) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Select Theme</Text>
      <ScrollView
        horizontal
        style={styles.themeScroll}
        contentContainerStyle={styles.themeContainer}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.themeBtn,
            selectedTheme === undefined && styles.themeBtnActive,
          ]}
          onPress={() => onSelectTheme(undefined)}
          activeOpacity={0.8}
        >
          <View style={[styles.colorDot, { backgroundColor: '#888' }]} />
          <Text
            style={[
              styles.themeText,
              selectedTheme === undefined && styles.themeTextActive,
            ]}
          >
            Default
          </Text>
        </TouchableOpacity>

        {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
          const theme = THEMES[key];
          const isActive = selectedTheme === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.themeBtn, isActive && styles.themeBtnActive]}
              onPress={() => onSelectTheme(key)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.colorDot, { backgroundColor: theme.color }]}
              />
              <Text
                style={[styles.themeText, isActive && styles.themeTextActive]}
              >
                {theme.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  themeScroll: {
    marginBottom: 20,
  },
  themeContainer: {
    gap: 8,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  themeBtnActive: {
    borderColor: '#6c63ff',
    backgroundColor: '#eff0ff',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  themeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  themeTextActive: {
    color: '#6c63ff',
    fontWeight: '600',
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
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfBtn: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  clearBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearBtnText: {
    color: '#888',
    fontSize: 18,
    fontWeight: '600',
  },
});
