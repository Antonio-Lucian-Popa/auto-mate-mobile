const MS_DAY = 86_400_000;

export function daysUntil(iso: string): number {
  const due = new Date(iso);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / MS_DAY);
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

/** Text RO de tip "Expiră în X zile" / "Restant de X zile" / "Expiră azi" */
export function expiryLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d === 0) return "Expiră azi";
  if (d < 0) return `Restant de ${Math.abs(d)} zile`;
  if (d === 1) return "Expiră mâine";
  return `Expiră în ${d} zile`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
