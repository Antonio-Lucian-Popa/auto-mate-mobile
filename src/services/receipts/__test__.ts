/** Rulează: npm run test:parser */
import { parseReceipt } from "./receiptParser";
import { RECEIPT_EXAMPLES } from "./examples";

let ok = 0;
for (const ex of RECEIPT_EXAMPLES) {
  const r = parseReceipt(ex.text);
  const has = r.total != null;
  console.log(`${has ? "✓" : "✗"} ${ex.label} -> ${r.merchant ?? "?"} | ${r.fuelType ?? "?"} | ${r.liters ?? "?"}L | ${r.total ?? "?"} RON`);
  if (has) ok++;
}
console.log(`\n${ok}/${RECEIPT_EXAMPLES.length} bonuri parsate cu succes.`);
