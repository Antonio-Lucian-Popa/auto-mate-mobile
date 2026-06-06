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

export function parseNumberInput(value: string): number | undefined {
  const compact = value.trim().replace(/[\s\u00A0]/g, "");
  if (!compact) return undefined;

  let normalized = compact.replace(/[^\d,.-]/g, "");
  const commaIndex = normalized.lastIndexOf(",");
  const dotIndex = normalized.lastIndexOf(".");

  if (commaIndex >= 0 && dotIndex >= 0) {
    if (commaIndex > dotIndex) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (commaIndex >= 0) {
    normalized = normalized.replace(",", ".");
  } else {
    const dots = normalized.match(/\./g)?.length ?? 0;
    if (dots > 1) {
      const lastDot = normalized.lastIndexOf(".");
      normalized = normalized.slice(0, lastDot).replace(/\./g, "") + normalized.slice(lastDot);
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function normalizeNumberInput(value: string, decimals = true): string {
  const clean = value.replace(/[^\d,.]/g, "").replace(/,/g, ".");
  if (!decimals) return clean.replace(/\D/g, "");

  const [first = "", ...rest] = clean.split(".");
  return rest.length ? `${first}.${rest.join("")}` : first;
}
