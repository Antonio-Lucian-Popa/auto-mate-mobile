import { useQuery } from "@tanstack/react-query";
import { fleetApi } from "@/services/api/fleet";
import type { FleetCar } from "@/types";

export function useFleetOverview(enabled = true) {
  return useQuery<FleetCar[]>({
    queryKey: ["fleet", "overview"],
    queryFn: () => fleetApi.overview(),
    staleTime: 60_000,
    enabled,
  });
}
