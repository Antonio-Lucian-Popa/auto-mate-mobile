/** Helperi pentru transformarea datelor în serii pentru grafice */

const MONTHS_SHORT = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];

/** Ultimele `count` luni (inclusiv luna curentă) ca chei YYYY-MM + etichetă scurtă */
export function lastMonths(count: number): { ym: string; label: string }[] {
  const out: { ym: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ ym, label: MONTHS_SHORT[d.getMonth()] });
  }
  return out;
}

/** Sumă pe lună dintr-o listă de înregistrări cu `date` (ISO) și o valoare numerică */
export function sumByMonth<T>(
  items: T[],
  count: number,
  getDate: (x: T) => string,
  getValue: (x: T) => number
): { label: string; value: number }[] {
  const months = lastMonths(count);
  const totals: Record<string, number> = {};
  for (const it of items) {
    const ym = getDate(it).slice(0, 7);
    totals[ym] = (totals[ym] ?? 0) + getValue(it);
  }
  return months.map((m) => ({ label: m.label, value: Math.round((totals[m.ym] ?? 0) * 100) / 100 }));
}

export function shortMonthLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}
