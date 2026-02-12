import type { ThemeConfig } from 'react-native-md-to-pdf';

// 1. Blue Theme (Clean & Professional)
export const THEME_BLUE: ThemeConfig = {
  fontFamily: 'Helvetica, sans-serif',
  h1: {
    color: '#2c3e50',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
  },
  h2: { color: '#2980b9' },
  a: { color: '#3498db', textDecoration: 'none' },
  code: { backgroundColor: '#f0f4f8', color: '#2c3e50', borderRadius: '4px' },
};

// 2. Red Theme (Funky & Bold)
export const THEME_RED: ThemeConfig = {
  fontFamily: 'Comic Sans MS, cursive, sans-serif',
  h1: { color: '#e74c3c', textDecoration: 'underline wavy #e74c3c' },
  h2: {
    color: '#c0392b',
    borderLeft: '5px solid #e74c3c',
    paddingLeft: '10px',
  },
  blockquote: { borderLeft: '4px solid #f1c40f', backgroundColor: '#fff9c4' },
  code: { backgroundColor: '#2c3e50', color: '#e74c3c', borderRadius: '6px' },
};

// 3. Forest Theme (Nature & Green)
export const THEME_FOREST: ThemeConfig = {
  fontFamily: 'Georgia, serif',
  h1: {
    color: '#2ecc71',
    borderBottom: '2px dashed #27ae60',
    paddingBottom: '5px',
  },
  h2: { color: '#27ae60' },
  code: { backgroundColor: '#e8f5e9', color: '#1b5e20', borderRadius: '4px' },
  blockquote: {
    borderLeft: '4px solid #66bb6a',
    backgroundColor: '#f1f8e9',
    color: '#33691e',
  },
};

// 4. Dark Theme (Developer Friendly)
export const THEME_DARK: ThemeConfig = {
  colors: {
    text: '#ecf0f1',
    background: '#2c3e50',
    code: '#e74c3c',
    codeBackground: '#34495e',
  },
  h1: {
    color: '#ecf0f1',
    borderBottom: '1px solid #7f8c8d',
    paddingBottom: '10px',
  },
  h2: { color: '#bdc3c7' },
  code: { fontFamily: 'monospace' },
};

export const THEMES = {
  blue: { label: 'Blue', config: THEME_BLUE, color: '#3498db' },
  red: { label: 'Funky', config: THEME_RED, color: '#e74c3c' },
  forest: { label: 'Forest', config: THEME_FOREST, color: '#2ecc71' },
  dark: { label: 'Dark', config: THEME_DARK, color: '#34495e' },
};

export type ThemeKey = keyof typeof THEMES;
