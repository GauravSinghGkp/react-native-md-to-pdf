import type { ThemeConfig } from 'react-native-md-to-pdf';

export const CUSTOM_THEME: ThemeConfig = {
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
};
