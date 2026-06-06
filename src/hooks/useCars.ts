import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { carsApi, type CarInput } from "@/services/api/cars";

export function useCars() {
  return useQuery({ queryKey: ["cars"], queryFn: carsApi.list });
}

export function useCar(id: string) {
  return useQuery({ queryKey: ["cars", id], queryFn: () => carsApi.get(id), enabled: !!id });
}

export function useCreateCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CarInput) => carsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cars"] }),
  });
}

export function useUpdateCar(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CarInput>) => carsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cars"] });
      qc.invalidateQueries({ queryKey: ["cars", id] });
    },
  });
}

export function useDeleteCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => carsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cars"] }),
  });
}
