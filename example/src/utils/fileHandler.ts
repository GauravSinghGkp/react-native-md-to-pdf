import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Directory, File } from 'expo-file-system';
import { Buffer } from 'buffer';

/**
 * Polyfill for `atob` if not available (e.g. Hermes).
 */
function atob(input: string): string {
  if (global.atob) {
    return global.atob(input);
  }
  return Buffer.from(input, 'base64').toString('binary');
}

/**
 * Save a PDF file to the device or share it.
 *
 * - Android: Prompts user to pick a directory and saves the file via SAF.
 * - iOS: Opens the system share sheet.
 *
 * @param filePath - Absolute path to the generated PDF file.
 */
export async function savePdfToDevice(filePath: string): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      const directory = await Directory.pickDirectoryAsync();
      if (directory) {
        const fileName = `markdown-export-${Date.now()}.pdf`;

        // Read source file as base64 using modern File API
        const sourceFile = new File(filePath);
        const base64 = await sourceFile.base64();

        // Convert base64 to Uint8Array
        const binaryString = atob(base64);
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
}
