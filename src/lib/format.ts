export function formatRON(amount: number | undefined | null): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON", maximumFractionDigits: 2 }).format(amount);
}

export function formatNumber(n: number | undefined | null, digits = 2): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: digits }).format(n);
}

export function formatMileage(km: number | undefined | null): string {
  if (km == null) return "—";
  return `${new Intl.NumberFormat("ro-RO").format(km)} km`;
}
