import type { Reminder, CarStatus } from "@/types";
import { daysUntil } from "./date";

/** Calculeaza statusul unei masini din lista ei de remindere */
export function computeCarStatus(reminders: Reminder[]): CarStatus {
  let status: CarStatus = "ok";
  for (const r of reminders) {
    if (r.status === "done") continue;
    const d = daysUntil(r.dueDate);
    if (d < 0) return "overdue";
    if (d <= 30) status = "expiring";
    if (d <= 14 && (r.type === "SERVICE" || r.type === "OIL_CHANGE")) status = "service";
  }
  return status;
}

export const STATUS_META: Record<CarStatus, { label: string; color: string; bg: string }> = {
  ok: { label: "Totul este în regulă", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  expiring: { label: "Expiră curând", color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
  overdue: { label: "Restant", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  service: { label: "Necesită service", color: "#7FA8FF", bg: "rgba(127,168,255,0.12)" },
};
