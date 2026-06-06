/**
 * receiptParser.ts
 * Parsare reguli + regex pentru bonuri fiscale RO (carburant).
 * Fara AI, fara API platite. Functioneaza pe textul OCR brut.
 */

export type ParsedReceipt = {
  type: "fuel" | "service" | "other";
  merchant?: string;
  date?: string; // ISO yyyy-mm-dd
  total?: number;
  currency: "RON";
  fuelType?: "benzina" | "motorina" | "gpl" | "electric" | "unknown";
  liters?: number;
  pricePerLiter?: number;
  receiptNumber?: string;
  sourceImageUri?: string;
  rawText: string;
  confidence: {
    merchant: "high" | "medium" | "low";
    date: "high" | "medium" | "low";
    total: "high" | "medium" | "low";
    liters: "high" | "medium" | "low";
    pricePerLiter: "high" | "medium" | "low";
  };
};

type Conf = "high" | "medium" | "low";

const STATIONS: { name: string; aliases: string[] }[] = [
  { name: "OMV", aliases: ["omv"] },
  { name: "Petrom", aliases: ["petrom", "omv petrom"] },
  { name: "MOL", aliases: ["mol", "mol romania"] },
  { name: "Rompetrol", aliases: ["rompetrol", "rompetrol downstream", "kmg"] },
  { name: "Lukoil", aliases: ["lukoil"] },
  { name: "Socar", aliases: ["socar"] },
  { name: "Gazprom", aliases: ["gazprom"] },
  { name: "Shell", aliases: ["shell"] },
];

