/** Mic helper pentru concatenarea conditionata a claselor */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
