/**
 * Manual mock for expo-file-system (used in tests).
 */
export const readAsStringAsync = jest.fn();
export const copyAsync = jest.fn();
export const cacheDirectory = '/cache/';
export const documentDirectory = '/documents/';
export const EncodingType = { Base64: 'base64' };
