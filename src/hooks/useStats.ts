import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/services/api/stats";

export function useStats() {
  return useQuery({
    queryKey: ["stats", "summary"],
    queryFn: () => statsApi.summary(),
    staleTime: 60_000,
  });
}