/** Normalizeaza un numar romanesc "1.234,56" / "1234,56" / "1234.56" -> 1234.56 */
function parseRoNumber(raw: string): number | undefined {
  let s = raw.trim().replace(/\s/g, "");
  if (!s) return undefined;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // ultimul separator e cel zecimal
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

function detectMerchant(text: string): { value?: string; confidence: Conf } {
  const lower = text.toLowerCase();
  for (const st of STATIONS) {
    for (const alias of st.aliases) {
      if (lower.includes(alias)) {
        return { value: st.name, confidence: "high" };
      }
    }
  }
  // fallback: prima linie cu litere mari care nu e adresa
  const firstLine = text.split("\n").map((l) => l.trim()).find((l) => l.length > 2 && /[A-Za-z]/.test(l));
  if (firstLine) return { value: firstLine.slice(0, 40), confidence: "low" };
  return { confidence: "low" };
}

function detectDate(text: string): { value?: string; confidence: Conf } {
  // dd.mm.yyyy / dd-mm-yyyy / dd/mm/yyyy
  const dmy = text.match(/\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})\b/);
  if (dmy) {
    let [, d, m, y] = dmy;
    if (y.length === 2) y = "20" + y;
    const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return { value: iso, confidence: "high" };
  }
  // yyyy-mm-dd
  const ymd = text.match(/\b(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\b/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return { value: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`, confidence: "high" };
  }
  return { confidence: "low" };
}

function detectTotal(text: string): { value?: number; confidence: Conf } {
  const lines = text.split("\n");
  // cauta linia cu TOTAL (dar nu SUBTOTAL/TOTAL TVA daca exista alt total)
  const candidates: { val: number; conf: Conf }[] = [];
  for (const line of lines) {
    const l = line.toLowerCase();
    const num = line.match(/(\d[\d.\s]*,\d{2}|\d+\.\d{2})/);
    if (!num) continue;
    const val = parseRoNumber(num[1]);
    if (val === undefined) continue;
    if (/\btotal\b/.test(l) && !/tva|t\.v\.a|subtotal/.test(l)) {
      candidates.push({ val, conf: "high" });
    } else if (/de\s*plata|de plata|suma/.test(l)) {
      candidates.push({ val, conf: "high" });
    }
  }
  if (candidates.length) {
    // alege cel mai mare total marcat high
    const high = candidates.filter((c) => c.conf === "high").sort((a, b) => b.val - a.val)[0];
    return { value: high.val, confidence: "high" };
  }
  // fallback: cel mai mare numar cu 2 zecimale din text
  const all = [...text.matchAll(/(\d[\d.\s]*,\d{2}|\d+\.\d{2})/g)]
    .map((m) => parseRoNumber(m[1]))
    .filter((n): n is number => n !== undefined);
  if (all.length) return { value: Math.max(...all), confidence: "low" };
  return { confidence: "low" };
}

function detectFuelType(text: string): ParsedReceipt["fuelType"] {
  const l = text.toLowerCase();
  // ordinea conteaza: termenii specifici inainte de cei generici
  if (/electric|kwh|incarcare/.test(l)) return "electric";
  if (/\bgpl\b|autogaz|\blpg\b/.test(l)) return "gpl";
  if (/motorin|diesel|diezel/.test(l)) return "motorina";
  if (/benzin|euro\s*95|euro\s*98|efix\s*95|top\s*95|top\s*euro/.test(l)) return "benzina";
  return "unknown";
}

function detectLiters(text: string): { value?: number; confidence: Conf } {
  // "Cantitate 30,52 L" / "30.52 L" / "Litri 12,3"
  const m =
    text.match(/(?:cantitate|litri|qty|cant\.?)\D{0,6}(\d[\d.]*,\d{1,3}|\d+\.\d{1,3}|\d+)/i) ||
    text.match(/(\d[\d.]*,\d{1,3}|\d+\.\d{1,3})\s*(?:l\b|litri|litru)/i);
  if (m) {
    const v = parseRoNumber(m[1]);
    if (v !== undefined && v > 0 && v < 1000) return { value: v, confidence: "high" };
  }
  return { confidence: "low" };
}

function detectPricePerLiter(text: string): { value?: number; confidence: Conf } {
  // "7,49 RON/L" / "Pret unitar 7,49" / "7.49 lei/l"
  const m =
    text.match(/(\d+[.,]\d{2,3})\s*(?:ron|lei)\s*\/?\s*(?:l\b|litru)/i) ||
    text.match(/(?:pret\s*unitar|p\.?u\.?|pret\/l)\D{0,8}(\d+[.,]\d{2,3})/i) ||
    text.match(/(\d+[.,]\d{2,3})\s*\/\s*l\b/i);
  if (m) {
    const v = parseRoNumber(m[1]);
    if (v !== undefined && v > 0 && v < 100) return { value: v, confidence: "high" };
  }
  return { confidence: "low" };
}

function detectReceiptNumber(text: string): string | undefined {
  const m =
    text.match(/(?:bon\s*fiscal\s*nr\.?|bf\s*nr\.?|nr\.?\s*bon|bon\s*nr\.?)\s*[:#]?\s*([0-9][A-Z0-9\-]{0,19})/i) ||
    text.match(/\b(?:nr|no)\.?\s*bon\s*[:#]?\s*([0-9]{1,12})\b/i) ||
    text.match(/\bbon\b\D{0,4}([0-9]{3,12})\b/i);
  return m ? m[1] : undefined;
}

export function parseReceipt(rawText: string): ParsedReceipt {
  const merchant = detectMerchant(rawText);
  const date = detectDate(rawText);
  const total = detectTotal(rawText);
  const liters = detectLiters(rawText);
  const ppl = detectPricePerLiter(rawText);
  const fuelType = detectFuelType(rawText);
  const receiptNumber = detectReceiptNumber(rawText);

  // Daca avem 2 din 3 (total/litri/pret), cross-validam si crestem increderea
  let totalVal = total.value;
  let litersVal = liters.value;
  let pplVal = ppl.value;
  if (litersVal && pplVal && !totalVal) totalVal = Math.round(litersVal * pplVal * 100) / 100;
  if (totalVal && litersVal && !pplVal) pplVal = Math.round((totalVal / litersVal) * 100) / 100;
  if (totalVal && pplVal && !litersVal) litersVal = Math.round((totalVal / pplVal) * 100) / 100;

  const isFuel = fuelType !== "unknown" || (!!litersVal && !!pplVal);

  return {
    type: isFuel ? "fuel" : "other",
    merchant: merchant.value,
    date: date.value,
    total: totalVal,
    currency: "RON",
    fuelType: isFuel ? fuelType : undefined,
    liters: litersVal,
    pricePerLiter: pplVal,
    receiptNumber,
    rawText,
    confidence: {
      merchant: merchant.confidence,
      date: date.confidence,
      total: total.confidence === "low" && totalVal ? "medium" : total.confidence,
      liters: liters.confidence === "low" && litersVal ? "medium" : liters.confidence,
      pricePerLiter: ppl.confidence === "low" && pplVal ? "medium" : ppl.confidence,
    },
  };
}
