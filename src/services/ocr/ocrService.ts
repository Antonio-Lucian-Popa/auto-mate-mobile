/**
 * ocrService.ts
 * OCR REAL, on-device. Foloseste expo-text-extractor:
 *  - Android: Google ML Kit
 *  - iOS: Apple Vision
 * Fara API platite, fara cloud. NU functioneaza in Expo Go -> necesita dev build.
 */
import { mockExtractText } from "./mockOcrService";

export type OcrResult = {
  rawText: string;
  lines: string[];
  sourceImageUri: string;
};

let extractor: { extractTextFromImage: (uri: string) => Promise<string[]>; isSupported: boolean } | null = null;
try {
  // import lazy ca sa nu crape in medii fara modulul nativ
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  extractor = require("expo-text-extractor");
} catch {
  extractor = null;
}

export function isOcrSupported(): boolean {
  return !!extractor?.isSupported;
}

export async function extractTextFromReceiptImage(imageUri: string): Promise<OcrResult> {
  if (!extractor || !extractor.isSupported) {
    if (__DEV__) {
      // fallback DEV: nu blocam dezvoltarea cand modulul nativ lipseste (ex. Expo Go)
      const lines = await mockExtractText(imageUri);
      return { rawText: lines.join("\n"), lines, sourceImageUri: imageUri };
    }
    throw new Error("OCR nu este disponibil pe acest dispozitiv.");
  }

  const lines = await extractor.extractTextFromImage(imageUri);
  return {
    rawText: lines.join("\n"),
    lines,
    sourceImageUri: imageUri,
  };
}
