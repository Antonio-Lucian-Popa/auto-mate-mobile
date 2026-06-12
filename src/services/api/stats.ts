import { apiRequest } from "./client";
import type { StatsSummary } from "@/types";

export const statsApi = {
  summary: () => apiRequest<StatsSummary>("/stats/summary"),
};
