import { useQuery } from "@tanstack/react-query";
import { fleetApi } from "@/services/api/fleet";

export function useFleetOverview() {
  return useQuery({
    queryKey: ["fleet", "overview"],
    queryFn: () => fleetApi.overview(),
    staleTime: 60_000,
  });
}
