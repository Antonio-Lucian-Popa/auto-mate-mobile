import { apiRequest } from "./client";
import type { OcrResult } from "@/types";

export const ocrApi = {
  scanReceipt: (imageUrl: string) =>
    apiRequest<OcrResult>("/ocr/receipt", { method: "POST", body: { imageUrl } }),
};
