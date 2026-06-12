import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsApi, type TripInput, type TripFilters } from "@/services/api/trips";

export function useTrips(filters?: TripFilters) {
  return useQuery({
    queryKey: ["trips", filters],
    queryFn: () => tripsApi.list(filters),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trips", id],
    queryFn: () => tripsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TripInput) => tripsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTrip(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TripInput>) => tripsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useCloseTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, kmEnd }: { id: string; kmEnd?: number }) => tripsApi.close(id, kmEnd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useSubmitTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useApproveTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useRejectTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => tripsApi.reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}
