import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/services/api/reports";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsApi.list(),
  });
}

export function useGenerateTripReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => reportsApi.generateForTrip(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useGenerateMonthlyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ month, userId }: { month: string; userId?: string }) =>
      reportsApi.generateMonthly(month, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}
