/**
 * mockOcrService.ts
 * Fallback DOAR pentru DEV / cand OCR-ul nativ nu e disponibil (Expo Go)
 * sau cand utilizatorul activeaza "Folosește bon demo" din setari developer.
 */
import { RECEIPT_EXAMPLES } from "@/services/receipts/examples";

let forcedIndex: number | null = null;

/** Permite forțarea unui exemplu anume din developer settings */
export function setMockReceiptIndex(i: number | null) {
  forcedIndex = i;
}

export async function mockExtractText(_imageUri: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 900)); // simulam procesarea
  const idx = forcedIndex ?? Math.floor(Math.random() * RECEIPT_EXAMPLES.length);
  return RECEIPT_EXAMPLES[idx].text.split("\n");
}
